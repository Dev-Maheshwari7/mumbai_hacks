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
    <div style={{ marginLeft: '288px', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navbar user={user} onLogout={handleLogout} />
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '32px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#1f2937', 
            marginBottom: '24px',
            letterSpacing: '-0.3px'
          }}>{t('Create Post', language)}</h1>
          <CreatePost />
        </div>
      </div>
    </div>
  );
}
