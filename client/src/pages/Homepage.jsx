import React, { useState, useEffect } from 'react'
import PostsFeed from '../components/PostFeed'
import Navbar from '../components/Navbar'
import { useContext } from 'react';
import { credentialsContext, LanguageContext } from '../context/context'
import { useNavigate, replace } from 'react-router-dom'
import { t } from '../translations/translations'
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { language } = useContext(LanguageContext);
  const value = useContext(credentialsContext);
  
  // Trending state
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [trendingResults, setTrendingResults] = useState(null);
  const [trendingError, setTrendingError] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const topics = [
    'Finance', 'Healthcare', 'Sports', 'Entertainment',
    'Politics', 'Technology', 'Science', 'Education'
  ];

  const areas = [
    'Mumbai', 'Delhi', 'Hyderabad', 'Bangalore', 'Kolkata',
    'India', 'USA', 'UK', 'Canada', 'Australia'
  ];

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
        // console.error('Error fetching user:', err)
        toast.error(`Error fetching user:', ${err}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          delay: 0,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
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
    <div className="w-full min-h-screen bg-white flex flex-col">
      <Navbar user={user} onLogout={onLogout} />

      {/* Main Content - Two Column Layout */}
      <div className="w-full flex">
        {/* Left Sidebar - Trending */}
        <aside className="w-80 h-[calc(100vh-80px)] overflow-y-auto border-r border-gray-200 p-4 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Trending Misinformation</h2>
          
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Topic:
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">-- Choose a topic --</option>
                {topics.map((topic) => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="hi">हिन्दी</option>
              <option value="zh-cn">中文</option>
              <option value="ja">日本語</option>
              <option value="ar">العربية</option>
              <option value="pt">Português</option>
              <option value="ru">Русский</option>
            </select>
            
            <p className="text-sm text-gray-700 font-medium">{user?.username}</p>
            <button
              onClick={handleTrendingSubmit}
              disabled={trendingLoading}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
            >
              {trendingLoading ? 'Fetching...' : 'Get Trending'}
            </button>
          </div>

          {trendingError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-4">
              {trendingError}
            </div>
          )}

          {trendingResults && (
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <h3 className="font-semibold text-sm text-gray-900 mb-3">
                Top Misinformation in {selectedTopic} - {selectedArea}
              </h3>

              {trendingResults.misinformation && trendingResults.misinformation.length > 0 ? (
                <div className="space-y-3">
                  {trendingResults.misinformation.map((item, index) => (
                    <div key={index} className="border-l-4 border-l-red-500 pl-3 pb-3 border-b border-b-gray-100 last:border-b-0">
                      <p className="text-xs font-semibold text-gray-500 mb-1">#{index + 1}</p>
                      <p className="text-sm text-gray-800 mb-1">{item.misinformation}</p>
                      <p className="text-xs text-gray-600"><strong>Source:</strong> {item.source}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No misinformation data received</p>
              )}

              {trendingResults.error && (
                <div className="text-red-600 text-sm">
                  <p>Error: {trendingResults.error}</p>
                </div>
              )}
            </div>
          )}
        </aside>

      {/* Main Content - Full Width Feed */}
      <div className="w-full">
        <main className="w-full h-[calc(100vh-80px)] overflow-y-scroll px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t('Feed', language)}</h2>
            <PostsFeed targetLanguage={language} /> 
          </div>
        </main>
      </div>
    </div>
  )
}