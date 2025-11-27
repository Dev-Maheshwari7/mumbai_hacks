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

load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

# Initialize JWT
jwt = JWTManager(app)

# Enable CORS
CORS(app)

# MongoDB Connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(MONGO_URI)
db = client['social_media_db']
users_collection = db['users']
post_collection = db['posts']

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
        
        return jsonify({
            'user': {
                'id': str(user['_id']),
                'username': user['username'],
                'email': user['email']
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
        likes.add(email)
        dislikes.discard(email)
    elif action == "dislike":
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


@app.route('/api/auth/deletePost', methods=['DELETE'])
@jwt_required()
def delete_post():
    """Delete a post (only by the post owner)"""
    try:
        data = request.get_json()
        post_id = data.get('post_id')
        user_email = data.get('email')
        
        if not post_id or not user_email:
            return jsonify({'message': 'Post ID and email are required'}), 400
        
        # Find the post
        post = post_collection.find_one({'post_id': post_id})
        
        if not post:
            return jsonify({'message': 'Post not found'}), 404
        
        # Check if the user owns the post
        if post.get('email') != user_email:
            return jsonify({'message': 'Unauthorized: You can only delete your own posts'}), 403
        
        # Delete the post
        result = post_collection.delete_one({'post_id': post_id})
        
        if result.deleted_count > 0:
            return jsonify({'message': 'Post deleted successfully'}), 200
        else:
            return jsonify({'message': 'Failed to delete post'}), 500
        
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

from tested import check_truthfulness

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
    data = request.json
    user_message = data.get('message')
    conversation_history = data.get('conversation_history', [])
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Build conversation context
        system_prompt = """You are an expert AI fact-checking agent. Your job is to:
1. Listen to claims from users
2. Ask clarifying questions to understand the claim better
3. Provide evidence-based analysis
4. Search for contradictory or supporting information
5. Give a final verdict on whether the claim is TRUE, FALSE, or UNVERIFIABLE
6. Be conversational and friendly, like a detective investigating claims

Keep responses concise (2-3 sentences) and ask follow-up questions to dig deeper.
After you have enough information, provide a clear verdict with reasoning."""
        
        # Prepare messages for Gemini
        messages = [{"role": msg["role"], "content": msg["content"]} for msg in conversation_history]
        messages.append({"role": "user", "content": user_message})
        
        # Generate response
        response = model.generate_content(system_prompt + "\n\nConversation:\n" + 
                                         "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages]))
        
        ai_response = response.text
        
        return jsonify({
            'response': ai_response,
            'status': 'success'
        })
    
    except Exception as e:
        return jsonify({
            'response': f"Sorry, I encountered an error: {str(e)}",
            'status': 'error'
        }), 500
    
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)