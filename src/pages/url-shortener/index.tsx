import { useState } from "react";

import { Sidebar, Button, LinkDetails, Popup } from "@/components/Utils";

import { FaSearch, FaPlus, FaBars, FaRegCopy } from "react-icons/fa";

import {
  CalendarIcon,
  ExpiredIcon,
  DownRightIcon,
  LinkIconV2,
} from "@/components/icons";

import {
  useGetUrlList,
  useCreateUrl,
  useUpdateUrl,
  useDeleteUrl,
} from "@/hooks/url-shortener";
import type { UrlItem } from "@/types/url-shortener";

const UrlShortenerPage = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [popupCopied, setPopupCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [selectedLink, setSelectedLink] = useState<UrlItem | null>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editShortCode, setEditShortCode] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState("");

  const [showConfirmPopup, setConfirmPopup] = useState(false);
  const [showDeletePopup, setDeletePopup] = useState(false);
  const [showEditPopup, setEditPopup] = useState(false);

  const [targetUrl, setTargetUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [createdLink, setCreatedLink] = useState<{
    shortUrl: string;
    targetUrl: string;
    createdAt?: string;
    expiresAt?: string | null;
  } | null>(null);

  const { data: urlsData, isLoading: isLoadingUrls } = useGetUrlList();
  const createUrl = useCreateUrl();
  const updateUrl = useUpdateUrl();
  const deleteUrl = useDeleteUrl();

  const urls = urlsData?.data || [];

  const normalizeUrl = (input: string): string => {
    let url = input.trim();

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      const parsed = new URL(url);

      parsed.hostname = parsed.hostname.replace(/^www\./i, "");

      return parsed.toString();
    } catch {
      return url;
    }
  };

  const handleCreateLink = () => {
    if (!targetUrl || !shortCode) {
      alert("Target URL and Short Code are required");
      return;
    }

    const payload = {
      originalUrl: normalizeUrl(targetUrl),
      shortCode,
      expiresAt: expiryDate ? new Date(expiryDate).toISOString() : null,
    };

    createUrl.mutate(payload, {
      onSuccess: (created) => {
        console.log("Created:", created);

        setCreatedLink({
          shortUrl: created.shortCode ?? shortCode,
          targetUrl: created.originalUrl ?? targetUrl,
          createdAt: created.createdAt ?? new Date().toISOString(),
          expiresAt: created.expiresAt ?? expiryDate,
        });

<<<<<<< HEAD
      const created = await createShortUrl(payload);

      console.log("Created:", created);
      
      await handleGetUrlList();

      setCreatedLink({
        shortUrl: created.shortUrl ?? shortCode,
        targetUrl: created.originalUrl ?? targetUrl,
        createdAt: created.createdAt ?? new Date().toISOString(),
        expiresAt: created.expiresAt ?? expiryDate,
      });

      setConfirmPopup(true);

      setTargetUrl("");
      setShortCode("");
      setExpiryDate("");
    } catch (error) {
      console.error(error);
      alert("Failed to create short link");
    } finally {
      setIsCreating(false);
    }
=======
        setConfirmPopup(true);
        setTargetUrl("");
        setShortCode("");
        setExpiryDate("");
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to create short link");
      },
    });
