from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from pathlib import Path
import traceback

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Supported video formats
SUPPORTED_FORMATS = {'video/mp4', 'video/mpeg', 'video/webm', 'video/x-msvideo', 'video/quicktime'}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB limit for direct upload

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("✓ Gemini API configured")
else:
    model = None
    print("✗ GEMINI_API_KEY not found")

@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video provided'}), 400
        
        file = request.files['video']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({'error': f'File too large. Maximum size is 20MB, got {file_size / 1024 / 1024:.2f}MB'}), 400
        
        # Check MIME type
        if file.content_type not in SUPPORTED_FORMATS:
            return jsonify({'error': f'Unsupported video format. Supported: {", ".join(SUPPORTED_FORMATS)}'}), 400
        
        print(f"✓ File received: {file.filename} ({file_size / 1024 / 1024:.2f}MB)")
        
        if not model:
            return jsonify({'error': 'Gemini API not configured'}), 500
        
        # Read video bytes
        video_bytes = file.read()
        print("  → Sending to Gemini API...")
        
        # Use the correct MIME type
        response = model.generate_content([
            "Analyze this video and determine if it's AI-generated or real. Respond with:\n1. A clear verdict (is it AI-generated or real?)\n2. Confidence score as a percentage\n3. Key indicators you observed\n\nUse plain text only, no markdown formatting.",
            {
                'mime_type': file.content_type,
                'data': video_bytes
            }
        ])
        
        analysis = response.text
        print(f"  ✓ Gemini response received ({len(analysis)} chars)\n")
        
        return jsonify({
            'success': True,
            'analysis': analysis
        }), 200
        
    except Exception as e:
        print(f"✗ Error: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)