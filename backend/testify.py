from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv
import traceback

load_dotenv()

app = Flask(__name__)
CORS(app)

# Get Gemini API Key
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

print(f"\n🔧 Configuration:")
print(f"   GEMINI_API_KEY: {'✓ Set' if GEMINI_API_KEY else '✗ NOT SET'}")

# Initialize Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
    print("   ✓ Gemini API configured\n")
else:
    model = None
    print("   ✗ GEMINI_API_KEY not found in .env\n")


@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    print("📨 POST /api/analyze-image")
    try:
        if 'image' not in request.files:
            print("✗ No image in request")
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        print(f"✓ File received: {file.filename}")

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Validate image
        try:
            print("  → Validating image...")
            img = Image.open(file.stream)
            img.verify()
            file.stream.seek(0)
            img = Image.open(file.stream)
            print(f"  ✓ Image valid: {img.format} {img.size}")
        except Exception as e:
            print(f"  ✗ Image validation failed: {e}")
            return jsonify({'error': f'Invalid image: {str(e)}'}), 400

        # Send to Gemini
        if not model:
            print("✗ Gemini model not configured")
            return jsonify({'error': 'Gemini API not configured'}), 500

        try:
            print("  → Sending to Gemini API...")
            file.stream.seek(0)
            response = model.generate_content([
                "Analyze this image in short. give confidence score talling the image is ai generated or not",
                img
            ])
            analysis = response.text
            print(f"  ✓ Gemini response received ({len(analysis)} chars)\n")

            return jsonify({
                'success': True,
                'analysis': analysis
            }), 200

        except Exception as e:
            print(f"  ✗ Gemini error: {e}")
            traceback.print_exc()
            return jsonify({'error': f'Gemini error: {str(e)}'}), 500

    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        traceback.print_exc()
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'gemini': 'configured' if model else 'not configured'
    }), 200


if __name__ == '__main__':
    print("🚀 Starting Flask server on http://localhost:5000\n")
    app.run(debug=True, port=5000)