>>>>>>> c43f428ff97e09f1fb40cc159889555a8d80e72d
  };

  const handleSaveEditUrl = () => {
    if (!selectedLink) return;

    if (!editTargetUrl || !editShortCode) {
      alert("Target URL and Short Code are required");
      return;
    }

<<<<<<< HEAD
    try {
      const payload: {
        originalUrl: string;
        shortCode: string;
        expiresAt?: string;
      } = {
        originalUrl: normalizeUrl(editTargetUrl),
        shortCode: editShortCode,
      };

      // ONLY include expiresAt if user sets it
      if (editExpiryDate) {
        payload.expiresAt = new Date(editExpiryDate).toISOString();
      }

      await updateUrl(payload, selectedLink.id);

      await handleGetUrlList();

      setEditPopup(false);
      setSelectedLink(null);
      setEditTargetUrl("");
      setEditShortCode("");
      setEditExpiryDate("");
    } catch (error) {
      console.error(error);
      alert("Failed to update link");
    }
=======
    const payload = {
      id: selectedLink.id,
      originalUrl: normalizeUrl(editTargetUrl),
      shortCode: editShortCode,
      expiresAt: editExpiryDate ? new Date(editExpiryDate).toISOString() : null,
    };

    updateUrl.mutate(payload, {
      onSuccess: () => {
        setEditPopup(false);
        setSelectedLink(null);
        setEditTargetUrl("");
        setEditShortCode("");
        setEditExpiryDate("");
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to update link");
      },
    });
>>>>>>> c43f428ff97e09f1fb40cc159889555a8d80e72d
  };

  const handleDeleteUrl = () => {
    if (!selectedLink) return;

    deleteUrl.mutate(selectedLink.id, {
      onSuccess: () => {
        setDeletePopup(false);
        setSelectedLink(null);
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to delete link");
      },
    });
  };

  return (
    <div className="min-h-screen w-full bg-grayscale-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main
        className="flex-1 ml-[393px] max-xl:ml-0 px-8 py-6 font-sans
                       max-md:px-4 max-md:py-3"
      >
        <header className="flex justify-between items-center mb-8 relative">
          <div className="flex flex-row gap-4">
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-grayscale-100"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>

            <div className="flex items-center gap-5 p-2">
              <LinkIconV2
                width={80}
                height={80}
                className="max-xl:w-[60px] max-xl:h-[60px]"
              />
              <h2 className="text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold  font-bold text-black/50 ">
                URL Shortener
              </h2>
            </div>
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
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="w-full border  border-black/25 rounded-xl p-4 outline-none text-body-2"
              />
            </div>

            <div
              className="gap-4 grid grid-cols-2
                            max-xl:flex max-xl:flex-col"
            >
              <div className="flex-1">
                <label className="block text-body-1 mb-1">Short Link</label>

                <div className="flex rounded-xl overflow-hidden border border-black/25">
                  <span className="bg-grayscale-100 text-black/70 text-body1 px-3 flex items-center whitespace-nowrap font-bold max-md:hidden">
                    https://himtibinus.or.id/
                  </span>

                  <input
                    type="text"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    className="flex-1 p-4  outline-none text-body-2 "
                    placeholder="ReallyCoolVideos"
                  />
                </div>
              </div>

              <div className="w-full">
                <label className="block text-body-1 mb-1">
                  Link Expiry Date{" "}
                  <span className="text-body-2 text-black/50">
                    (leave blank if it doesn't need an expiry date)
                  </span>
                </label>
                <input
                  type="datetime-local"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  placeholder="DD/MM/YYYY HH:MM:SS"
                  className={`w-full border border-black/25 ${
                    expiryDate ? "text-black" : "text-black/25"
                  } outline-none rounded-xl p-4 text-body-2 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    const rect = target.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const iconWidth = 40;
                    if (clickX < rect.width - iconWidth) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>

            <Button
              text="Create Link"
              icon={<FaPlus />}
              onClick={handleCreateLink}
              loading={createUrl.isPending}
              disabled={createUrl.isPending}
            />
          </div>
        </div>

        {/* LINK CREATION CONFIRMATION POPUP */}
        {showConfirmPopup && createdLink && (
          <Popup
            component={
              <div className="relative bg-white rounded-xl shadow-xl p-5">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold">Link Created</h3>
                  <div className="flex flex-col gap-2 border border-black/25 rounded-xl p-6">
                    <div className="flex flex-row items-center justify-start gap-4">
                      <p className="font-bold text-h6">
                        http://72.62.122.54:8001/{createdLink.shortUrl}
                      </p>
                      <button
                        className="hover:text-primary-600 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `http://72.62.122.54:8001/${createdLink.shortUrl}`
                          );
                          setPopupCopied(true);

                          setTimeout(() => {
                            setPopupCopied(false);
                          }, 1500);
                        }}
                      >
                        {popupCopied ? (
                          <h6 className="text-body-3">Copied!</h6>
                        ) : (
                          <FaRegCopy />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-body-1">
                      <DownRightIcon />
                      <span>{createdLink.targetUrl}</span>
                    </div>

                    <div className="flex items-center gap-6 text-body-3 text-black/50 mt-2">
                      <div className="flex items-center gap-1">
                        <CalendarIcon />
                        Created on {createdLink.createdAt}
                      </div>

                      <div className="flex items-center gap-1">
                        <ExpiredIcon />

                        {createdLink.expiresAt
                          ? `Expires on ${createdLink.expiresAt}`
                          : "Never expires"}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setConfirmPopup(false)}
                    text="Done"
                  ></Button>
                </div>
              </div>
            }
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
              className="border outline-none rounded-xl py-3 px-4 border-black/25  w-full text-body-2"
            />
            <Button text="Search" icon={<FaSearch />}></Button>
          </div>

          {isLoadingUrls ? (
            <h1>loading...</h1>
          ) : urls.length === 0 ? (
            <div className="text-center text-black/25 text-body-1 py-8 space-y-4">
              <h1 className="text-h3">{`( •_•)>⌐■-■`}</h1>
              <h2 className="text-h6">Nothing to show here...</h2>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <LinkDetails
                  key={url.id}
                  short={`https://himtibinus.or.id/${url.shortCode}`}
                  target={url.originalUrl}
                  created={url.createdAt}
                  expires={url.expiresAt ?? null}
                  isCopied={copiedId === url.id}
                  onEdit={() => {
                    setSelectedLink(url);

                    setEditTargetUrl(url.originalUrl);
                    setEditShortCode(url.shortCode);
                    setEditExpiryDate(
                      url.expiresAt ? url.expiresAt.slice(0, 16) : ""
                    );

                    console.log(url.id);

                    setEditPopup(true);
                  }}
                  onDelete={() => {
                    setSelectedLink(url);
                    setDeletePopup(true);
                  }}
                  onCopy={() => {
                    navigator.clipboard.writeText(
                      `http://72.62.122.54:8001/${url.shortCode}`
                    );
                    setCopiedId(url.id);

                    setTimeout(() => {
                      setCopiedId(null);
                    }, 1500);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* EDIT FORM */}
        {showEditPopup && selectedLink && (
          <Popup
            component={
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-[480px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold">Edit Link</h3>

                  <div>
                    <label className="block text-body-1 mb-1">
                      Target Link
                    </label>
                    <input
                      type="text"
                      value={editTargetUrl}
                      onChange={(e) => setEditTargetUrl(e.target.value)}
                      className="w-full border border-black/25 rounded-xl p-4 outline-none text-body-1"
                    />
                  </div>

                  <div>
                    <label className="block text-body-1 mb-1">Short Link</label>
                    <div className="flex rounded-xl overflow-hidden border border-black/25">
                      <span className="bg-grayscale-100 px-3 flex items-center font-bold max-md:hidden">
                        https://himtibinus.or.id/
                      </span>
                      <input
                        type="text"
                        value={editShortCode}
                        onChange={(e) =>
                          setEditShortCode(
                            e.target.value.replace("himtibinus.or.id/", "")
                          )
                        }
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
                      value={editExpiryDate}
                      onChange={(e) => setEditExpiryDate(e.target.value)}
                      className="w-full border border-black/25 rounded-xl p-4 outline-none text-body-1"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button
                      text="Cancel"
                      onClick={() => {
                        setEditPopup(false);
                        setSelectedLink(null);
                        setEditTargetUrl("");
                        setEditShortCode("");
                        setEditExpiryDate("");
                      }}
                      type="danger"
                    />
                    <Button
                      text="Save Changes"
                      icon={<FaPlus />}
                      onClick={handleSaveEditUrl}
                    />
                  </div>
                </div>
              </div>
            }
          />
        )}

        {/* DELETE POPUP */}
        {showDeletePopup && selectedLink && (
          <Popup
            component={
              <div className="relative bg-white rounded-xl shadow-xl p-6 w-[420px]">
                <div className="flex flex-col gap-4">
                  <h3 className="text-h5 font-bold text-danger">Delete Link</h3>

                  <p className="text-body-1 text-black/70">
                    Are you sure you want to delete this link? This action
                    cannot be undone.
                  </p>

                  <div className="border border-black/25 rounded-xl p-4">
                    <p className="font-bold text-body-1">
                      http://72.62.122.54:8001/{selectedLink.shortCode}
                    </p>
                    <p className="text-body-2 text-black/50">
                      {selectedLink.originalUrl}
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
                      onClick={handleDeleteUrl}
                    />
                  </div>
                </div>
              </div>
            }
          />
        )}
      </main>
    </div>
  );
};

export default UrlShortenerPage;
