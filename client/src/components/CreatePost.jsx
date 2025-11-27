import React, { useState } from "react";
import { useContext } from 'react';
import { credentialsContext, LanguageContext } from '../context/context'
import { v4 as uuidv4 } from 'uuid';
import { MdImage, MdVideoLibrary } from 'react-icons/md';
import { t } from '../translations/translations';

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const value = useContext(credentialsContext);
  const { language } = useContext(LanguageContext);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

// Time-ago calculator (social media style)
  // Handle media file selection
  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Check file type
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image' && fileType !== 'video') {
      alert('Only images and videos are allowed');
      return;
    }

    setMediaType(fileType);
    setMediaFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove media
  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handlePost = async () => {
    if (!title || !content) {
      alert("Please fill the title and content.");
      return;
    }

    const postTimestamp = Date.now();

    const newPost = {
      name:value.userName,
      email:value.email,
      title,
      content,
      timestamp: postTimestamp,
      post_id:uuidv4()+`-${value.userName}`,
      media: mediaPreview, // base64 encoded media
      mediaType: mediaType // 'image' or 'video'
    };
    console.log("Post Created with media:", { 
      hasMedia: !!mediaPreview, 
      mediaType,
      mediaLength: mediaPreview?.length 
    });
    let response=await fetch('http://localhost:5000/api/auth/savePost', { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...newPost }) })
    let result=await response.json();
    console.log(result.message);
    
    if (response.ok) {
      alert('Post created successfully!');
      // Reload page to show new post
      window.location.reload();
    }
    
    // reset fields
    setTitle("");
    setContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  return (
    <div className="w-full">
      <h3 className="text-base font-bold mb-4 text-gray-900">{t('Create Post', language)}</h3>
      {/* Title */}
      <input
        type="text"
        placeholder={t('Post title...', language)}
        name="title"
        className="w-full px-4 py-2.5 mb-3 text-sm bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Text Content */}
      <textarea
        placeholder={t('Write your news or information...', language)}
        className="w-full px-4 py-2.5 h-32 mb-3 text-sm bg-white border border-gray-200 rounded-lg resize-none text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Media Upload */}
      <div className="mb-3">
        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all group">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
          <span className="text-sm text-gray-700 group-hover:text-indigo-600 font-medium">{t('Click to upload image or video', language)}</span>
        </label>
        <p className="text-xs text-gray-600 mt-1">{t('Max file size: 10MB', language)}</p>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="mb-3 relative">
          <button
            onClick={removeMedia}
            className="absolute top-2 right-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 z-10 font-medium shadow-md"
          >
            {t('Remove', language)}
          </button>
          {mediaType === 'image' ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
            />
          ) : (
            <video
              src={mediaPreview}
              controls
              className="w-full max-h-48 rounded-lg border border-gray-200 shadow-sm"
            />
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handlePost}
        className="w-full text-sm bg-linear-to-r from-indigo-600 to-purple-600 text-white py-2.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg"
      >
        {t('Post', language)}
      </button>
    </div>
  );
}
