import React, { useState, useContext } from "react";
import { credentialsContext, LanguageContext } from "../context/context";
import { v4 as uuidv4 } from "uuid";
import { t } from "../translations/translations";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, replace } from "react-router-dom";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const value = useContext(credentialsContext);
  const { language } = useContext(LanguageContext);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.warn("File size must be less than 10MB", {
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
      return;
    }

    const fileType = file.type.split("/")[0];
    if (fileType !== "image" && fileType !== "video") {
      alert("Only images and videos are allowed");
      return;
    }

    setMediaType(fileType);
    setMediaFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  const handlePost = async () => {
    if (!title || !content) {
      toast.error("Please fill the title and content.", {
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
      return;
    }

    const postTimestamp = Date.now();

    const newPost = {
      name: value.userName,
      email: value.email,
      title,
      content,
      timestamp: postTimestamp,
      post_id: `uuidv4() + -${value.userName}`,
      media: mediaPreview,
      mediaType: mediaType,
    };

    console.log("Post Created with media:", {
      hasMedia: !!mediaPreview,
      mediaType,
      mediaLength: mediaPreview?.length,
    });

    let response = await fetch(
      "http://localhost:5000/api/auth/savePost",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...newPost }),
      }
    );
    let result = await response.json();
    console.log(result.message);

    if (response.ok) {
      toast.success("Post created successfully!", {
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

      setTimeout(() => {
        navigate("/", replace);
      }, 2200);
    }

    setTitle("");
    setContent("");
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
  };

  return (
    <div>

      {/* Title */}
      <input
        type="text"
        placeholder={t("Post title...", language)}
        name="title"
        style={{
          width: '100%',
          padding: '10px 12px',
          marginBottom: '16px',
          fontSize: '14px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          color: '#1f2937',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#9333ea';
          e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* Text Content */}
      <textarea
        placeholder={t(
          "Write your news or information...",
          language
        )}
        style={{
          width: '100%',
          padding: '10px 12px',
          height: '120px',
          marginBottom: '16px',
          fontSize: '14px',
          backgroundColor: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          resize: 'none',
          color: '#1f2937',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#9333ea';
          e.target.style.boxShadow = '0 0 0 3px rgba(147, 51, 234, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db';
          e.target.style.boxShadow = 'none';
        }}
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Media Upload */}
      <div style={{ marginBottom: '16px' }}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '16px',
            border: '2px dashed #d1d5db',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#f9fafb',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3e8ff';
            e.currentTarget.style.borderColor = '#9333ea';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
            style={{ display: 'none' }}
          />
          <span
            style={{
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            {t("Click to upload image or video", language)}
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '6px' }}>
          {t("Max file size: 10MB", language)}
        </p>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div style={{ marginBottom: '16px', position: 'relative' }}>
          <button
            onClick={removeMedia}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              fontSize: '13px',
              color: 'white',
              backgroundColor: '#dc2626',
              borderRadius: '6px',
              padding: '6px 12px',
              zIndex: 10,
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            {t("Remove", language)}
          </button>
          {mediaType === "image" ? (
            <img
              src={mediaPreview}
              alt="Preview"
              style={{
                width: '100%',
                maxHeight: '192px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          ) : (
            <video
              src={mediaPreview}
              controls
              style={{
                width: '100%',
                maxHeight: '192px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}
            />
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={handlePost}
        style={{
          width: '100%',
          fontSize: '14px',
          backgroundColor: '#9333ea',
          color: 'white',
          padding: '12px',
          borderRadius: '8px',
          border: 'none',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#7e22ce';
          e.target.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#9333ea';
          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
        }}
      >
        {t("Post", language)}
      </button>

      <ToastContainer />
    </div>
  );
}