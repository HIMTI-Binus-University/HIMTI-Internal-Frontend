import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserAlt,
  FaPlusCircle,
} from "react-icons/fa";
import { LinkIcon, ProfileIcon } from "@/components/icons";
import CreateLinkForm from "./CreateLinkForm";
import ExistingLink from "./ExistingLink";


const UrlShortenerPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    
    <div className="flex min-h-screen w-full bg-grayscale-50">
      <Sidebar />

      <main className="flex-1 ml-[393px] px-8 py-12 font-sans">
        <header className="flex justify-between items-start mb-8 relative">
          <div className="flex items-center gap-5 p-2">
            <LinkIcon width={96} height={96} className="opacity-50" />
            <h2 className="text-h2 font-bold text-black/50 ">URL Shortener</h2>
          </div>

          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-3 cursor-pointer select-none py-2 px-3 rounded-md hover:bg-grayscale-100 transition-colors"
            >
              <ProfileIcon width={32} height={32} className="rounded-full" />

              <div className="text-h5 text-black/50">
                Logged in as{" "}
                <span className="font-bold text-black">Daffa Fayyaz</span>
              </div>

              {isDropdownOpen ? (
                <FaChevronUp size={12} className="text-gray-500" />
              ) : (
                <FaChevronDown size={12} className="text-gray-500" />
              )}
            </div>

            {/* NOTE: Ini Popup di figma jadi nnti revisi lagi */}
            {/* NOTE: JANGAN ADA YANG PAKE WARNA SELAIN YANG ADA DI TAILWIND CONFIG */}
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

          
        <CreateLinkForm />
        <ExistingLink />

        {/* NOTE: JANGAN ADA YANG PAKE WARNA SELAIN YANG ADA DI TAILWIND CONFIG */}
        {/* <div className="border-4 border-dashed border-blue-100 bg-white rounded-2xl h-[65vh] flex flex-col items-center justify-center text-blue-300 gap-4 shadow-inner">
          <h3 className="text-2xl font-black uppercase tracking-widest">
            Area Form & List
          </h3>
          <p className="text-blue-200 font-medium italic">untuk form</p>
        </div> */}

      </main>
    </div>
  );
};

export default UrlShortenerPage;
