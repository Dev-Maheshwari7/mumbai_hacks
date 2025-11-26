import React, { useState, useEffect } from "react";
import { BsHandThumbsUp, BsFillHandThumbsUpFill } from "react-icons/bs";
import { BsHandThumbsDown, BsFillHandThumbsDownFill } from "react-icons/bs";
import { MdSaveAlt } from "react-icons/md";
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
    likes = [],
    dislikes = []
}) => {
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
    }, []);


    // Comment handling
    const handleComment = () => {
        if (inputComment.trim() !== "") {
            setComments([...comments, inputComment]);
            setInputComment("");
        }
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-5 w-full max-w-lg mb-5">
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{username}</h3>
                <p className="text-gray-500 text-sm">{displayTime}</p>
            </div>

            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-gray-800 mb-4">{content}</p>

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
                <h4 className="font-semibold mb-2">Comments:</h4>
                {comments.map((c, i) => (
                    <div key={i} className="p-2 bg-gray-100 rounded mb-2">{c}</div>
                ))}
            </div>
        </div>
    );
};

export default Post;
