import React, { useState, useEffect, useContext } from 'react';
import PostsFeed from '../components/PostFeed';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { credentialsContext, LanguageContext } from '../context/context';
import { useNavigate } from 'react-router-dom';
import { t } from '../translations/translations';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons
import {
  HiHome,
  HiUser,
  HiPencil,
  HiSearch,
  HiLogout,
  HiChevronDown,
  HiChevronRight,
  HiX,
} from 'react-icons/hi';
import SuggestedUsersSidebar from '../components/SuggestedUsersSidebar';
import Trending from './Trending';
import Navbar from '../components/Navbar';

export default function Homepage({ onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { language, setLanguage } = useContext(LanguageContext);
  const value = useContext(credentialsContext);
  const navigate = useNavigate();

  const trendingTopics = [
    {
      id: 1,
      title: 'Technology',
      subtopics: ['AI Developments', 'Cybersecurity', 'Web3'],
    },
    {
      id: 2,
      title: 'Politics',
      subtopics: ['Elections 2024', 'Policy Changes', 'International Relations'],
    },
    {
      id: 3,
      title: 'Entertainment',
      subtopics: ['Movie Releases', 'Music Awards', 'Celebrity News'],
    },
  ];

  const allTopics = [
    'AI Developments',
    'Cybersecurity',
    'Web3',
    'Elections 2024',
    'Policy Changes',
    'International Relations',
    'Movie Releases',
    'Music Awards',
    'Celebrity News',
    'Climate Change',
    'Space Exploration',
    'Cryptocurrency',
    'Mental Health',
    'Gaming',
    'Sports',
  ];

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      return;
    }

    const filtered = allTopics.filter((topic) =>
      topic.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const openSearchModal = () => {
    setShowSearchModal(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  const closeSearchModal = () => {
    setShowSearchModal(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        onLogout();
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          onLogout();
          return;
        }

        const data = await response.json();
        setUser(data.user);
        value.setemail(data.user.email);
        value.setuserName(data.user.username);
      } catch (err) {
        toast.error(`Error fetching user: ${err.message}`, {
          position: 'top-right',
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          delay: 0,
          draggable: true,
          progress: undefined,
          theme: 'light',
          transition: Bounce,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [onLogout, value]);

  const handleLogout = () => {
    toast.success('Successfully logged out', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      delay: 0,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Bounce,
    });
    localStorage.removeItem('token');
    onLogout();
  };

  if (loading) {
    return <p className="text-center py-10">Loading...</p>;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 flex">
      <ToastContainer />

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {t('Search Topics', language)}
              </h3>
              <button
                onClick={closeSearchModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for topics..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto p-4">
              {searchQuery === '' ? (
                <div className="text-center text-gray-500 py-8">
                  <HiSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Start typing to search topics</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        toast.info(`Searching for: ${topic}`, {
                          position: 'top-right',
                          autoClose: 2000,
                        });
                        closeSearchModal();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{topic}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">No topics found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm sticky top-0 h-screen overflow-y-auto">
        {/* App name */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900">
            {t('Social Media', language)}
          </h1>
        </div>

        {/* Navigation */}
        {/* <nav className="px-4 py-6">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-900 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all"
              >
                <HiHome className="w-5 h-5 text-purple-600" />
                {t('Home', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-900 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all"
              >
                <HiUser className="w-5 h-5 text-purple-600" />
                {t('My Profile', language)}
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate('/create')}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-900 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all"
              >
                <HiPencil className="w-5 h-5 text-purple-600" />
                {t('Create Post', language)}
              </button>
            </li>
            <li>
              <button
                onClick={openSearchModal}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-900 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-all"
              >
                <HiSearch className="w-5 h-5 text-blue-600" />
                {t('Search', language)}
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <HiLogout className="w-5 h-5" />
                {t('Logout', language)}
              </button>
            </li>
          </ul>
        </nav> */}
        <Navbar/>

        {/* Trending */}
        {/* <Trending/> */}

        {/* User + Language Selector */}
        <div className="mt-auto px-4 pb-6 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-900">{user?.username}</p>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
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
          </div>
        </div>
      </aside>

      {/* FEED AREA */}
      <main className="flex-1 bg-white flex flex-col">
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {t('Feed', language)}
          </h2>
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


        <div className="flex-1 h-[calc(100vh-64px)] overflow-y-auto px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <PostsFeed targetLanguage={language} />
          </div>
        </div>
      </main>
      {/* RIGHT SIDEBAR - TRENDING SECTION */}
      <aside className="w-80 bg-white border-l border-gray-200 shadow-sm sticky top-0 h-screen overflow-y-auto p-6">
        <Trending />
      </aside>
    </div>
  );
}
