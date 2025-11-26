import requests
from bs4 import BeautifulSoup
from transformers import pipeline
import os
import torch
from ddgs import DDGS
import os

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


def search_duckduckgo(query):
    """Search DuckDuckGo for real-time information"""
    try:
        ddgs = DDGS()
        results = ddgs.text(query, max_results=3)
        search_summary = "\n".join([f"- {r['title']}: {r['body'][:150]}" for r in results])
        return search_summary
    except Exception as e:
        print(f"Error searching DuckDuckGo: {e}")
        return None
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
    
    # Load text generation model (Phi-3.5 mini - better for fact-checking)
    print("Loading Phi-3.5 mini model for fact-checking...")
    generator = pipeline("text-generation", 
                        model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                        device=0 if torch.cuda.is_available() else -1,
                        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)
    
    # Split content into manageable chunks
    chunks = split_into_sentences(content)
    print(f"Analyzing {len(chunks)} text segments...\n")
    
    results = []
    for i, chunk in enumerate(chunks[:5], 1):  # Limit to 5 for speed
        if len(chunk.strip()) < 10:
            continue
        
        try:
            print(f"Segment {i}: {chunk[:80]}...")
            
            # Search DuckDuckGo for real-time information
            print(f"  Searching DuckDuckGo for: '{chunk}'")
            search_results = search_duckduckgo(chunk)
            
            search_context = f"\nSearch results:\n{search_results}" if search_results else ""
            
            # Create prompt with search results
            prompt = f"""<|user|>
You are a professional fact-checker. Analyze this claim and determine if it is TRUE or FALSE based on the search results.

CLAIM: {chunk}

SEARCH RESULTS:
{search_results if search_results else 'No search results found'}

Provide your verdict in this format:
VERDICT: [TRUE/FALSE]
EXPLANATION: [2-3 sentences explaining why]
<|end|>
<|assistant|>"""
            
            response = generator(prompt, max_new_tokens=200, do_sample=False)
            generated_text = response[0]['generated_text']
            
            # Extract the answer part
            answer = generated_text.split("<|assistant|>")[-1].strip() if "<|assistant|>" in generated_text else generated_text[-300:]
            
            results.append({
                'text': chunk[:100] + "..." if len(chunk) > 100 else chunk,
                'search_results': search_results,
                'analysis': answer
            })
            
            print(f"  Analysis: {answer[:150]}...\n")
        
        except Exception as e:
            print(f"Error analyzing segment: {e}\n")
    
    # Summary
    if results:
        print("=" * 50)
        print("FACT-CHECK ANALYSIS COMPLETE")
        print("=" * 50)
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Statement: {result['text']}")
            print(f"\n   Search Results:\n   {result['search_results'][:200] if result['search_results'] else 'No results'}")
            print(f"\n   Analysis:\n   {result['analysis']}")
    
    return results

# if __name__ == "__main__":
#     url = input("Enter URL (Twitter, X, or any website): ").strip()
    
#     if url:
#         check_truthfulness(url)
#     else:
#         print("No URL provided")