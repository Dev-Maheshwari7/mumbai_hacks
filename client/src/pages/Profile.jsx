import React, { useState, useEffect, useContext } from 'react';
import { credentialsContext } from '../context/context';
import Post from '../components/Post';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

export default function Profile({ onLogout }) {
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { username, email } = useContext(credentialsContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      try {
        // Fetch user details
        const userResponse = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (userResponse.status === 401) {
          localStorage.removeItem('token');
          onLogout();
          return;
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch user's posts
        const postsResponse = await fetch('http://localhost:5000/api/auth/getUserPosts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: userData.user.email }),
        });

        const postsData = await postsResponse.json();
        if (postsData.posts) {
          setUserPosts(postsData.posts.reverse());
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [onLogout]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
          >
            <FaArrowLeft />
            <span>Back to Home</span>
          </button>
          <h1 className="text-xl font-bold text-blue-600">My Profile</h1>
        </div>

        <div className="flex items-center space-x-4">
          <p className="font-medium">{user?.username}</p>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center space-x-6">
            {/* Profile Picture Placeholder */}
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-800">{user?.username}</h2>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              
              <div className="flex space-x-6 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{userPosts.length}</p>
                  <p className="text-gray-600 text-sm">Posts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Posts Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">My Posts</h3>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">You haven't created any posts yet.</p>
              <p className="text-gray-400 mt-2">Start sharing your thoughts with the community!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPosts.map((post, i) => (
                <Post
                  key={i}
                  post_id={post.post_id}
                  username={post.username}
                  title={post.title}
                  content={post.content}
                  timestamp={Number(post.timestamp?.$numberLong) || post.timestamp || Date.now()}
                  userEmail={email}
                  postOwnerEmail={post.email}
                  likes={post.likes || []}
                  dislikes={post.dislikes || []}
                  onDeleteSuccess={(deletedPostId) => {
                    setUserPosts(userPosts.filter(p => p.post_id !== deletedPostId));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
