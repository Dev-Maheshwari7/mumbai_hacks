"""
WhatsApp Fact-Checking Bot using Twilio Free Sandbox
File: whatsapp_bot.py

FREE SETUP INSTRUCTIONS:
1. Create free Twilio account: https://www.twilio.com/try-twilio
2. Go to Twilio Console -> Messaging -> Try it out -> Send a WhatsApp message
3. Follow instructions to join your WhatsApp sandbox (send code to sandbox number)
4. Get your Account SID and Auth Token from Twilio Console
5. Add to .env file:
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886 (sandbox number)
6. Install ngrok: https://ngrok.com/download (free)
7. Run: ngrok http 5000
8. Copy ngrok URL and set as webhook in Twilio Console

Note: Twilio free tier includes sandbox WhatsApp for testing
"""

from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import re
from duckduckgo_search import DDGS

load_dotenv()

# Twilio Configuration
TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Store conversation history (in production, use Redis or database)
conversation_store = {}

def detect_urls(text):
    """Detect URLs in text"""
    url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
    return url_pattern.findall(text)

def scrape_url_content(url):
    """Extract text content from a URL"""
    try:
        # Check if it's an X/Twitter URL
        if 'twitter.com' in url or 'x.com' in url:
            return scrape_twitter_content(url)
        
        # Regular HTTP scraping for other sites
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(['script', 'style', 'nav', 'footer', 'header']):
            script.decompose()
        
        # Get text
        text = soup.get_text()
        
        # Clean up text
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Limit text length to avoid token limits
        max_chars = 5000
        if len(text) > max_chars:
            text = text[:max_chars] + "... [content truncated]"
        
        return text
    except Exception as e:
        return f"Error scraping URL: {str(e)}"

def scrape_twitter_content(url):
    """Scrape X/Twitter content using Selenium"""
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.common.exceptions import TimeoutException
    from webdriver_manager.chrome import ChromeDriverManager
    
    try:
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)
        
        wait = WebDriverWait(driver, 10)
        
        try:
            tweet_selectors = [
                "article[data-testid='tweet']",
                "div[data-testid='tweetText']",
                "div[lang]",
                "article div[lang]"
            ]
            
            content = ""
            for selector in tweet_selectors:
                try:
                    elements = driver.find_elements(By.CSS_SELECTOR, selector)
                    if elements:
                        for elem in elements[:3]:
                            text = elem.text.strip()
                            if text and len(text) > 10:
                                content += text + "\n\n"
                        if content:
                            break
                except:
                    continue
            
            driver.quit()
            
            if content:
                return content.strip()
            else:
                return "Could not extract tweet content. Please copy and paste the claim text."
                
        except TimeoutException:
            driver.quit()
            return "Timeout while loading tweet. Please copy and paste the claim text."
            
    except Exception as e:
        return f"Error scraping Twitter/X: {str(e)}"

def search_duckduckgo(query, max_results=3):
    """Search DuckDuckGo for real-time information"""
    try:
        with DDGS() as ddgs:
            results = []
            for r in ddgs.text(query, max_results=max_results):
                results.append({
                    'title': r.get('title', ''),
                    'body': r.get('body', ''),
                    'url': r.get('href', '')
                })
            return results
    except Exception as e:
        print(f"DuckDuckGo search error: {str(e)}")
        return []

