from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import pipeline
import re

app = Flask(__name__)
CORS(app)

# Load model once globally
print("Loading model...")
generator = pipeline("text-generation", 
                    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
                    device=0 if torch.cuda.is_available() else -1,
                    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32)

def extract_confidence(text):
    """Extract confidence score from text"""
    patterns = [
        r'(?:confidence|confident).*?(\d+(?:\.\d+)?)\s*%',
        r'(\d+(?:\.\d+)?)\s*%\s*(?:confidence|confident)',
        r'confidence.*?(\d+(?:\.\d+)?)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            score = float(match.group(1))
            return min(100, max(0, score))
    return 50.0

def parse_verdict(analysis_text):
    """Parse verdict and confidence from analysis"""
    verdict = "UNDETERMINED"
    confidence = 50.0
    
    # Find verdict
    if re.search(r'verdict:\s*true', analysis_text, re.IGNORECASE):
        verdict = "TRUE"
    elif re.search(r'verdict:\s*false', analysis_text, re.IGNORECASE):
        verdict = "FALSE"
    elif re.search(r'verdict:\s*partially', analysis_text, re.IGNORECASE):
        verdict = "PARTIALLY TRUE"
    
    # Extract confidence
    confidence = extract_confidence(analysis_text)
    
    return verdict, confidence

def check_truthfulness(url, content):
    """Check truthfulness of content"""
    
    if not content or len(content.strip()) < 20:
        return {"error": "Content too short to analyze"}
    
    # Split into chunks
    sentences = re.split(r'(?<=[.!?])\s+', content)
    chunks = [s.strip() for s in sentences if len(s.strip()) > 20]
    
    results = []
    
    for i, chunk in enumerate(chunks[:5], 1):
        try:
            # Create comprehensive prompt
            prompt = f"""<|user|>
You are an expert fact-checker. Analyze this claim carefully and provide a detailed verdict.

CLAIM: {chunk}

Provide your response in this exact format:
VERDICT: [TRUE/FALSE/PARTIALLY TRUE]
CONFIDENCE: [0-100]%
EXPLANATION: [Provide 4-6 detailed sentences explaining your verdict, citing specific evidence]
SOURCES: [List any sources you reference]
<|end|>
<|assistant|>"""
            
            response = generator(
                prompt, 
                max_new_tokens=1000,  # Much larger token limit
                do_sample=False,
                top_p=0.95,
                temperature=0.1
            )
            
            full_text = response[0]['generated_text']
            answer = full_text.split("<|assistant|>")[-1].strip()
            
            # Parse verdict and confidence
            verdict, confidence = parse_verdict(answer)
            
            results.append({
                'text': chunk[:150],
                'verdict': verdict,
                'confidence': confidence,
                'analysis': answer,
                'full_text': chunk
            })
            
        except Exception as e:
            print(f"Error: {e}")
            results.append({
                'text': chunk[:150],
                'verdict': 'ERROR',
                'confidence': 0,
                'analysis': f"Error processing: {str(e)}",
                'full_text': chunk
            })
    
    return results

@app.route('/fact-check', methods=['POST'])
def fact_check():
    data = request.json
    url = data.get('url', '')
    
    try:
        # Your scraping function here
        content = scrape_content(url)  # Use your existing scraper
        
        if not content:
            return jsonify({"error": "Could not scrape content"}), 400
        
        results = check_truthfulness(url, content)
        
        return jsonify({
            "extracted_content": content[:500],
            "results": results,
            "total_statements": len(results)
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)