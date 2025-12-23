import React, { useState } from "react"; // Pastikan import useState
import Sidebar from "../components/Sidebar";
import {
  FaLink,
  FaUserCircle,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserAlt,
  FaPlusCircle,
} from "react-icons/fa";

const UrlShortenerPage = () => {
  // State untuk mengontrol menu dropdown profile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#f3f4f6]">
      <Sidebar />

      <main className="flex-1 ml-[260px] p-10 font-public-sans">
        {/* --- HEADER FIX --- */}
        <header className="flex justify-between items-start mb-10 relative">
          {/* Sisi Kiri: Judul besar & Icon Link (Abu-abu) */}
          <div className="flex items-center gap-4 text-[#9ca3af]">
            <FaLink size={40} />
            <h2 className="text-4xl font-bold text-[#4b5563] tracking-tight">
              URL Shortener
            </h2>
          </div>

          {/* Sisi Kanan: Profile Section Interaktif */}
          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-3 cursor-pointer select-none py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {/* Logo Profile di sebelah kiri */}
              <FaUserCircle size={28} className="text-gray-500" />

              <div className="text-sm text-[#374151]">
                Logged in as <span className="font-bold">Daffa Fayyaz</span>
              </div>

              {/* Arrow Icon yang berubah arah berdasarkan klik */}
              {isDropdownOpen ? (
                <FaChevronUp size={14} className="text-gray-500" />
              ) : (
                <FaChevronDown size={14} className="text-gray-500" />
              )}
            </div>

            {/* Menu Dropdown (Muncul saat diklik) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Dropdown (Inspirasi image_ae598d.png) */}
                <div className="p-4 flex items-center gap-3 border-b border-gray-50 bg-gray-50/50">
                  <FaUserCircle size={40} className="text-gray-400" />
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-800">
                      Daffa Fayyaz
                    </span>
                    <span className="text-xs text-gray-500">
                      daffafayyaz@gmail.com
                    </span>
                  </div>
                </div>

                {/* List Menu */}
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

        {/* --- Area Form (Tugas Temen Lu) --- */}
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
