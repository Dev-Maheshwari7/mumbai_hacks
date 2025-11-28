"""
Flask JWT Authentication Backend with MongoDB
File: app.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from bson import ObjectId
from datetime import timedelta
import os
from time import time
from dotenv import load_dotenv
from googletrans import Translator

load_dotenv()

# Initialize Flask App
app = Flask(__name__)
from flask_cors import CORS

# CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, supports_credentials=True)
# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize JWT
jwt = JWTManager(app)

# Enable CORS
CORS(app,upports_credentials=True)

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['social_media_db']
users_collection = db['users']
post_collection = db['posts']

# Initialize Translator
translator = Translator()

# Routes

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup route"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Username, email, and password are required'}), 400
        
        # Check if user already exists
        if users_collection.find_one({'email': data['email']}):
            return jsonify({'message': 'Email already registered'}), 409
        
        if users_collection.find_one({'username': data['username']}):
            return jsonify({'message': 'Username already taken'}), 409
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        user = {
            'username': data['username'],
            'email': data['email'],
            'password': hashed_password,
            'followers': [],
            'following': []
        }
        
        result = users_collection.insert_one(user)
        user_id = str(result.inserted_id)
        
        # Generate JWT token
        token = create_access_token(identity=user_id)
        
        return jsonify({
            'message': 'User created successfully',
            'token': token,
            'user': {
                'id': user_id,
                'username': data['username'],
                'email': data['email']
            }
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    """User login route"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password are required'}), 400
        
        # Find user by email
        user = users_collection.find_one({'email': data['email']})
        
        if not user or not check_password_hash(user['password'], data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate JWT token
        token = create_access_token(identity=str(user['_id']))
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current logged-in user"""
    try:
        user_id = get_jwt_identity()
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        
        if not user:
            return jsonify({'message': 'User not found'}), 404

        # Ensure followers & following fields always exist
        update_needed = False
        updates = {}

        if 'followers' not in user:
            updates['followers'] = []
            update_needed = True

        if 'following' not in user:
            updates['following'] = []
            update_needed = True

        if update_needed:
            users_collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': updates}
            )
            # merge into response
            user.update(updates)

        return jsonify({
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email'],
                'followers': user.get('followers', []),
                'following': user.get('following', [])
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/savePost', methods=['POST'])
def postsave():
    """User Post Save Route"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data.get('email') or not data.get('name')  or not data.get('title') or not data.get('content'):
            return jsonify({'message': 'name,email, title, and content are required'}), 400
        
        # # Check if user already exists
        # if users_collection.find_one({'email': data['email']}):
        #     return jsonify({'message': 'Email already registered'}), 409

        
        # save post data
        post = {
            'post_id': data['post_id'],
            'username': data['name'],
            'email': data['email'],
            'title': data['title'],
            'content': data['content'],
            'timestamp': int(time() * 1000),
            'likes': [],       # new
            'dislikes': [],    # new
            'comments': [],    # new
            'media': data.get('media'),  # base64 encoded media
            'mediaType': data.get('mediaType')  # 'image' or 'video'
        }
        
        # Debug log
        print(f"Saving post with media: {bool(post['media'])}, type: {post['mediaType']}")
        
        result = post_collection.insert_one(post)
        user_id = str(result.inserted_id)
        
        return jsonify({
            'message': 'Post added successfully',
            'user': {
                'id': user_id,
                'username': data['name'],
                'email': data['email'],
                'title': data['title'],
                'content': data['content']
            }
        }), 201
        
    except Exception as e:
        # print("Error occured")
        return jsonify({'message': str(e)}), 500


# Post Fetching
@app.route('/api/auth/getPosts', methods=['GET'])
def get_posts():
    try:
        # Get ALL posts from MongoDB
        cursor = post_collection.find({}, {'_id': 0})  # remove _id from output

        posts = []
        for doc in cursor:
            has_media = bool(doc.get("media"))
            # ensure only needed fields are passed
            posts.append({
                "post_id": doc.get("post_id"),
                "username": doc.get("username"),
                "email": doc.get("email"),
                "title": doc.get("title"),
                "content": doc.get("content"),
                'timestamp': doc.get("timestamp"),
                "likes": doc.get("likes", []),
                "dislikes": doc.get("dislikes", []),
                "comments": doc.get("comments", []),
                "media": doc.get("media"),
                "mediaType": doc.get("mediaType")
            })
            if has_media:
                print(f"Post {doc.get('post_id')} has media type: {doc.get('mediaType')}")

        print(f"Returning {len(posts)} posts, {sum(1 for p in posts if p['media'])} with media")
        return jsonify({"posts": posts}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


@app.route('/api/auth/reactPost', methods=['POST'])
def react_post():
    """
    Body: { post_id, email, action } 
    action = "like" or "dislike"
    """
    data = request.get_json()
    post_id = data.get('post_id')
    email = data.get('email')
    action = data.get('action')

    post = post_collection.find_one({"post_id": post_id})
    if not post:
        return jsonify({"message": "Post not found"}), 404

    likes = set(post.get("likes", []))
    dislikes = set(post.get("dislikes", []))

    if action == "like":
        if email in likes:
            # 👉 user already liked → remove like
            likes.discard(email)
        else:
            # 👉 add like and remove dislike if exists
            likes.add(email)
            dislikes.discard(email)

    elif action == "dislike":
        if email in dislikes:
            # 👉 user already disliked → remove dislike
            dislikes.discard(email)
        else:
            # 👉 add dislike and remove like if exists
            dislikes.add(email)
            likes.discard(email)
    else:
        return jsonify({"message": "Invalid action"}), 400

    post_collection.update_one(
        {"post_id": post_id},
        {"$set": {"likes": list(likes), "dislikes": list(dislikes)}}
    )

    # return full arrays for frontend
    return jsonify({
        "likes": list(likes),
        "dislikes": list(dislikes)
    }), 200


#getting all reacted posts
@app.route('/api/auth/postReacted', methods=['POST'])
def reacted_post():
    data = request.get_json()
    name = data.get('name')

    posts = list(
        post_collection.find({
            "post_id": {"$regex": f"{name}$"}
        })
    )

    # Convert ObjectId to string
    for post in posts:
        post['_id'] = str(post['_id'])

    return jsonify({"posts": posts}), 200


@app.route('/api/auth/getUserPosts', methods=['POST'])
@jwt_required()
def get_user_posts():
    """Get all posts by a specific user"""
    try:
        data = request.get_json()
        user_email = data.get('email')
        
        if not user_email:
            return jsonify({'message': 'Email is required'}), 400
        
        # Find all posts by this user
        cursor = post_collection.find({'email': user_email}, {'_id': 0})
        
        posts = []
        for doc in cursor:
            posts.append({
                "post_id": doc.get("post_id"),
                "username": doc.get("username"),
                "email": doc.get("email"),
                "title": doc.get("title"),
                "content": doc.get("content"),
                "timestamp": doc.get("timestamp"),
                "likes": doc.get("likes", []),
                "dislikes": doc.get("dislikes", []),
                "comments": doc.get("comments", []),
                "media": doc.get("media"),
                "mediaType": doc.get("mediaType")
            })
        
        return jsonify({"posts": posts}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


#New Follower and Following routes

#Follower List route
@app.route('/api/auth/getFollowers', methods=['POST'])
@jwt_required()
def get_followers():
    data = request.get_json()
    email = data.get("email")

    user = users_collection.find_one({'email': email}, {"followers": 1})
    if not user:
        return jsonify({'message': 'User not found'}), 404

    followers = user.get("followers", [])
    return jsonify({"followers": followers}), 200


#Following list route
@app.route('/api/auth/getFollowing', methods=['POST'])
@jwt_required()
def get_following():
    data = request.get_json()
    email = data.get("email")

    user = users_collection.find_one({'email': email}, {"following": 1})
    if not user:
        return jsonify({'message': 'User not found'}), 404

    following = user.get("following", [])
    return jsonify({"following": following}), 200

#User Account route for showing Followings and Followers
@app.route('/api/auth/getUser', methods=['POST'])
def get_public_user():
    data = request.get_json()
    email = data.get("email")

    user = users_collection.find_one(
        {"email": email},
        {
            "_id": 0,
            "username": 1,
            "email": 1,              # show email? optional
            "followers": 1,
            "following": 1
        }
    )

    if not user:
        return jsonify({"message": "User not found"}), 404

    posts = list(post_collection.find(
        {"email": email},
        {"_id": 0}
    ))

    return jsonify({
        "user": user,
        "posts": posts
    }), 200

# Follow / Unfollow toggle
@app.route('/api/auth/followToggle', methods=['POST'])
@jwt_required()
def follow_toggle():
    data = request.get_json()
    follower_email = data.get("followerEmail")
    target_email = data.get("targetEmail")
    action = data.get("action")  # "follow" or "unfollow"

    if not follower_email or not target_email or not action:
        return jsonify({"message": "Missing required fields"}), 400

    follower = users_collection.find_one({'email': follower_email})
    target = users_collection.find_one({'email': target_email})

    if not follower or not target:
        return jsonify({"message": "User not found"}), 404

    following = follower.get("following", [])
    followers = target.get("followers", [])

    if action == "follow":
        if target_email not in following:
            following.append(target_email)
            users_collection.update_one(
                {'email': follower_email},
                {'$set': {'following': following}}
            )
        if follower_email not in followers:
            followers.append(follower_email)
            users_collection.update_one(
                {'email': target_email},
                {'$set': {'followers': followers}}
            )
    elif action == "unfollow":
        if target_email in following:
            following.remove(target_email)
            users_collection.update_one(
                {'email': follower_email},
                {'$set': {'following': following}}
            )
        if follower_email in followers:
            followers.remove(follower_email)
            users_collection.update_one(
                {'email': target_email},
                {'$set': {'followers': followers}}
            )
    else:
        return jsonify({"message": "Invalid action"}), 400

    return jsonify({
        "message": f"Successfully {action}ed {target_email}",
        "following": following
    }), 200


@app.route('/api/auth/getFollowingStatus', methods=['POST'])
@jwt_required()
def get_following_status():
    data = request.get_json()
    follower_email = data.get("followerEmail")

    user = users_collection.find_one({'email': follower_email}, {"following": 1})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    following_list = user.get("following", [])

    return jsonify({"following": following_list}), 200


@app.route('/api/auth/deletePost', methods=['DELETE'])
@jwt_required()
def delete_post():
    try:
        data = request.get_json()
        post_id = data.get('post_id')

        if not post_id:
            return jsonify({'message': 'Post ID is required'}), 400

        # find jwt user
        current_user_id = get_jwt_identity()
        current_user = users_collection.find_one({"_id": ObjectId(current_user_id)})
        current_user_email = current_user["email"]

        post = post_collection.find_one({'post_id': post_id})

        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        if post['email'] != current_user_email:
            return jsonify({'message': 'Unauthorized: You can delete only your posts'}), 403

        post_collection.delete_one({'post_id': post_id})
        return jsonify({'message': 'Post deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'message': str(e)}), 500



@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout (token invalidation handled on frontend)"""
    return jsonify({'message': 'Logout successful'}), 200


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Route not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

from tested2 import GEMINI_API_KEY, check_truthfulness

@app.route('/fact-check', methods=['POST'])
def fact_check():
    data = request.json
    url = data.get('url')
    results = check_truthfulness(url)
    
    return jsonify({
        'results': results
    })

from flask import Flask, request, jsonify
import google.generativeai as genai

# Configure Gemini API
    
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

@app.route('/api/auth/addComment', methods=['POST'])
@jwt_required()
def add_comment():
    """Add a comment to a post"""
    try:
        data = request.get_json()
        post_id = data.get('post_id')
        comment_text = data.get('comment')
        user_email = data.get('email')
        username = data.get('username')
        
        if not post_id or not comment_text or not user_email or not username:
            return jsonify({'message': 'Post ID, comment, email, and username are required'}), 400
        
        # Find the post
        post = post_collection.find_one({'post_id': post_id})
        
        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        # Create comment object
        comment = {
            'username': username,
            'email': user_email,
            'text': comment_text,
            'timestamp': int(time() * 1000)
        }
        
        # Add comment to post
        post_collection.update_one(
            {'post_id': post_id},
            {'$push': {'comments': comment}}
        )
        
        return jsonify({
            'message': 'Comment added successfully',
            'comment': comment
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/getComments', methods=['POST'])
def get_comments():
    """Get all comments for a post"""
    try:
        data = request.get_json()
        post_id = data.get('post_id')
        
        if not post_id:
            return jsonify({'message': 'Post ID is required'}), 400
        
        # Find the post
        post = post_collection.find_one({'post_id': post_id}, {'comments': 1, '_id': 0})
        
        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        comments = post.get('comments', [])
        
        return jsonify({'comments': comments}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500


@app.route('/api/auth/translate', methods=['POST'])
def translate_text():
    """Translate text to target language"""
    try:
        data = request.get_json()
        text = data.get('text')
        target_lang = data.get('target_lang', 'en')
        
        if not text:
            return jsonify({'message': 'Text is required'}), 400
        
        # Perform translation
        translation = translator.translate(text, dest=target_lang)
        
        return jsonify({
            'original': text,
            'translated': translation.text,
            'source_lang': translation.src,
            'target_lang': target_lang
        }), 200
        
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return jsonify({'message': f'Translation failed: {str(e)}'}), 500


@app.route('/trending-misinformation', methods=['POST'])
def trending_misinformation():
    data = request.json
    topic = data.get('topic')
    area = data.get('area')
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        prompt = f"""Give top 4 misinformation regarding {topic} in {area}. 
        
        Structure your response exactly like this for each misinformation:
        Misinformation: [the misinformation claim]
        Source: [where it typically comes from]
        
        Return ONLY these 4 items, no extra text."""
        
        response = model.generate_content(prompt)
        response_text = response.text
        
        # Parse the response
        misinformation_list = []
        items = response_text.split('\n\n')
        
        for item in items:
            if 'Misinformation:' in item and 'Source:' in item:
                lines = item.split('\n')
                misinformation = ""
                source = ""
                
                for line in lines:
                    if 'Misinformation:' in line:
                        misinformation = line.replace('Misinformation:', '').strip()
                    elif 'Source:' in line:
                        source = line.replace('Source:', '').strip()
                
                if misinformation and source:
                    misinformation_list.append({
                        'misinformation': misinformation,
                        'source': source
                    })
        
        return jsonify({
            'misinformation': misinformation_list,
            'topic': topic,
            'area': area
        })
    
    except Exception as e:
        return jsonify({
            'error': str(e),
            'misinformation': []
        }), 500

@app.route('/conversational-fact-check', methods=['POST'])
def conversational_fact_check():
    import requests
    import json
    import re
    from dotenv import load_dotenv
    load_dotenv()

    SERPER_API_KEY = os.getenv("SERPER_API_KEY")

    data = request.json
    user_message = data.get('message')
    conversation_history = data.get('conversation_history', [])

    # ------ 0️⃣ Detect if this is a follow-up/source request ------
    follow_up_keywords = [
        'source', 'evidence', 'fetch', 'show', 'provide', 'get', 'retrieve',
        'what was', 'tell me more', 'expand', 'elaborate', 'clarify', 'explain',
        'previous', 'earlier', 'before', 'last', 'prior', 'more details',
        'can you', 'could you', 'would you', 'please share'
    ]
    user_message_lower = user_message.lower()
    is_follow_up = any(keyword in user_message_lower for keyword in follow_up_keywords)
    
    # Extract the original claim from conversation if this is a follow-up
    original_claim = None
    original_evidence = None
    if is_follow_up and len(conversation_history) > 0:
        # Look for the last user message (the original claim)
        for msg in reversed(conversation_history):
            if msg['role'] == 'user':
                original_claim = msg['content']
                break

    try:
        # ------ 1️⃣ Perform Real-time Search using Serper ------
        # Skip search for follow-up questions; use the original claim instead
        search_query = original_claim if is_follow_up and original_claim else user_message
        
        search_url = "https://google.serper.dev/search"
        payload = {"q": search_query}
        headers = {
            "X-API-KEY": SERPER_API_KEY,
            "Content-Type": "application/json"
        }

        search_results = requests.post(search_url, json=payload, headers=headers).json()

        # Extract relevant text summary
        result_snippets = []

        if "organic" in search_results:
            for item in search_results["organic"][:5]:
                snippet = item.get("snippet", "")
                title = item.get("title", "")
                result_snippets.append(f"{title}: {snippet}")

        live_summary = "\n".join(result_snippets) if result_snippets else "No reliable real-time data found."

        # ------ 2️⃣ System Prompt ------
        system_prompt = """
You are a conversational AI fact-checker assistant. You help users verify claims using real-time search evidence.

IMPORTANT BEHAVIORS:
- Be conversational and friendly, not robotic
- Remember context from previous messages in the conversation
- If user asks to "fetch sources", "show sources", "get sources", or similar, provide the search evidence in a readable format
- If user is clarifying a previous claim, reference that context naturally
- Only fact-check NEW claims or requests for information about previous claims
- If the user's message is NOT asking you to fact-check something (e.g., asking for sources, asking a follow-up question), respond naturally without forcing a verdict

FACT-CHECKING PROTOCOL:
When fact-checking a claim:
1. Analyze the user's claim
2. Compare with provided search evidence
3. Determine verdict: TRUE (evidence strongly supports), FALSE (evidence contradicts), or UNVERIFIABLE (insufficient/conflicting)
4. Provide confidence score (0-100)

RESPONSE FORMAT:
Return ONLY valid JSON with these fields:

{
 "agent_response": "<natural conversational response - can be friendly, informative, or clarifying>",
 "verdict": "TRUE | FALSE | UNVERIFIABLE | NONE",
 "confidence_score": <0-100>,
 "evidence_summary": "<relevant evidence or explanation>"
}

Use "NONE" as verdict for non-fact-checking conversational responses (like providing sources).
Be concise, natural, and helpful. Return ONLY the JSON, no markdown code blocks.
"""

        # ------ 3️⃣ Build Conversation for Gemini ------
        # Format conversation history with full context
        past_msgs = ""
        if conversation_history:
            for msg in conversation_history:
                role = msg['role'].upper()
                content = msg['content']
                # Clean up any artifact formatting from previous responses
                if role == 'ASSISTANT':
                    # Remove the verdict/confidence emoji and formatting
                    content = content.replace('✅ ', '').replace('❌ ', '').replace('⚠️ ', '').replace('❓ ', '')
                    # Extract just the conversational parts
                    lines = content.split('\n')
                    content = '\n'.join([line for line in lines if not line.startswith('Confidence:') and not line.startswith('📋')])
                past_msgs += f"{role}: {content}\n"

        final_prompt = f"""
{system_prompt}

CONVERSATION CONTEXT:
{past_msgs if past_msgs else "This is the start of the conversation."}

CURRENT USER MESSAGE:
{user_message}

CURRENT SEARCH EVIDENCE:
{live_summary}

IS_FOLLOW_UP: {is_follow_up}
{f'ORIGINAL_CLAIM_BEING_REFERENCED: {original_claim}' if is_follow_up and original_claim else ''}

INSTRUCTIONS:
- Analyze the current user message in context of the conversation history
- If they're asking for sources/evidence/more details about a PREVIOUS claim, provide those using the search evidence
- If they're asking a follow-up question, answer conversationally using prior context
- If they're making a NEW claim, fact-check it using the search evidence
- When providing sources, be specific and reference them naturally in your response
- Respond in the required JSON format only
"""

        # ------ 4️⃣ Get Gemini Output ------
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content(final_prompt)

        ai_raw = response.text.strip()

        # Clean JSON output if model added extra text
        parsed = None
        try:
            # First, try to extract JSON from markdown code blocks
            json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', ai_raw)
            if json_match:
                json_str = json_match.group(1).strip()
                parsed = json.loads(json_str)
            else:
                # Try direct JSON parsing
                parsed = json.loads(ai_raw)
        except (json.JSONDecodeError, AttributeError) as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {ai_raw}")
            # Fallback response
            parsed = {
                "agent_response": "I encountered an issue processing this claim. Please try again.",
                "verdict": "UNKNOWN",
                "confidence_score": 0,
                "evidence_summary": live_summary
            }

        # Ensure confidence_score is an integer
        if isinstance(parsed.get("confidence_score"), str):
            try:
                parsed["confidence_score"] = int(parsed["confidence_score"])
            except (ValueError, TypeError):
                parsed["confidence_score"] = 0

        # ------ 5️⃣ Return response ------
        return jsonify({
            "response": parsed,
            "search_evidence": live_summary,
            "status": "success"
        })

    except Exception as e:
        print(f"Error in conversational_fact_check: {str(e)}")
        return jsonify({
            "response": {
                "agent_response": f"An error occurred: {str(e)}",
                "verdict": "UNKNOWN",
                "confidence_score": 0,
                "evidence_summary": ""
            },
            "status": "error"
        }), 500

from PIL import Image
import traceback
@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
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

from pathlib import Path
@app.route('/api/analyze-video', methods=['POST'])
def analyze_video():
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

# Supported video formats
    SUPPORTED_FORMATS = {'video/mp4', 'video/mpeg', 'video/webm', 'video/x-msvideo', 'video/quicktime'}
    MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB limit for direct upload

    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("✓ Gemini API configured")
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
    app.run(debug=True, host='localhost', port=5000)