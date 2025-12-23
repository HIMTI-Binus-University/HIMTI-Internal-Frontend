import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserAlt,
  FaPlusCircle,
} from "react-icons/fa";

import headerLinkIcon from "../assets/header-link.svg";
import headerProfileIcon from "../assets/header-profile.svg";

const UrlShortenerPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f3f4f6]">
      <Sidebar />

      <main className="flex-1 ml-[260px] p-10 font-sans">
        <header className="flex justify-between items-center mb-10 relative">
          <div className="flex items-center gap-5">
            {" "}
            <img
              src={headerLinkIcon}
              alt="Link Icon"
              className="w-[70px] h-auto object-contain opacity-60"
            />
            <h2 className="text-4xl font-bold text-[#707785] tracking-tight">
              URL Shortener
            </h2>
          </div>

          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-3 cursor-pointer select-none py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <img
                src={headerProfileIcon}
                alt="Profile"
                className="w-[22px] h-[22px] object-contain rounded-full"
              />

              <div className="text-sm text-[#374151]">
                Logged in as <span className="font-bold">Daffa Fayyaz</span>
              </div>

              {isDropdownOpen ? (
                <FaChevronUp size={12} className="text-gray-500" />
              ) : (
                <FaChevronDown size={12} className="text-gray-500" />
              )}
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 flex items-center gap-3 border-b border-gray-50 bg-gray-50/50">
                  <FaUserAlt
                    size={35}
                    className="text-gray-300 p-1 border-2 border-gray-200 rounded-full"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Daffa Fayyaz
                    </span>
                    <span className="text-xs text-gray-500">
                      daffafayyaz@gmail.com
                    </span>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors text-left">
                    <FaPlusCircle className="text-gray-400" /> Add another
                    account
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-medium border-t border-gray-50 mt-1">
                    <FaSignOutAlt /> Sign out of all accounts
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* --- Area Form --- */}
        <div className="border-4 border-dashed border-blue-100 bg-white rounded-2xl h-[65vh] flex flex-col items-center justify-center text-blue-300 gap-4 shadow-inner">
          <h3 className="text-2xl font-black uppercase tracking-widest">
            Area Form & List
          </h3>
          <p className="text-blue-200 font-medium italic">untuk form</p>
        </div>
      </main>
    </div>
  );
};

export default UrlShortenerPage;
