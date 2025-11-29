import React, { useState, useContext } from "react";
import { t } from "../translations/translations";
import { LanguageContext } from "../context/context";
import { HiX } from "react-icons/hi";
import PostsFeed from "./PostFeed";

export default function SearchModal({ isOpen, onClose }) {
  const { language } = useContext(LanguageContext);
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center items-start pt-24 px-4">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <HiX className="w-6 h-6" />
        </button>

        {/* Updated Search Box */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder={t("Search posts...", language)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-indigo-500 focus:border-indigo-500 text-sm w-64"
          />

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Posts Feed */}
        <div className="max-h-[400px] overflow-y-auto">
          <PostsFeed targetLanguage={language} searchQuery={searchQuery} />
        </div>
      </div>
    </div>
  );
}
