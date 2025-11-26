import requests
from bs4 import BeautifulSoup
from transformers import pipeline
from urllib.parse import urlparse

def scrape_content(url):
    """Extract text content from a URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        # Extract text
        text = soup.get_text(separator='\n')
        
        # Clean up whitespace
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

def check_truthfulness(url):
    """Scrape URL and check content truthfulness"""
    print(f"Scraping URL: {url}")
    content = scrape_content(url)
    
    if not content:
        print("Failed to scrape content")
        return
    
    print(f"\nExtracted {len(content)} characters of content")
    print("-" * 50)
    
    # Load zero-shot classification model
    print("Loading Hugging Face model...")
    classifier = pipeline("zero-shot-classification", 
                         model="facebook/bart-large-mnli")
    
    candidate_labels = ["true", "false", "unverifiable"]
    
    # Split content into manageable chunks
    chunks = split_into_sentences(content)
    print(f"Analyzing {len(chunks)} text segments...\n")
    
    results = []
    for i, chunk in enumerate(chunks[:10], 1):  # Limit to first 10 chunks
        if len(chunk.strip()) < 10:
            continue
        
        try:
            result = classifier(chunk, candidate_labels)
            results.append({
                'text': chunk[:100] + "..." if len(chunk) > 100 else chunk,
                'label': result['labels'][0],
                'scores': dict(zip(result['labels'], result['scores']))
            })
            print(f"Segment {i}:")
            print(f"  Text: {chunk[:80]}...")
            print(f"  Label: {result['labels'][0].upper()}")
            print(f"  Confidence: {result['scores'][0]:.2%}\n")
        
        except Exception as e:
            print(f"Error analyzing segment: {e}\n")
    
    # Summary
    if results:
        true_count = sum(1 for r in results if r['label'] == 'true')
        false_count = sum(1 for r in results if r['label'] == 'false')
        unverifiable_count = sum(1 for r in results if r['label'] == 'unverifiable')
        
        print("=" * 50)
        print("SUMMARY:")
        print(f"True statements: {true_count}")
        print(f"False statements: {false_count}")
        print(f"Unverifiable: {unverifiable_count}")
        print("=" * 50)
    
    return results

if __name__ == "__main__":
    # Example usage
    url = input("Enter URL to check: ").strip()
    
    if url:
        check_truthfulness(url)
    else:
        print("No URL provided")