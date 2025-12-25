import { useState } from "react";
import { 
  Sidebar, 
  Button,
  LinkDetails,
} from "@/components/Utils";

import {
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUserAlt,
  FaPlusCircle,
  FaSearch,
  FaPlus,
  FaBars,
} from "react-icons/fa";

import {
  CalendarIcon,
  ExpiredIcon,
  DownRightIcon,
  LinkIconV2,
  ProfileIcon,
} from "@/components/icons";
import Popup from "@/components/Utils/Popup";

const UrlShortenerPage = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // POPUPS
  const [showConfirmPopup, setConfirmPopup] = useState(false);
  const [showDeletePopup, setDeletePopup] = useState(false);
  const [showEditPopup, setEditPopup] = useState(false);

  const [selectedLink, setSelectedLink] = useState<{
    id: number;
    shortUrl: string;
    targetUrl: string;
    createdAt: string;
    expiresAt: string;
  } | null>(null);

  const [expiryDate, setExpiryDate] = useState("");

  // DUMMY JSON RETURN DATA
  const links = [
    {
      id: 1,
      shortUrl: "himtibinus.or.id/ReallyCoolVideos",
      targetUrl: "www.youtube.com",
      createdAt: "20 December, 2025",
      expiresAt: "21 December, 2025, 23:59:59",
    },
    {
      id: 2,
      shortUrl: "himtibinus.or.id/EventHighlights",
      targetUrl: "www.instagram.com",
      createdAt: "18 December, 2025",
      expiresAt: "25 December, 2025, 23:59:59",
    },
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-grayscale-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 ml-[393px] max-xl:ml-0 px-8 py-6 font-sans">
        <header className="flex justify-between items-center mb-8 relative">
          <div className="flex flex-row gap-4">
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-grayscale-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>
      
            <div className="flex items-center gap-5 p-2">
              <LinkIconV2 width={80} height={80} 
                          className="max-xl:w-[60px] max-xl:h-[60px]" 
              />
              <h2 className="text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold  font-bold text-black/50 ">URL Shortener</h2>
            </div>
          </div>

          <div className="relative">
            <div
              onClick={toggleDropdown}
              className="flex items-center gap-3 cursor-pointer select-none py-2 px-3 rounded-lg hover:bg-grayscale-100 transition-colors"
            >
              <ProfileIcon width={32} height={32} className="rounded-full" />

              <div className="text-h6 max-xl:text-body-1 text-black/50">
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

        {/* FORM CREATE LINK */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h3 className="text-h5 font-bold mb-6">Create New Link</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-body-1 mb-1">Target Link</label>
              <input
                type="text"
                placeholder="www.youtube.com"
                className="w-full border  border-black/25 rounded-xl p-4 outline-none text-body-1"
              />
            </div>

            <div className="gap-4 grid grid-cols-2
                            max-xl:flex max-xl:flex-col">
              <div className="flex-1">
                <label className="block text-body-1 mb-1">Short Link</label>

                <div className="flex rounded-xl overflow-hidden border border-black/25">
                  <span className="bg-grayscale-100 text-black/70 text-body1 px-3 flex items-center whitespace-nowrap font-bold">
                    https://himtibinus.or.id/
                  </span>

                  <input
                    type="text"
                    className="flex-1 p-4  outline-none text-body-1 "
                    placeholder="ReallyCoolVideos"
                  />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-body-1 mb-1">
                  Link Expiry Date{" "}
                  <span className="text-body-2 text-black/50">
                    (leave blank if doesn’t expire.)
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`w-full border border-black/25 ${
                    expiryDate ? "text-black" : "text-black/25"
                  } outline-none rounded-xl p-4 text-body-1`}
                />
              </div>
            </div>
            
            <Button text="Create Link" icon={<FaPlus/>} onClick={() => setConfirmPopup(true)}></Button>
          </div>
        </div>

        {/* LINK CREATION CONFIRMATION POPUP */}
        {showConfirmPopup && (
          <Popup
            component={(
              <div className="relative bg-white rounded-xl shadow-xl p-5">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold">Link Created</h3>
                  <div className="flex flex-col gap-2 border border-black/25 rounded-xl p-6">
                    <p className="font-bold text-h6">{links[0].shortUrl}</p>

                    <div className="flex items-center gap-2 text-body-1">
                      <DownRightIcon />
                      <span>{links[0].targetUrl}</span>
                    </div>

                    <div className="flex items-center gap-6 text-body-3 text-black/50 mt-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon />
                        Created on {links[0].createdAt}
                      </div>

                      <div className="flex items-center gap-1">
                        <ExpiredIcon />
                        Expires on {links[0].expiresAt}
                      </div>
                    </div>
                  </div>
                  
                  <Button onClick={() => setConfirmPopup(false)} text="Done"></Button>
                </div>
              </div>
            )}
          />
        )}

        {/* CARD URL */}
        <div className="bg-white rounded-xl shadow p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h5 font-bold">Existing Links</h3>
          </div>

          <div className="flex gap-3 mb-6"> 
            <input
              type="text"
              placeholder="Search..."
              className="border outline-none rounded-xl py-3 px-4 border-black/25  w-full text-body-1"
            />
            <Button text="Search" icon={<FaSearch/>}></Button>
          </div>

          <div className="space-y-4">
            {links.map((link) => (
              <LinkDetails
                key={link.id}
                short={link.shortUrl}
                target={link.targetUrl}
                created={link.createdAt}
                expires={link.expiresAt}
                isCopied={copiedId === link.id}
                onEdit={() => {
                  setSelectedLink(link);
                  setEditPopup(true);
                }}
                onDelete={() => {
                  setSelectedLink(link);
                  setDeletePopup(true);
                }}
                onCopy={() => {
                  navigator.clipboard.writeText(`https://${link.shortUrl}`);
                  setCopiedId(link.id);

                  setTimeout(() => {
                    setCopiedId(null);
                  }, 1500);
                }}
              />
            ))}
          </div>
        </div>
          
        {/* EDIT FORM */}
        {showEditPopup && selectedLink && (
          <Popup
            component={(
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-[480px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold">Edit Link</h3>

                  <div>
                    <label className="block text-body-1 mb-1">Target Link</label>
                    <input
                      type="text"
                      defaultValue={selectedLink.targetUrl}
                      className="w-full border border-black/25 rounded-xl p-4 outline-none text-body-1"
                    />
                  </div>

                  <div>
                    <label className="block text-body-1 mb-1">Short Link</label>
                    <div className="flex rounded-xl overflow-hidden border border-black/25">
                      <span className="bg-grayscale-100 px-3 flex items-center font-bold">
                        https://himtibinus.or.id/
                      </span>
                      <input
                        type="text"
                        defaultValue={selectedLink.shortUrl.replace("himtibinus.or.id/", "")}
                        className="flex-1 p-4 outline-none text-body-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-body-1 mb-1">
                      Link Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      defaultValue={selectedLink.expiresAt}
                      className="w-full border border-black/25 rounded-xl p-4 outline-none text-body-1"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancel"
                      onClick={() => {
                        setEditPopup(false);
                        setSelectedLink(null);
                      }}
                      type="danger"
                    />
                    <Button
                      text="Save Changes"
                      icon={<FaPlus />}
                      onClick={() => {
                        // NNTI INI SAMBUNGIN BACKEND SUBMIT EDIT
                        setEditPopup(false);
                        setSelectedLink(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        )}
        
        {/* DELETE POPUP */}
        {showDeletePopup && selectedLink && (
          <Popup
            component={(
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-[420px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold text-danger">
                    Delete Link
                  </h3>

                  <p className="text-body-1 text-black/70">
                    Are you sure you want to delete this link?
                    This action cannot be undone.
                  </p>

                  <div className="border border-black/25 rounded-xl p-4">
                    <p className="font-bold text-body-1">
                      {selectedLink.shortUrl}
                    </p>
                    <p className="text-body-2 text-black/50">
                      {selectedLink.targetUrl}
                    </p>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancel"
                      type="warning"
                      onClick={() => {
                        setDeletePopup(false);
                        setSelectedLink(null);
                      }}
                    />

                    <Button
                      text="Delete"
                      type="danger"
                      onClick={() => {
                        // NNTI SAMBUNG KE BACKEND DELETE
                        setDeletePopup(false);
                        setSelectedLink(null);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        )}

      </main>
    </div>
  );
};

export default UrlShortenerPage;
