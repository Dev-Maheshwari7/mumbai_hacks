import React, { useEffect, useState, useContext } from "react";
import Post from "./Post";
import { credentialsContext } from "../context/context";

const PostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const { userName, email } = useContext(credentialsContext); // get current user

  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/getPosts");
      const data = await res.json();

      if (data.posts) {
        console.log("Fetched posts:", data.posts.map(p => ({ 
          id: p.post_id, 
          hasMedia: !!p.media, 
          mediaType: p.mediaType 
        })));
        setPosts(data.posts.reverse()); // newest first
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDeleteSuccess = (deletedPostId) => {
    setPosts(posts.filter(p => p.post_id !== deletedPostId));
  };

  return (
    <div className="flex flex-col items-center mt-6">
      {posts.map((p, i) => (
        <Post
          key={i}
          post_id={p.post_id}
          username={p.username}
          title={p.title}
          content={p.content}
          timestamp={Number(p.timestamp?.$numberLong) || p.timestamp || Date.now()}
          userEmail={email}      // current logged-in user
          userUsername={userName} // current logged-in username
          postOwnerEmail={p.email} // post owner's email
          likes={p.likes || []}  // default empty array
          dislikes={p.dislikes || []} // default empty array
          media={p.media}
          mediaType={p.mediaType}
          onDeleteSuccess={handleDeleteSuccess}
        />
      ))}
    </div>
  );
};

export default PostsFeed;
