import React, { useState, useEffect } from 'react'
import PostsFeed from '../components/PostFeed'
import Post from '../components/Post'
import CreatePost from '../components/CreatePost'
import { useContext } from 'react';
import { credentialsContext, LanguageContext } from '../context/context'
import { useNavigate } from 'react-router-dom'
import { t } from '../translations/translations'

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { language, setLanguage } = useContext(LanguageContext);
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
    <div className="w-full min-h-screen bg-white flex flex-col">

      {/* Top Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">{t('Social Media', language)}</h1>

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
            className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            onClick={handleLogout}
          >
            {t('Logout', language)}
          </button>
        </div>
      </nav>

      {/* Main Layout 3 Columns */}
      <div className="flex justify-center w-full px-4 mt-4">

        {/* LEFT SIDEBAR - FIXED */}
        <aside className="w-1/5 h-[88vh] bg-gray-50 border-r border-gray-100 p-4 sticky top-20">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t('Navigation', language)}</h2>

          <ul className="space-y-1">
            <li className="text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg cursor-pointer transition-all font-medium" onClick={() => navigate('/')}>{t('Home', language)}</li>
            <li className="text-sm text-indigo-600 bg-indigo-50 p-2.5 rounded-lg cursor-pointer font-semibold transition-all" onClick={() => navigate('/profile')}>{t('My Profile', language)}</li>
            <li className="text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg cursor-pointer transition-all font-medium">{t('Create Post', language)}</li>
            <li className="text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg cursor-pointer transition-all font-medium">{t('Explore', language)}</li>
            <li className="text-sm text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-lg cursor-pointer transition-all font-medium">{t('Settings', language)}</li>
          </ul>
        </aside>

        {/* MIDDLE CONTENT (SCROLLABLE FEED) */}
        <main className="w-2/4 mx-4 h-[88vh] overflow-y-scroll">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t('Feed', language)}</h2>
          <PostsFeed targetLanguage={language} /> 
        </main>

        {/* RIGHT SIDEBAR - FIXED */}
        <aside className="w-1/5 h-[88vh] bg-gray-50 border-l border-gray-100 p-4 sticky top-20">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">{t('Actions', language)}</h2>
            <CreatePost />
        </aside>

      </div>
    </div>
  )
}