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
    <div
      className="
        min-h-screen
        flex
        flex-col
        bg-gradient-to-br from-sky-300 via-sky-500 to-blue-900
      "
    >
      {/* Area under navbar */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {/* Big blue background panel */}
        <div
          className="
            relative
            w-full
            max-w-xl
            rounded-3xl
            overflow-hidden
            bg-gradient-to-r from-sky-500 via-blue-700 to-slate-900
            shadow-[0_24px_80px_rgba(15,23,42,0.7)]
          "
        >
          {/* Abstract blobs */}
          <div className="pointer-events-none">
            <div className="absolute -top-16 -left-10 w-56 h-56 bg-sky-300/25 rounded-[50%] blur-3xl" />
            <div className="absolute -bottom-24 left-10 w-64 h-64 bg-sky-400/25 rounded-[45%] blur-3xl" />
            <div className="absolute -top-24 right-0 w-64 h-64 bg-blue-900/50 rounded-[55%] blur-3xl" />
            <div className="absolute bottom-0 right-10 w-40 h-40 bg-blue-600/35 rounded-[45%] blur-2xl" />
          </div>

          {/* Small rounded shapes */}
          <div className="pointer-events-none">
            <div className="absolute top-16 left-16 w-20 h-7 rounded-full bg-sky-100/80" />
            <div className="absolute top-32 left-32 w-16 h-6 rounded-full bg-sky-200/80" />
            <div className="absolute bottom-16 right-24 w-24 h-8 rounded-full bg-sky-100/80" />
          </div>

          {/* Shadow card (no glass) */}
          <div className="relative flex items-center justify-center py-14 px-4 sm:px-10">
            <div
              className="
                w-full max-w-xl
                bg-white
                rounded-2xl
                shadow-2xl
                px-6 sm:px-8 py-7
              "
            >
              <h3 className="text-base font-bold mb-4 text-gray-900">
                {t("Create Post", language)}
              </h3>

              {/* Title */}
              <input
                type="text"
                placeholder={t("Post title...", language)}
                name="title"
                className="
                  w-full px-4 py-2.5 mb-3 text-sm
                  bg-white border border-gray-200
                  rounded-lg text-gray-900 placeholder-gray-500
                  focus:outline-none focus:border-sky-500 focus:ring-2
                  focus:ring-sky-200 transition-all
                "
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              {/* Text Content */}
              <textarea
                placeholder={t(
                  "Write your news or information...",
                  language
                )}
                className="
                  w-full px-4 py-2.5 h-32 mb-3 text-sm
                  bg-white border border-gray-200
                  rounded-lg resize-none text-gray-900
                  placeholder-gray-500
                  focus:outline-none focus:border-sky-500 focus:ring-2
                  focus:ring-sky-200 transition-all
                "
                name="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {/* Media Upload */}
              <div className="mb-3">
                <label
                  className="
                    flex items-center justify-center
                    w-full p-4 border-2 border-dashed border-gray-300
                    rounded-lg cursor-pointer
                    bg-gray-50 hover:bg-sky-50
                    hover:border-sky-400
                    transition-all group
                  "
                >
                  <input
                    type="file"
                    accept="image/,video/"
                    onChange={handleMediaChange}
                    className="hidden"
                  />
                  <span
                    className="
                      text-sm text-gray-700
                      group-hover:text-sky-700 font-medium
                    "
                  >
                    {t("Click to upload image or video", language)}
                  </span>
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  {t("Max file size: 10MB", language)}
                </p>
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className="mb-3 relative">
                  <button
                    onClick={removeMedia}
                    className="
                      absolute top-2 right-2 text-sm text-white
                      bg-red-600 hover:bg-red-700
                      rounded-lg px-3 py-1.5 z-10 font-medium
                      shadow-md
                    "
                  >
                    {t("Remove", language)}
                  </button>
                  {mediaType === "image" ? (
                    <img
                      src={mediaPreview}
                      alt="Preview"
                      className="
                        w-full max-h-48 object-cover rounded-lg
                        border border-gray-200 shadow-sm
                      "
                    />
                  ) : (
                    <video
                      src={mediaPreview}
                      controls
                      className="
                        w-full max-h-48 rounded-lg
                        border border-gray-200 shadow-sm
                      "
                    />
                  )}
                </div>
              )}

              {/* Button */}
              <button
                onClick={handlePost}
                className="
                  w-full text-sm
                  bg-gradient-to-r from-sky-500 to-blue-600
                  text-white py-2.5 rounded-lg
                  hover:from-sky-400 hover:to-blue-700
                  transition-all font-semibold shadow-md hover:shadow-lg
                "
              >
                {t("Post", language)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}