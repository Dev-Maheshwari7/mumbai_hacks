import React, { useState, useEffect } from 'react'
import PostsFeed from '../components/PostFeed'
import Post from '../components/Post'
import CreatePost from '../components/CreatePost'
import { useContext } from 'react';
import { credentialsContext } from '../context/context'
import { useNavigate } from 'react-router-dom'

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const value = useContext(credentialsContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        onLogout()
        return
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 401) {
          localStorage.removeItem('token')
          onLogout()
          return
        }

        const data = await response.json()
        setUser(data.user)
        value.setemail(data.user.email)
        value.setuserName(data.user.username)
      } catch (err) {
        console.error('Error fetching user:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [onLogout])

  const handleLogout = () => {
    localStorage.removeItem('token')
    onLogout()
  }

  if (loading) {
    return <p>Loading...</p>
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">

      {/* Top Navbar */}
      <nav className="w-full bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold text-blue-600">Social Media</h1>

        <div className="flex items-center space-x-4">
          <p className="font-medium">{user?.username}</p>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main Layout 3 Columns */}
      <div className="flex justify-center w-full px-4 mt-4">

        {/* LEFT SIDEBAR - FIXED */}
        <aside className="w-1/5 h-[88vh] bg-white shadow rounded-lg p-4 sticky top-20">
          <h2 className="font-semibold text-lg mb-4">Navigation</h2>

          <ul className="space-y-3">
            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer" onClick={() => navigate('/')}>🏠 Home</li>
            <li className="hover:bg-blue-100 p-2 rounded cursor-pointer font-semibold" onClick={() => navigate('/profile')}>👤 My Profile</li>
            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">📝 Create Post</li>
            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">🔍 Explore</li>
            <li className="hover:bg-gray-100 p-2 rounded cursor-pointer">⚙ Settings</li>
          </ul>
        </aside>

        {/* MIDDLE CONTENT (SCROLLABLE FEED) */}
        <main className="w-2/4 mx-4 h-[88vh] overflow-y-scroll p-2">
          <h2 className="text-xl font-semibold mb-4">Feed</h2>
          <PostsFeed /> 
        </main>

        {/* RIGHT SIDEBAR - FIXED */}
        <aside className="w-1/5 h-[88vh] bg-white shadow rounded-lg p-4 sticky top-20">
          <h2 className="font-semibold text-lg mb-3">Actions</h2>
            <CreatePost />
        </aside>

      </div>
    </div>
  )
}