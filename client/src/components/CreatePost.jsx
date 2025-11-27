import React, { useState } from "react";
import { useContext } from 'react';
import { credentialsContext } from '../context/context'
import { v4 as uuidv4 } from 'uuid';
import { MdImage, MdVideoLibrary } from 'react-icons/md';

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const value = useContext(credentialsContext);
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
      <h2 className="text-lg font-semibold mb-4">Create a Post</h2>

      {/* Title */}
      <input
        type="text"
        placeholder="Post title..."
        name="title"
        className="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-blue-500"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Text Content */}
      <textarea
        placeholder="Write your news or information..."
        className="w-full p-2 h-32 mb-3 border rounded resize-none focus:ring-2 focus:ring-blue-500"
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Media Upload */}
      <div className="mb-3">
        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
          <div className="flex items-center space-x-2 text-gray-600">
            <MdImage size={24} />
            <MdVideoLibrary size={24} />
            <span className="font-medium">Click to upload image or video</span>
          </div>
        </label>
        <p className="text-xs text-gray-500 mt-1">Max file size: 10MB</p>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="mb-3 relative">
          <button
            onClick={removeMedia}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 z-10"
          >
            ✕
          </button>
          {mediaType === 'image' ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded border"
            />
          ) : (
            <video
              src={mediaPreview}
              controls
              className="w-full max-h-64 rounded border"
            />
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handlePost}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Post
      </button>
    </div>
  );
}
