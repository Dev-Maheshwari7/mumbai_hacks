import React, { useState, useEffect } from "react";
import { BsHandThumbsUp, BsFillHandThumbsUpFill } from "react-icons/bs";
import { BsHandThumbsDown, BsFillHandThumbsDownFill } from "react-icons/bs";
import { MdSaveAlt, MdDelete } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";
import { FaRegShareFromSquare } from "react-icons/fa6";

// Format numbers like 1K, 2M
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

// Social media style "time ago"
function timeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - Number(timestamp)) / 1000);
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
}

const Post = ({
    post_id,
    username,
    title,
    content,
    timestamp,
    userEmail,
    userUsername,
    postOwnerEmail,
    likes = [],
    dislikes = [],
    media,
    mediaType,
    onDeleteSuccess
}) => {
    // Debug media
    if (media) {
        console.log(`Post ${post_id} has media:`, { mediaType, mediaLength: media?.length });
    }
    
    // Safe defaults
    const safeLikes = Array.isArray(likes) ? likes : [];
    const safeDislikes = Array.isArray(dislikes) ? dislikes : [];

    const [upvotes, setUpvotes] = useState(safeLikes.length);
    const [downvotes, setDownvotes] = useState(safeDislikes.length);
    const [clicked, setClicked] = useState(
        safeLikes.includes(userEmail) ? "up" :
            safeDislikes.includes(userEmail) ? "down" : null
    );
    const [displayTime, setDisplayTime] = useState(timeAgo(timestamp));
    const [saved, setSaved] = useState(false);
    const [comments, setComments] = useState([]);
    const [inputComment, setInputComment] = useState("");

    // Update "x minutes ago" every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayTime(timeAgo(timestamp));
        }, 60000);
        return () => clearInterval(timer);
    }, [timestamp]);

    useEffect(() => {
        if (likes.includes(userEmail)) {
            setClicked("up");
        } else if (dislikes.includes(userEmail)) {
            setClicked("down");
        } else {
            setClicked(null);
        }
    }, [likes, dislikes, userEmail]);

    // Handle reaction (like/dislike)
    const handleReaction = async (action) => {
        const mappedAction = action === "up" ? "like" : "dislike";

        try {
            const res = await fetch("http://localhost:5000/api/auth/reactPost", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id, email: userEmail, action: mappedAction }),
            });

            const data = await res.json();
            const updatedLikes = Array.isArray(data.likes) ? data.likes : [];
            const updatedDislikes = Array.isArray(data.dislikes) ? data.dislikes : [];

            console.log(updatedLikes, updatedDislikes);

            setUpvotes(updatedLikes.length);
            setDownvotes(updatedDislikes.length);

            if (updatedLikes.includes(userEmail)) setClicked("up");
            else if (updatedDislikes.includes(userEmail)) setClicked("down");
            else setClicked(null);

        } catch (err) {
            console.error("Error reacting:", err);
        }
    };



    //handle reaction fetched at load
    const handleReactionFetched = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/postReacted", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: username }),
            });

            const data = await res.json();
            const fetchedPosts = data.posts || [];

            // Find THIS specific post
            const currentPost = fetchedPosts.find(p => p.post_id === post_id);

            if (!currentPost) return; // This post wasn’t returned

            const updatedLikes = currentPost.likes || [];
            const updatedDislikes = currentPost.dislikes || [];

            // Update UI
            setUpvotes(updatedLikes.length);
            setDownvotes(updatedDislikes.length);

            if (updatedLikes.includes(userEmail)) setClicked("up");
            else if (updatedDislikes.includes(userEmail)) setClicked("down");
            else setClicked(null);

        } catch (err) {
            console.error("Error fetching reaction:", err);
        }
    };


    useEffect(() => {
        handleReactionFetched();
        fetchComments();
    }, []);

    // Fetch comments from backend
    const fetchComments = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/auth/getComments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ post_id }),
            });

            const data = await res.json();
            if (data.comments) {
                setComments(data.comments);
            }
        } catch (err) {
            console.error("Error fetching comments:", err);
        }
    };


    // Comment handling
    const handleComment = async () => {
        if (inputComment.trim() === "") return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch("http://localhost:5000/api/auth/addComment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    post_id,
                    comment: inputComment,
                    email: userEmail,
                    username: userUsername
                }),
            });

            const data = await res.json();

            if (res.ok) {
                // Add the new comment to local state
                setComments([...comments, data.comment]);
                setInputComment("");
            } else {
                alert(data.message || 'Failed to add comment');
            }
        } catch (err) {
            console.error("Error adding comment:", err);
            alert('Error adding comment');
        }
    };

    // Delete post
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch("http://localhost:5000/api/auth/deletePost", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ post_id, email: userEmail }),
            });

            const data = await res.json();

            if (res.ok) {
                alert('Post deleted successfully!');
                if (onDeleteSuccess) {
                    onDeleteSuccess(post_id);
                }
            } else {
                alert(data.message || 'Failed to delete post');
            }
        } catch (err) {
            console.error("Error deleting post:", err);
            alert('Error deleting post');
        }
    };

    // Check if current user is the post owner
    const isOwner = postOwnerEmail === userEmail;

    return (
        <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-lg mb-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{username}</h3>
                <div className="flex items-center space-x-3">
                    <p className="text-gray-500 text-sm">{displayTime}</p>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 transition"
                            title="Delete post"
                        >
                            <MdDelete size={20} />
                        </button>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-800 mb-4">{content}</p>

            {/* Media Display */}
            {media && mediaType === 'image' && (
                <div className="mb-4">
                    <img
                        src={media}
                        alt="Post media"
                        className="w-full max-h-96 object-cover rounded-lg"
                        onError={(e) => {
                            console.error("Image failed to load for post:", post_id);
                            e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log("Image loaded successfully for post:", post_id)}
                    />
                </div>
            )}
            {media && mediaType === 'video' && (
                <div className="mb-4">
                    <video
                        src={media}
                        controls
                        className="w-full max-h-96 rounded-lg"
                        onError={(e) => {
                            console.error("Video failed to load for post:", post_id);
                        }}
                    />
                </div>
            )}

            {/* Vote Buttons */}
            <div className="flex items-center space-x-4 mb-4">
                <button onClick={() => handleReaction("up")} className="flex items-center space-x-2">
                    {clicked === "up" ? (
                        <BsFillHandThumbsUpFill className="text-green-600" />
                    ) : (
                        <BsHandThumbsUp className="text-green-400 hover:text-green-700" />
                    )}
                    <span>{formatNumber(upvotes)}</span>
                </button>

                <button onClick={() => handleReaction("down")} className="flex items-center space-x-2">
                    {clicked === "down" ? (
                        <BsFillHandThumbsDownFill className="text-red-600" />
                    ) : (
                        <BsHandThumbsDown className="text-red-400 hover:text-red-700" />
                    )}
                    <span>{formatNumber(downvotes)}</span>
                </button>

                {/* Save */}
                <button onClick={() => setSaved(!saved)} className="ml-auto text-xl">
                    {saved ? <IoSaveOutline /> : <MdSaveAlt />}
                </button>

                {/* Share */}
                <button
                    onClick={() => {
                        if (navigator.share) navigator.share({ title, text: content });
                        else alert("Sharing is not supported on this device.");
                    }}
                    className="text-xl"
                >
                    <FaRegShareFromSquare />
                </button>
            </div>

            {/* Comment Input */}
            <div className="mb-3">
                <input
                    value={inputComment}
                    onChange={(e) => setInputComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={handleComment}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
                >
                    Comment
                </button>
            </div>

            {/* Comments */}
            <div className="max-h-40 overflow-y-auto">
                <h4 className="font-semibold mb-2">Comments ({comments.length}):</h4>
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
                ) : (
                    comments.map((c, i) => (
                        <div key={i} className="p-3 bg-gray-100 rounded mb-2">
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-semibold text-sm text-blue-600">{c.username || c}</span>
                                {c.timestamp && (
                                    <span className="text-xs text-gray-500">{timeAgo(c.timestamp)}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-800">{c.text || c}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Post;
