import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../context/context';
import { t } from '../translations/translations';
import CreatePost from '../components/CreatePost';
import Navbar from '../components/Navbar';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex flex-col">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('Create Post', language)}</h1>
          <CreatePost />
        </div>
      </div>
    </div>
    </div>
  );
}
