from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify
import google.generativeai as genai
import os
from datetime import datetime
import requests

app = Flask(__name__)

# Initialize Gemini
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)
MODEL = "gemini-2.5-flash"

# Serper API for real-time search
SERPER_API_KEY = os.environ.get("SERPER_API_KEY")

def search_real_time(query: str) -> str:
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
        
        
        return results
    except Exception as e:
        print(f"Search error: {e}")
        return f"Search unavailable"

@app.route('/conversational-fact-check', methods=['POST'])
def conversational_fact_check():
    data = request.json
    user_message = data.get('message')
    conversation_history = data.get('conversation_history', [])
    
    try:
        model = genai.GenerativeModel(MODEL)
        
        # Search for current information about the claim
        search_results = search_real_time(user_message)
        
        system_prompt = f"""You are an expert AI fact-checking agent. Your job is to:
1. Listen to claims from users
2. Ask clarifying questions if needed
3. Analyze claims based on current information
4. Give a verdict: TRUE, FALSE, or UNVERIFIABLE
5. Be conversational and friendly

HERE IS CURRENT REAL-TIME INFORMATION TO HELP YOU:
{search_results}

Use this information to verify claims. Be accurate and cite sources when possible.
Keep responses concise (2-3 sentences) unless asking follow-up questions.
After gathering enough info, provide a clear verdict with reasoning."""
        
        # Build conversation history
        messages = conversation_history.copy()
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Convert to Gemini format
        gemini_messages = [{"role": msg["role"], "content": msg["content"]} for msg in messages]
        
        # Generate response
        response = model.generate_content([system_prompt] + gemini_messages)
        
        ai_response = response.text if response.text else "Unable to process"
        
        return jsonify({
            'response': ai_response,
            'status': 'success',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        import traceback
        print(f"Error: {traceback.format_exc()}")
        return jsonify({
            'response': f"Error: {str(e)}",
            'status': 'error',
            'error_details': str(e)
        }), 500


@app.route('/fact-check', methods=['POST'])
def fact_check():
    """Direct fact-checking endpoint"""
    data = request.json
    claim = data.get('claim')
    
    try:
        model = genai.GenerativeModel(MODEL)
        
        # Search for information
        search_results = search_real_time(claim)
        
        prompt = f"""You are a fact-checker. Verify this claim using the search results below.

CLAIM: {claim}

CURRENT SEARCH RESULTS:
{search_results}

Provide:
VERDICT: [TRUE/FALSE/UNVERIFIABLE]
CONFIDENCE: [0-100]%
EXPLANATION: [2-3 sentences]
SOURCES: [Where info came from]"""
        
        response = model.generate_content(prompt)
        
        return jsonify({
            'claim': claim,
            'analysis': response.text,
            'status': 'success',
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'response': f"Error: {str(e)}",
            'status': 'error'
        }), 500


if __name__ == '__main__':
    app.run(debug=True)