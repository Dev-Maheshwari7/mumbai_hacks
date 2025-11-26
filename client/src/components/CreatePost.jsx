import React, { useState } from "react";
import { useContext } from 'react';
import { credentialsContext } from '../context/context'
import { v4 as uuidv4 } from 'uuid';

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const value = useContext(credentialsContext);
  //   const [image, setImage] = useState("");

// Time-ago calculator (social media style)
  const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count >= 1) return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
    }

    return "just now";
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
      readableTime: timeAgo(postTimestamp),
      post_id:uuidv4()+`-${value.userName}`
    };
    console.log("Post Created:", newPost);
    let response=await fetch('http://localhost:5000/api/auth/savePost', { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...newPost }) })
    let result=await response.json();
    console.log(result.message);
    // reset fields
    setTitle("");
    setContent("");
    // setImage("");
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

      {/* Image URL (optional) */}
      {/* <input
        type="text"
        placeholder="Image URL (optional)"
        className="w-full p-2 mb-3 border rounded focus:ring-2 focus:ring-blue-500"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      /> */}

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
