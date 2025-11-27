import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Post from "../components/Post";
import { useContext } from 'react';
import { credentialsContext } from '../context/context'

export default function ProtectedProfile() {
    const { email } = useParams();
    const [user, setUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const value = useContext(credentialsContext);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            const token = localStorage.getItem("token");

            // Fetch User
            const userRes = await fetch("http://localhost:5000/api/auth/getUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ email }),
            });

            const userData = await userRes.json();
            setUser(userData.user);

            // Fetch Posts
            const postRes = await fetch("http://localhost:5000/api/auth/getUserPosts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ email }),
            });

            const postData = await postRes.json();
            setPosts(postData.posts || []);
        }

        fetchData();
    }, [email]);

    return (
        <div className="w-full min-h-screen p-6 bg-gray-100">
            <button className="mb-4" onClick={() => navigate(-1)}>
                ◀ Back
            </button>

            <div className="bg-white shadow p-6 rounded">
                <h2 className="text-2xl font-bold">{user?.username}</h2>
            </div>

            <h3 className="text-xl mt-6 font-bold">Posts</h3>

            {posts.length === 0 ? (
                <p className="mt-3">No posts yet.</p>
            ) : (
                posts.map((post, i) => (
                    <Post
                        key={i}
                        {...post}
                        userEmail={value.email}
                        userUsername={value.userName}
                        showDelete={false} // ← DISABLE DELETE
                        isProtectedView={true} // ← DISABLE EDIT
                    />
                ))
            )}
        </div>
    );
}
