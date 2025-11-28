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
from deep_translator import GoogleTranslator
import google.generativeai as genai
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse
from duckduckgo_search import DDGS

load_dotenv()

# Initialize Flask App
app = Flask(__name__)

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

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Helper function to scrape URL content
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
        max_chars = 8000
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
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    from webdriver_manager.chrome import ChromeDriverManager
    
    try:
        # Setup Chrome options
        chrome_options = Options()
        chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Initialize driver with webdriver-manager
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.get(url)
        
        # Wait for tweet content to load
        wait = WebDriverWait(driver, 10)
        
        try:
            # Try to find tweet text (multiple selectors as X changes them frequently)
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
                        for elem in elements[:3]:  # Get first 3 matching elements
                            text = elem.text.strip()
                            if text and len(text) > 10:  # Ignore very short matches
                                content += text + "\n\n"
                        if content:
                            break
                except:
                    continue
            
            driver.quit()
            
            if content:
                return content.strip()
            else:
                return "Could not extract tweet content. The page structure may have changed or the tweet may be protected."
                
        except TimeoutException:
            driver.quit()
            return "Timeout while loading tweet. The tweet may be protected or deleted."
            
    except Exception as e:
        return f"Error scraping Twitter/X: {str(e)}"

def detect_urls(text):
    """Detect URLs in text"""
    url_pattern = re.compile(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+')
    return url_pattern.findall(text)

def search_duckduckgo(query, max_results=5):
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

from tested import check_truthfulness

@app.route('/fact-check', methods=['POST'])
def fact_check():
    data = request.json
    url = data.get('url')
    results = check_truthfulness(url)
    
    return jsonify({
        'results': results
    })

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
        
        # Perform translation using deep-translator
        translated_text = GoogleTranslator(source='auto', target=target_lang).translate(text)
        
        return jsonify({
            'original': text,
            'translated': translated_text,
            'source_lang': 'auto',
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
        Give only small compact answers and no special characters like * and # or another characters
        Keep responses concise and clear
        The first line should clearly state whether the claim is True or False
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
        # Detect URLs in the message
        urls = detect_urls(user_message)
        scraped_content = ""
        scrape_failed = False
        enhanced_message = user_message
        search_results_text = ""
        
        if urls:
            # URL found - use scraping only (no DuckDuckGo search)
            for url in urls:
                content = scrape_url_content(url)
                
                # Check if scraping failed (common issues)
                if "JavaScript is not available" in content or "Something went wrong" in content or "Error scraping" in content:
                    scrape_failed = True
                    # Don't include failed scrape content
                else:
                    scraped_content += f"\n\n--- Content from {url} ---\n{content}\n"
            
            # If scraping failed, ask user to provide content directly
            if scrape_failed and not scraped_content:
                enhanced_message = user_message
            elif scraped_content:
                enhanced_message = f"{user_message}\n\nI've extracted the following content from the URL(s):{scraped_content}"
        else:
            # No URL - perform DuckDuckGo search for real-time information
            try:
                # Extract key claim/topic for search
                search_query = user_message[:200]  # Use first 200 chars as search query
                search_results = search_duckduckgo(search_query, max_results=5)
                
                if search_results:
                    search_results_text = "\n\n--- Recent Web Search Results ---\n"
                    for i, result in enumerate(search_results, 1):
                        search_results_text += f"\n{i}. {result['title']}\n"
                        search_results_text += f"   {result['body']}\n"
                        search_results_text += f"   Source: {result['url']}\n"
                    
                    enhanced_message += search_results_text
            except Exception as search_error:
                print(f"Search error: {str(search_error)}")
                # Continue without search results
        
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Build conversation context
        system_prompt = """You are an expert AI fact-checking agent. Your job is to:
1. Analyze claims from users about health, science, politics, or any topic
2. Provide evidence-based fact-checking with credible sources
3. Give a clear verdict: TRUE, FALSE, MISLEADING, PARTIALLY TRUE, or UNVERIFIABLE
4. Explain your reasoning with specific facts and scientific evidence
5. Be conversational and friendly, like a detective investigating claims

When fact-checking:
- Break down the claim into specific testable statements
- Look for scientific consensus or credible sources
- Identify any misleading framing or context
- Give only small compact answers and no special characters like * and # or another characters
- Keep responses concise and clear
- The first line should clearly state whether the claim is True or False

If you have web search results, use them to verify current information and cite specific sources.
If a URL is shared but you can't access the content (like X/Twitter posts that need JavaScript), politely ask the user to copy and paste the actual claim text."""
        
        # Prepare messages for Gemini
        messages = [{"role": msg["role"], "content": msg["content"]} for msg in conversation_history]
        messages.append({"role": "user", "content": enhanced_message})
        
        # Generate response
        response = model.generate_content(system_prompt + "\n\nConversation:\n" + 
                                         "\n".join([f"{msg['role']}: {msg['content']}" for msg in messages]))
        
        ai_response = response.text
        
        return jsonify({
            'response': ai_response,
            'status': 'success',
            'search_performed': bool(search_results_text)
        })
    
    except Exception as e:
        return jsonify({
            'response': f"Sorry, I encountered an error: {str(e)}",
            'status': 'error'
        }), 500
    
if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)