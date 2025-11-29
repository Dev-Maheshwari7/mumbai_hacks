import React, { useEffect, useState, useContext } from "react";
import { credentialsContext } from "../context/context";

const SuggestedUsersSidebar = () => {
  const { email } = useContext(credentialsContext);
  const [users, setUsers] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/suggestedUsers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.suggested) {
        setUsers(data.suggested);
        const status = {};
        data.suggested.forEach(u => status[u.email] = false);
        setFollowingStatus(status);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollowToggle = async (targetEmail) => {
    const action = followingStatus[targetEmail] ? "unfollow" : "follow";

    try {
      await fetch("http://localhost:5000/api/auth/followToggle", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` 
        },
        body: JSON.stringify({
          followerEmail: email,
          targetEmail: targetEmail,
          action
        }),
      });

      setFollowingStatus(prev => ({
        ...prev,
        [targetEmail]: !prev[targetEmail]
      }));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <aside className="w-80 bg-white border-l border-gray-200 p-6 h-screen sticky top-0 shadow-sm hidden xl:block" style={{ 
      overflow: 'hidden',
      scrollbarWidth: 'none', /* Firefox */
      msOverflowStyle: 'none' /* IE and Edge */
    }}>
      <style jsx>{`
        aside::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      <h3 className="text-lg font-bold mb-4 text-gray-900">
        Suggested for you
      </h3>

      <div className="space-y-4 overflow-hidden">
        {users.length === 0 ? (
          <p className="text-sm text-gray-500">No suggestions available</p>
        ) : (
          users.map((u, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{u.username}</p>
                <p className="text-xs text-gray-500">{u.email}</p>
              </div>

              <button
                onClick={() => handleFollowToggle(u.email)}
                className={`px-4 py-1 text-sm rounded-lg transition-all ${
                  followingStatus[u.email]
                    ? "bg-gray-200 text-gray-700"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {followingStatus[u.email] ? "Following" : "Follow"}
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default SuggestedUsersSidebar;
