import React, { useContext, useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LanguageContext } from "../context/context";
import { t } from "../translations/translations";
import { NavLink } from "react-router-dom";

// import { useState } from "react";

import {
  HiHome,
  HiUser,
  HiPencil,
  HiLogout,
  HiSearch,
  HiPhotograph,
  HiVideoCamera,
} from "react-icons/hi";
import { HiChatBubbleLeftRight, HiLink } from "react-icons/hi2";
import SearchModal from "./SearchModal";

export default function Navbar({ user, onLogout }) {
  const { language, setLanguage } = useContext(LanguageContext);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (onLogout) onLogout();
  };

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const blockScroll = (e) => e.preventDefault();

    el.addEventListener("wheel", blockScroll, { passive: false });
    el.addEventListener("touchmove", blockScroll, { passive: false });

    return () => {
      el.removeEventListener("wheel", blockScroll);
      el.removeEventListener("touchmove", blockScroll);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
    <aside
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full w-72 bg-white border-r border-gray-200 shadow-lg p-6 flex flex-col justify-between overflow-hidden"
    >
      {/* TOP SECTION: Brand + Nav Buttons */}
      <div>
        {/* Brand */}
        <h1
          className="text-2xl font-extrabold text-gray-900 mb-6 cursor-pointer hover:text-purple-700 transition-all"
          onClick={() => navigate("/")}
        >
          {t("Social Media", language)}
        </h1>

        {/* NAVIGATION */}
        <nav>
          <ul className="space-y-2">
            {[
              { icon: <HiHome className="w-5 h-5 text-purple-600" />, label: "Home", path: "/" },
              { icon: <HiUser className="w-5 h-5 text-purple-600" />, label: "My Profile", path: "/profile" },
              { icon: <HiPencil className="w-5 h-5 text-purple-600" />, label: "Create Post", path: "/create" },
              { icon: <HiSearch className="w-5 h-5 text-purple-600" />, label: "Trending", path: "/trending" },
              { icon: <HiChatBubbleLeftRight className="w-5 h-5 text-purple-600" />, label: "Chatbot", path: "/conversation" },
              { icon: <HiLink className="w-5 h-5 text-purple-600" />, label: "Link Checker", path: "/aiagent" },
              { icon: <HiPhotograph className="w-5 h-5 text-purple-600" />, label: "Image Analysis", path: "/analyze" },
              { icon: <HiVideoCamera className="w-5 h-5 text-purple-600" />, label: "Video Analysis", path: "/video" },
              { icon: <HiLogout className="w-5 h-5" />, label: "Logout", path: "logout" },
            ].map(({ icon, label, path }) => (
              <li key={label}>
                <button
                  onClick={() => (path === "logout" ? handleLogout() : navigate(path))}
                  className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-lg transition-all
                    ${path !== "logout" && isActive(path)
                      ? "bg-purple-100 text-purple-700 shadow"
                      : "text-gray-900 hover:bg-purple-50 hover:text-purple-700"
                    }
                    ${path === "logout" ? "text-red-600 hover:bg-red-50" : ""}
                  `}
                >
                  {icon}
                  {t(label, language)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* BOTTOM SECTION: Username + Language Selector */}
      <div className="flex items-center justify-between mt-6">
        {user && <p className="text-sm font-medium text-gray-800">{user.username}</p>}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-purple-200"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="hi">हिन्दी</option>
          <option value="zh-cn">中文</option>
          <option value="ja">日本語</option>
          <option value="ar">العربية</option>
          <option value="pt">Português</option>
          <option value="ru">Русский</option>
        </select>
      </div>
    </aside>
    {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
