import React, { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LanguageContext } from '../context/context';
import { t } from '../translations/translations';

export default function Navbar({ user, onLogout }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white border-b border-gray-100 px-6 py-3 sticky top-0 z-50 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-lg font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>
            {t('Social Media', language)}
          </h1>

          {/* Navigation */}
          <ul className="flex items-center gap-2">
            <li
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                isActive('/')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => navigate('/')}
            >
              {t('Home', language)}
            </li>
            <li
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                isActive('/profile')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => navigate('/profile')}
            >
              {t('My Profile', language)}
            </li>
            <li
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                isActive('/create')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => navigate('/create')}
            >
              {t('Create Post', language)}
            </li>
            <li
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                isActive('/conversation')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => navigate('/conversation')}
            >
              {t('Chatbot', language)}
            </li>
            <li
              className={`text-sm px-4 py-2 rounded-lg cursor-pointer transition-all font-medium ${
                isActive('/aiagent')
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              onClick={() => navigate('/aiagent')}
            >
              {t('Link Checker', language)}
            </li>
          </ul>
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

          {user && <p className="text-sm text-gray-700 font-medium">{user.username}</p>}
          
          <button
            className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            onClick={handleLogout}
          >
            {t('Logout', language)}
          </button>
        </div>
      </div>
    </nav>
  );
}