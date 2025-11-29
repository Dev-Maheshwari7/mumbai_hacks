import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function FollowersPage() {
    const [followers, setFollowers] = useState([]);
    const { email } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFollowers = async () => {
            const res = await fetch(
                "http://localhost:5000/api/auth/getFollowers",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    },
                    body: JSON.stringify({ email }),
                }
            );

            const data = await res.json();
            setFollowers(data.followers || []);
        };

        fetchFollowers();
    }, [email]);

    return (
        <div className="p-6">
            <button className="mb-4" onClick={() => navigate(-1)}>
                ◀ Back
            </button>
            <h2 className="text-xl font-bold mb-4">Followers</h2>

            {followers.length === 0 ? (
                <p className="text-gray-600">No followers yet.</p>
            ) : (
                followers.map((f, i) => (
                    <div
                        key={i}
                        className="p-3 bg-white shadow rounded mb-3 cursor-pointer hover:bg-blue-100"
                        onClick={() => navigate(`/user/${f}`)}
                    >
                        {f}
                    </div>
                ))
            )}
        </div>
    );
}
