import React, { useState, useEffect, useContext } from "react";
import { BsHandThumbsUp, BsFillHandThumbsUpFill } from "react-icons/bs";
import { BsHandThumbsDown, BsFillHandThumbsDownFill } from "react-icons/bs";
import { MdSaveAlt, MdDelete } from "react-icons/md";
import { IoSaveOutline } from "react-icons/io5";
import { FaRegShareFromSquare } from "react-icons/fa6";
import { t } from '../translations/translations';
import { LanguageContext } from '../context/context';

// Format numbers like 1K, 2M
function formatNumber(num) {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

// Social media style "time ago"
function timeAgo(timestamp, language = 'en') {
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
        if (count >= 1) {
            const unitTranslated = count > 1 ? t(unit + 's', language) : t(unit, language);
            return `${count} ${unitTranslated} ${t('ago', language)}`;
        }
    }
    return t("just now", language);
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
    targetLanguage = 'en',
    onDeleteSuccess,
    isFollowingInitial, // boolean
    onFollowToggle      // function
}) => {
    const { language } = useContext(LanguageContext);
    
    // Debug media
    // if (media) {
    //     console.log(`Post ${post_id} has media:`, { mediaType, mediaLength: media?.length });
    // }

    // Safe defaults
    const safeLikes = Array.isArray(likes) ? likes : [];
    const safeDislikes = Array.isArray(dislikes) ? dislikes : [];

    // Translation state
    const [translatedTitle, setTranslatedTitle] = useState(title);
    const [translatedContent, setTranslatedContent] = useState(content);
    const [isTranslating, setIsTranslating] = useState(false);
    const [showOriginal, setShowOriginal] = useState(true);

    const [upvotes, setUpvotes] = useState(safeLikes.length);
    const [downvotes, setDownvotes] = useState(safeDislikes.length);
    const [clicked, setClicked] = useState(
        safeLikes.includes(userEmail) ? "up" :
            safeDislikes.includes(userEmail) ? "down" : null
    );
    const [displayTime, setDisplayTime] = useState(timeAgo(timestamp, language));
    const [saved, setSaved] = useState(false);
    const [comments, setComments] = useState([]);
    const [inputComment, setInputComment] = useState("");

    // Translate content when language changes
    useEffect(() => {
        if (targetLanguage !== 'en') {
            translatePost();
        } else {
            setTranslatedTitle(title);
            setTranslatedContent(content);
            setShowOriginal(true);
        }
    }, [targetLanguage]);

    // Translation function
    const translatePost = async () => {
        if (targetLanguage === 'en') {
            setShowOriginal(true);
            return;
        }

        setIsTranslating(true);
        try {
            // Translate title
            const titleRes = await fetch('http://localhost:5000/api/auth/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: title, target_lang: targetLanguage })
            });
            const titleData = await titleRes.json();

            // Translate content
            const contentRes = await fetch('http://localhost:5000/api/auth/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: content, target_lang: targetLanguage })
            });
            const contentData = await contentRes.json();

            if (titleRes.ok && contentRes.ok) {
                setTranslatedTitle(titleData.translated);
                setTranslatedContent(contentData.translated);
                setShowOriginal(false);
            }
        } catch (err) {
            console.error('Translation error:', err);
        } finally {
            setIsTranslating(false);
        }
    };

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

            // console.log(updatedLikes, updatedDislikes);

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
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mb-4 border border-gray-100 shadow-sm hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm">
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-semibold text-gray-900">{username}</h3>
                            <p className="text-gray-600 text-xs">{displayTime}</p>
                            {userEmail !== postOwnerEmail && onFollowToggle && (
                                <button
                                    onClick={onFollowToggle}
                                    className={`px-4 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                                        isFollowingInitial 
                                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                                            : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                                    }`}
                                >
                                    {isFollowingInitial ? "Following" : "Follow"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                {isOwner && (
                    <button
                        onClick={handleDelete}
                        className="text-sm text-red-600 hover:text-red-700 transition-colors shrink-0 font-medium"
                    >
                        Delete
                    </button>
                )}
            </div>

            {/* Title Section */}
            <div className="mb-3">
                <div className="flex justify-between items-start gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {showOriginal ? title : translatedTitle}
                    </h2>
                    {!showOriginal && targetLanguage !== 'en' && (
                        <button
                            onClick={() => setShowOriginal(!showOriginal)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 transition-colors shrink-0 font-medium"
                        >
                            {t('Show Original', language)}
                        </button>
                    )}
                </div>
                {isTranslating && (
                    <p className="text-sm text-indigo-600 italic mt-1 font-medium">{t('Translating...', language)}</p>
                )}
            </div>
            
            {/* Content */}
            <p className="text-gray-700 text-sm mb-4 leading-relaxed whitespace-pre-line">
                {showOriginal ? content : translatedContent}
            </p>

            {/* Media Display */}
            {media && mediaType === 'image' && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img
                        src={media}
                        alt="Post media"
                        className="w-full max-h-[500px] object-cover"
                        onError={(e) => {
                            console.error("Image failed to load for post:", post_id);
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}
            {media && mediaType === 'video' && (
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <video
                        src={media}
                        controls
                        className="w-full max-h-[500px]"
                        onError={(e) => {
                            console.error("Video failed to load for post:", post_id);
                        }}
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-100 mb-4">
                <button 
                    onClick={() => handleReaction("up")} 
                    className={`text-sm transition-all font-semibold ${
                        clicked === "up" 
                            ? "text-green-600" 
                            : "text-gray-500 hover:text-green-600"
                    }`}
                >
                    ↑ {formatNumber(upvotes)}
                </button>

                <button 
                    onClick={() => handleReaction("down")} 
                    className={`text-sm transition-all font-semibold ${
                        clicked === "down" 
                            ? "text-red-600" 
                            : "text-gray-500 hover:text-red-600"
                    }`}
                >
                    ↓ {formatNumber(downvotes)}
                </button>

                <span className="text-xs text-gray-300">•</span>
                <span className="text-sm text-gray-600 font-medium">{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            </div>

            {/* Comment Input */}
            <div className="mb-4">
                <div className="flex gap-2">
                    <input
                        value={inputComment}
                        onChange={(e) => setInputComment(e.target.value)}
                        placeholder={t('Add a comment...', language)}
                        className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                    />
                    <button
                        onClick={handleComment}
                        className="text-sm bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-sm hover:shadow-md"
                    >
                        {t('Comment', language)}
                    </button>
                </div>
            </div>

            {/* Comments */}
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {comments.length === 0 ? (
                    <p className="text-gray-600 text-sm text-center py-6 italic">{t('No comments yet. Be the first to comment!', language)}</p>
                ) : (
                    <div className="space-y-3">
                        {comments.map((c, i) => (
                            <div key={i} className="py-3 px-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="font-semibold text-sm text-gray-900">{c.username || c}</span>
                                    {c.timestamp && (
                                        <span className="text-xs text-gray-600">{timeAgo(c.timestamp, language)}</span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{c.text || c}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Post;
