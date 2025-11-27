import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LanguageContext } from '../context/context';
import { t } from '../translations/translations';
import CreatePost from '../components/CreatePost';

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { language } = useContext(LanguageContext);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← {t('Back to Feed', language)}
          </button>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('Create Post', language)}</h1>
          <CreatePost />
        </div>
      </div>
    </div>
  );
}
