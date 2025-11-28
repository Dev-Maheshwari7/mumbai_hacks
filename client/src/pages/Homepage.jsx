import React, { useState, useEffect } from 'react'
import PostsFeed from '../components/PostFeed'
import Navbar from '../components/Navbar'
import { useContext } from 'react';
import { credentialsContext, LanguageContext } from '../context/context'
import { t } from '../translations/translations'
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { language, setLanguage } = useContext(LanguageContext);
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
        console.error('Error fetching user:', err)
        toast.error(`Error fetching user: ${err}`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
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

  const handleTrendingSubmit = async () => {
    if (!selectedTopic || !selectedArea) {
      setTrendingError('Please select both topic and area');
      return;
    }

    setTrendingLoading(true);
    setTrendingError('');
    setTrendingResults(null);

    try {
      const response = await fetch('http://localhost:5000/trending-misinformation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: selectedTopic, area: selectedArea }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from backend');
      }

      const data = await response.json();
      setTrendingResults(data);
    } catch (err) {
      setTrendingError(err.message);
    } finally {
      setTrendingLoading(false);
    }
  };

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Area:
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">-- Choose an area --</option>
                {areas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

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

        {/* Right Content - Feed */}
        <main className="flex-1 h-[calc(100vh-80px)] overflow-y-scroll px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900">{t('Feed', language)}</h2>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            <PostsFeed targetLanguage={language} searchQuery={searchQuery} /> 
          </div>
        </main>
      </div>
    </div>
  )
}