def fact_check_message(user_message, phone_number):
    """Fact-check a message using Gemini AI"""
    try:
        # Get or create conversation history
        if phone_number not in conversation_store:
            conversation_store[phone_number] = []
        
        conversation_history = conversation_store[phone_number]
        
        # Detect URLs in the message
        urls = detect_urls(user_message)
        enhanced_message = user_message
        search_results_text = ""
        
        if urls:
            # URL found - use scraping only
            scraped_content = ""
            for url in urls:
                content = scrape_url_content(url)
                if "Error scraping" not in content:
                    scraped_content += f"\n\n--- Content from {url} ---\n{content}\n"
            
            if scraped_content:
                enhanced_message = f"{user_message}\n\nI've extracted the following content:{scraped_content}"
        else:
            # No URL - perform DuckDuckGo search
            try:
                search_query = user_message[:150]
                search_results = search_duckduckgo(search_query, max_results=3)
                
                if search_results:
                    search_results_text = "\n\n--- Web Search Results ---\n"
                    for i, result in enumerate(search_results, 1):
                        search_results_text += f"\n{i}. {result['title']}\n{result['body']}\n"
                    
                    enhanced_message += search_results_text
            except Exception as search_error:
                print(f"Search error: {str(search_error)}")
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        system_prompt = """You are an expert AI fact-checking agent on WhatsApp. Your job is to:
1. Analyze claims about health, science, politics, or any topic
2. Provide evidence-based fact-checking
3. Give a clear verdict: TRUE, FALSE, MISLEADING, PARTIALLY TRUE, or UNVERIFIABLE
4. Be conversational and friendly
5. Keep responses SHORT (max 1500 characters for WhatsApp)

When fact-checking:
- First line should clearly state if claim is True or False
- Give concise explanations
- No special characters like * or #
- Keep it simple and clear

If a URL can't be accessed, ask user to copy and paste the claim text."""
        
        # Prepare messages
        messages = [{"role": msg["role"], "content": msg["content"]} for msg in conversation_history[-5:]]  # Last 5 messages
        messages.append({"role": "user", "content": enhanced_message})
        
        # Generate response
        response = model.generate_content(system_prompt + "\n\nConversation:\n" + 
                                         "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages]))
        
        ai_response = response.text
        
        # Store conversation
        conversation_store[phone_number].append({"role": "user", "content": user_message})
        conversation_store[phone_number].append({"role": "assistant", "content": ai_response})
        
        # Keep only last 10 messages to save memory
        if len(conversation_store[phone_number]) > 10:
            conversation_store[phone_number] = conversation_store[phone_number][-10:]
        
        return ai_response
        
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"

def create_whatsapp_app():
    """Create Flask app for WhatsApp webhook"""
    app = Flask(__name__)
    
    @app.route('/whatsapp', methods=['POST'])
    def whatsapp_webhook():
        """Handle incoming WhatsApp messages"""
        try:
            incoming_msg = request.values.get('Body', '').strip()
            from_number = request.values.get('From', '')
            
            print(f"Received message from {from_number}: {incoming_msg}")
            
            # Handle commands
            if incoming_msg.lower() == 'help':
                response_text = """🔍 Fact-Checking Bot Commands:

• Send any claim to fact-check
• Share a URL to analyze
• Type 'clear' to reset conversation
• Type 'help' to see this message

Example:
"Does drinking lemon water cure cancer?"
"https://example.com/article"
"""
            elif incoming_msg.lower() == 'clear':
                if from_number in conversation_store:
                    conversation_store[from_number] = []
                response_text = "✅ Conversation cleared! Send me a new claim to fact-check."
            else:
                # Fact-check the message
                response_text = fact_check_message(incoming_msg, from_number)
            
            # Create Twilio response
            resp = MessagingResponse()
            resp.message(response_text)
            
            return str(resp)
            
        except Exception as e:
            print(f"Error: {str(e)}")
            resp = MessagingResponse()
            resp.message("Sorry, I encountered an error processing your message. Please try again.")
            return str(resp)
    
    @app.route('/whatsapp/status', methods=['POST'])
    def whatsapp_status():
        """Handle message status callbacks"""
        return '', 200
    
    @app.route('/')
    def home():
        return """
        <h1>WhatsApp Fact-Checking Bot</h1>
        <p>Bot is running! Configure your Twilio webhook to point to /whatsapp</p>
        <h2>Setup Instructions:</h2>
        <ol>
            <li>Create free Twilio account at https://www.twilio.com/try-twilio</li>
            <li>Go to Twilio Console -> Messaging -> Try WhatsApp</li>
            <li>Join your sandbox by sending the code to the sandbox number</li>
            <li>Install ngrok: https://ngrok.com/download</li>
            <li>Run: ngrok http 5000</li>
            <li>Copy ngrok URL and set as webhook in Twilio Console</li>
            <li>Webhook URL should be: https://your-ngrok-url.ngrok.io/whatsapp</li>
        </ol>
        """
    
    return app

if __name__ == '__main__':
    whatsapp_app = create_whatsapp_app()
    print("🤖 WhatsApp Fact-Checking Bot Starting...")
    print("📱 Make sure to configure Twilio webhook to point to this server")
    whatsapp_app.run(debug=True, host='0.0.0.0', port=5001)
