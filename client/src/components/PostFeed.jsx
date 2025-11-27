import React, { useEffect, useState, useContext } from "react";
import Post from "./Post";
import { credentialsContext } from "../context/context";

const PostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const { userName, email } = useContext(credentialsContext); // get current user
  const [followingStatus, setFollowingStatus] = useState({});
  // key = postOwnerEmail, value = true/false


  const fetchPosts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/getPosts");
      const data = await res.json();

      if (data.posts) {
        // console.log("Fetched posts:", data.posts.map(p => ({ 
        //   id: p.post_id, 
        //   hasMedia: !!p.media, 
        //   mediaType: p.mediaType 
        // })));
        // setPosts(data.posts.reverse()); // newest first
      }

      if (data.posts) {
        setPosts(data.posts.reverse());

        // Fetch who the current user is following for each post
        const status = {};
        data.posts.forEach(p => {
          status[p.email] = false; // default, will update via API
        });

        // optional: fetch all following at once from backend
        fetch("http://localhost:5000/api/auth/getFollowingStatus", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
           },
          body: JSON.stringify({ followerEmail: email })   // FIXED
        })
          .then(res => res.json())
          .then(data => {
            if (data.following) {
              data.following.forEach(followedEmail => {
                status[followedEmail] = true;
              });
              setFollowingStatus(status);
            }
          })
          .catch(err => console.error(err));
      }

    } catch (err) {
  console.error("Error fetching posts:", err);
}
  };

useEffect(() => {
  fetchPosts();
}, []);


const handleFollowToggle = async (targetEmail) => {
  const action = followingStatus[targetEmail] ? "unfollow" : "follow";
  try {
    const res = await fetch("http://localhost:5000/api/auth/followToggle", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" ,
        "Authorization": `Bearer ${localStorage.getItem("token")}`, 
      },
      body: JSON.stringify({ followerEmail: email, targetEmail: targetEmail, action }),
    });
    const data = await res.json();
    if (res.ok) {
      setFollowingStatus(prev => ({ ...prev, [targetEmail]: !prev[targetEmail] }));
    } else {
      alert(data.message || "Failed to update follow status");
    }
  } catch (err) {
    console.error(err);
  }
};


const handleDeleteSuccess = (deletedPostId) => {
  setPosts(posts.filter(p => p.post_id !== deletedPostId));
};


function normalizeTimestamp(post) {
  let t = post.timestamp;
  // console.log(t);
  // Case 1: MongoDB extended format: { $numberLong: "1764175158189" }
  if (t && typeof t === "object" && t.$numberLong) {
    return Number(t.$numberLong);
  }

  // Case 2: Backend already converted timestamp to number
  if (typeof t === "number") {
    return t;
  }

  // Case 3: String number (e.g. "1764175158189")
  if (typeof t === "string" && !isNaN(Number(t))) {
    return Number(t);
  }

  // Case 4: Completely missing → return a safe value
  console.warn("Post has invalid timestamp:", post.post_id, post);
  return 0;
}


return (
  <div className="flex flex-col items-center mt-6">
    {posts.map((p, i) => (
      <Post
        key={i}
        post_id={p.post_id}
        username={p.username}
        title={p.title}
        content={p.content}
        timestamp={normalizeTimestamp(p)}
        userEmail={email}      // current logged-in user
        userUsername={userName} // current logged-in username
        postOwnerEmail={p.email} // post owner's email
        likes={p.likes || []}  // default empty array
        dislikes={p.dislikes || []} // default empty array
        media={p.media}
        mediaType={p.mediaType}
        onDeleteSuccess={handleDeleteSuccess}
        isFollowingInitial={followingStatus[p.email]}   // NEW
        onFollowToggle={() => handleFollowToggle(p.email)}  // NEW
      />
    ))}
  </div>
);
};

export default PostsFeed;
