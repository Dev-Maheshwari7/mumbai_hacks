import requests
from bs4 import BeautifulSoup
import os
import torch
from ddgs import DDGS
from dotenv import load_dotenv
import google.generativeai as genai
import re

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# Twitter API credentials (get from developer.twitter.com)
BEARER_TOKEN = "YOUR_BEARER_TOKEN_HERE"

def scrape_twitter_api(tweet_url):
    """Extract tweet content using Twitter API v2"""
    try:
        # Extract tweet ID from URL
        tweet_id = tweet_url.split('/status/')[-1].split('?')[0]
        
        headers = {
            "Authorization": f"Bearer {BEARER_TOKEN}"
        }
        
        params = {
            "tweet.fields": "created_at,author_id,public_metrics",
            "expansions": "author_id",
            "user.fields": "username,created_at"
        }
        
        url = f"https://api.twitter.com/2/tweets/{tweet_id}"
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            tweet_text = data['data']['text']
            return tweet_text
        else:
            print(f"Error: {response.status_code} - {response.text}")
            return None
    
    except Exception as e:
        print(f"Error with Twitter API: {e}")
        return None

def scrape_twitter_selenium(tweet_url):
    """Fallback: Extract tweet using Selenium (requires JavaScript rendering)"""
    try:
        from selenium import webdriver
        from selenium.webdriver.common.by import By
        from selenium.webdriver.support.ui import WebDriverWait
        from selenium.webdriver.support import expected_conditions as EC
        
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        
        driver = webdriver.Chrome(options=options)
        driver.get(tweet_url)
        
        # Wait for tweet to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//article"))
        )
        
        # Extract tweet text
        tweet_elements = driver.find_elements(By.XPATH, "//article//div[@lang]")
        tweet_text = " ".join([elem.text for elem in tweet_elements])
        
        driver.quit()
        return tweet_text
    
    except ImportError:
        print("Selenium not installed. Install with: pip install selenium")
        return None
    except Exception as e:
        print(f"Error with Selenium: {e}")
        return None

def scrape_content(url):
    """Extract text content from a URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text(separator='\n')
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text
    
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL: {e}")
        return None

def split_into_sentences(text, max_length=512):
    """Split text into chunks suitable for the model"""
    sentences = text.split('.')
    chunks = []
    current_chunk = ""
    
    for sentence in sentences:
        if len(current_chunk) + len(sentence) < max_length:
            current_chunk += sentence + "."
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence + "."
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

# def search_duckduckgo(query):
#     """Search DuckDuckGo for real-time information"""
#     try:
#         ddgs = DDGS()
#         results = ddgs.text(query, max_results=3)
#         search_summary = "\n".join([f"- {r['title']}: {r['body'][:150]}" for r in results])
#         return search_summary
#     except Exception as e:
#         print(f"Error searching DuckDuckGo: {e}")
#         return None

def search_real_time(query: str) -> list:
    """Search the web for real-time information using Serper API"""
    try:
        url = "https://google.serper.dev/search"
        payload = {
            "q": query,
            "num": 5
        }
        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        results = response.json()
        
        # Extract organic search results and return as list
        if "organic" in results:
            search_data = []
            for i, r in enumerate(results["organic"][:3], 1):
                search_data.append({
                    'id': i,
                    'title': r['title'],
                    'snippet': r['snippet'],
                    'link': r.get('link', '')
                })
            return search_data
        else:
            return []
            
    except Exception as e:
        print(f"Search error: {e}")
        return []

def extract_verdict_and_confidence(analysis_text):
    """Extract verdict and confidence from AI analysis"""
    verdict = "UNKNOWN"
    confidence = 0
    
    # Extract verdict
    if "VERDICT:" in analysis_text:
        verdict_match = re.search(r'VERDICT:\s*(TRUE|FALSE)', analysis_text, re.IGNORECASE)
        if verdict_match:
            verdict = verdict_match.group(1).upper()
    
    # Extract confidence if mentioned, otherwise estimate from analysis
    confidence_match = re.search(r'CONFIDENCE:\s*(\d+)%', analysis_text, re.IGNORECASE)
    if confidence_match:
        confidence = int(confidence_match.group(1))
    else:
        # Default confidence based on verdict
        confidence = 85 if verdict in ["TRUE", "FALSE"] else 0
    
    return verdict, confidence

def check_truthfulness(url):
    """Scrape URL and check content truthfulness"""
    print(f"Processing URL: {url}\n")
    
    # Check if it's a Twitter link
    if 'twitter.com' in url or 'x.com' in url:
        print("Detected Twitter/X link. Using Twitter-specific scraper...\n")
        
        if BEARER_TOKEN != "YOUR_BEARER_TOKEN_HERE":
            content = scrape_twitter_api(url)
        else:
            print("No Bearer Token found. Trying Selenium fallback...\n")
            content = scrape_twitter_selenium(url)
    else:
        content = scrape_content(url)
    
    if not content:
        print("Failed to scrape content")
        return
    
    print(f"\nExtracted content:")
    print("-" * 50)
    print(content[:300] + "...\n" if len(content) > 300 else content + "\n")
    print("-" * 50)
    
    print("Loading Gemini 2.5 Flash model for fact-checking...")
    
    # Split content into manageable chunks
    chunks = split_into_sentences(content)
    print(f"Analyzing {len(chunks)} text segments...\n")
    
    results = []
    for i, chunk in enumerate(chunks[:5], 1):  # Limit to 5 for speed
        if len(chunk.strip()) < 10:
            continue
        
        try:
            print(f"Segment {i}: {chunk[:80]}...")
            
            # Search for information
            print(f"  Searching for: '{chunk}'")
            search_results = search_real_time(chunk)
            
            # Format search results for prompt
            search_text = "\n".join([
                f"{r['id']}. {r['title']}: {r['snippet']}"
                for r in search_results
            ]) if search_results else "No search results found"
            
            print(search_text[:100])
            
            # Create prompt with search results
            prompt = f"""You are a professional fact-checker. Analyze this claim and determine if it is TRUE or FALSE based on the search results.

CLAIM: {chunk}

SEARCH RESULTS:
{search_text}

Provide your verdict in this format:
VERDICT: [TRUE/FALSE]
EXPLANATION: [2-3 sentences explaining why]
CONFIDENCE: [percentage 0-100]"""
            
            # Use Gemini 2.5 Flash
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    max_output_tokens=500,
                    temperature=0.1,
                )
            )
            
            answer = response.text
            verdict, confidence = extract_verdict_and_confidence(answer)
            
            # Summarize the claim
            claim_summary = chunk[:100] + "..." if len(chunk) > 100 else chunk
            
            # Extract source IDs from search results
            source_ids = ",".join([str(r['id']) for r in search_results]) if search_results else "None"
            
            results.append({
                'claim': claim_summary,
                'verdict': verdict,
                'confidence': confidence,
                'sources': source_ids,
                'search_results': search_results,
                'analysis': answer
            })
            
            print(f"  Verdict: {verdict} | Confidence: {confidence}%\n")
        
        except Exception as e:
            print(f"Error analyzing segment: {e}\n")
    
    # Summary
    if results:
        print("=" * 50)
        print("FACT-CHECK ANALYSIS COMPLETE")
        print("=" * 50)
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Claim: {result['claim']}")
            print(f"   Verdict: {result['verdict']} | Confidence: {result['confidence']}%")
            print(f"   Sources: {result['sources']}")
    
    return results