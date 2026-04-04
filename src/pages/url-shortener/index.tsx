import { useState } from "react";
import { AxiosError } from "axios";
// import { format } from "date-fns";

import { Sidebar } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from "@/components/ui/card";

import {
  FaPlus,
  FaBars,
  FaRegCopy,
  FaPencilAlt,
  FaTrashAlt,
} from "react-icons/fa";

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
import { shortLinkConfig } from "@/config/runtime";

// const DateTimePicker = ({
//   value,
//   onChange,
//   hasError,
//   placeholder = "Pick a date & time",
// }: {
//   value: Date | undefined;
//   onChange: (date: Date | undefined) => void;
//   hasError?: boolean;
//   placeholder?: string;
// }) => {

//   const handleDaySelect = (day: Date | undefined) => {
//     if (!day) {
//       onChange(undefined);
//       return;
//     }
//     const updated = new Date(day);
//     if (value) {
//       updated.setHours(value.getHours(), value.getMinutes(), 0, 0);
//     }
//     onChange(updated);
//   };

//   const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const [hours, minutes] = e.target.value.split(":").map(Number);
//     const updated = value ? new Date(value) : new Date();
//     updated.setHours(hours, minutes, 0, 0);
//     onChange(updated);
//   };

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <button
//           type="button"
//           className={`flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left text-md ${
//             hasError ? "border-semantic-danger" : "border-semantic-border"
//           } ${!value ? "text-semantic-foreground/25" : "text-semantic-foreground"}`}
//         >
//           <CalendarIcon className="shrink-0" />
//           <span className="truncate min-w-0 flex-1">{value ? format(value, "MMM d, yyyy HH:mm") : placeholder}</span>
//         </button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto p-0" align="start">
//         <Calendar mode="single" selected={value} onSelect={handleDaySelect} />
//         <div className="border-t p-3 flex flex-col gap-2">
//           <Label className="text-body-2 text-semantic-foreground/50">Time</Label>
//           <Input
//             type="time"
//             value={value ? format(value, "HH:mm") : ""}
//             onChange={handleTimeChange}
//             disabled={!value}
//             className="text-body-2"
//           />
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// };

// Url Shortener Page
const UrlShortenerPage = () => {
  const shortLinkPrefix = shortLinkConfig.displayPrefix;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [popupCopied, setPopupCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [selectedLink, setSelectedLink] = useState<UrlItem | null>(null);
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editShortCode, setEditShortCode] = useState("");
  const [editExpiryDate, setEditExpiryDate] = useState<Date | undefined>(
    undefined,
  );

  const [showConfirmPopup, setConfirmPopup] = useState(false);
  const [showDeletePopup, setDeletePopup] = useState(false);
  const [showEditPopup, setEditPopup] = useState(false);

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const [targetUrl, setTargetUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [createdLink, setCreatedLink] = useState<{
    shortUrl: string;
    targetUrl: string;
    createdAt?: string;
    expiresAt?: string | null;
  } | null>(null);

  const { data: urlsData, isLoading: isLoadingUrls, refetch } = useGetUrlList();
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
    const frontendErrors: Record<string, string> = {};
    if (!targetUrl) frontendErrors.originalUrl = "Target URL is required";
    if (!shortCode) frontendErrors.shortCode = "Short code is required";
    if (Object.keys(frontendErrors).length > 0) {
      setCreateErrors(frontendErrors);
      return;
    }

    const payload = {
      originalUrl: normalizeUrl(targetUrl),
      shortCode,
      expiresAt: expiryDate ? expiryDate.toISOString() : null,
    };

    createUrl.mutate(payload, {
      onSuccess: (created) => {
        setCreatedLink({
          shortUrl: created.shortCode ?? shortCode,
          targetUrl: created.originalUrl ?? targetUrl,
          createdAt: created.createdAt ?? new Date().toISOString(),
          expiresAt: created.expiresAt ?? expiryDate?.toISOString() ?? null,
        });

        setCreateErrors({});
        setConfirmPopup(true);
        setTargetUrl("");
        setShortCode("");
        setExpiryDate(undefined);
        refetch();
      },
      onError: (error) => {
        console.error(error);
        const axiosError = error as AxiosError;
        const zodErrors = (
          axiosError.response?.data as
            | { errors?: Record<string, { _errors?: string[] }> }
            | undefined
        )?.errors;
        if (zodErrors) {
          const mapped: Record<string, string> = {};
          for (const key of Object.keys(zodErrors)) {
            const first = zodErrors[key]?._errors?.[0];
            if (first) mapped[key] = first;
          }
          setCreateErrors(mapped);
        } else {
          alert("Failed to create short link");
        }
      },
    });
  };

  const handleSaveEditUrl = () => {
    if (!selectedLink) return;

    if (!editTargetUrl || !editShortCode) {
      alert("Target URL and Short Code are required");
      return;
    }

    const payload = {
      id: selectedLink.id,
      originalUrl: normalizeUrl(editTargetUrl),
      shortCode: editShortCode,
      expiresAt: editExpiryDate ? editExpiryDate.toISOString() : null,
    };

    updateUrl.mutate(payload, {
      onSuccess: () => {
        setEditPopup(false);
        setSelectedLink(null);
        setEditTargetUrl("");
        setEditShortCode("");
        setEditExpiryDate(undefined);
        refetch();
      },
      onError: (error) => {
        console.error(error);
        alert("Failed to update link");
      },
    });
  };

  const handleDeleteUrl = () => {
    if (!selectedLink) return;

    deleteUrl.mutate(
      { id: selectedLink.id, shortCode: selectedLink.shortCode },
      {
        onSuccess: () => {
          setDeletePopup(false);
          setSelectedLink(null);
          refetch();
        },
        onError: (error) => {
          console.error(error);
          alert("Failed to delete link");
        },
      },
    );
  };

  const closeEditPopup = () => {
    setEditPopup(false);
    setSelectedLink(null);
    setEditTargetUrl("");
    setEditShortCode("");
    setEditExpiryDate(undefined);
  };

  return (
    <div className="flex min-h-screen w-full bg-semantic-background overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 p-10 font-sans max-md:px-4 max-md:py-3">
        <header className="flex justify-between items-center relative">
          <div className="flex flex-row gap-4">
            <button
              className="xl:hidden p-2 rounded-lg hover:bg-semantic-muted opacity-30"
              onClick={() => setSidebarOpen(true)}
            >
              <FaBars size={24} />
            </button>

            <div className="flex items-center gap-5 p-2 min-w-0">
              <LinkIconV2
                width={80}
                height={80}
                className="max-xl:w-[60px] max-xl:h-[60px]"
              />
              <h2 className="min-w-0 text-h3 max-xl:text-h4 max-xl:font-bold max-lg:text-h5 max-lg:font-bold font-bold text-semantic-foreground/50">
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
              <Label htmlFor="targetUrl" className="mb-3">
                Target Link
              </Label>
              <Input
                id="targetUrl"
                type="text"
                placeholder="www.youtube.com"
                value={targetUrl}
                onChange={(e) => {
                  setTargetUrl(e.target.value);
                  setCreateErrors((prev) => ({ ...prev, originalUrl: "" }));
                }}
                className={`${createErrors.originalUrl ? "border-semantic-danger" : ""}`}
              />
              {createErrors.originalUrl && (
                <p className="text-semantic-danger text-body-2 mt-2">
                  {createErrors.originalUrl}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="shortCode" className="mb-3">
                Short Link
              </Label>
              <div
                className={`flex rounded-xl overflow-hidden border mt-1 ${
                  createErrors.shortCode
                    ? "border-semantic-danger"
                    : "border-semantic-border"
                }`}
              >
                <span className="min-w-0 max-w-full shrink truncate bg-semantic-muted text-semantic-foreground/70 text-body1 px-3 flex items-center whitespace-nowrap font-bold max-md:hidden">
                  {shortLinkPrefix}
                </span>
                <Input
                  id="shortCode"
                  type="text"
                  value={shortCode}
                  onChange={(e) => {
                    setShortCode(e.target.value);
                    setCreateErrors((prev) => ({ ...prev, shortCode: "" }));
                  }}
                  className="flex-1 border-0 rounded-none text-md"
                  placeholder="ReallyCoolVideos"
                />
              </div>
              {createErrors.shortCode && (
                <p className="text-semantic-danger text-body-2 mt-2">
                  {createErrors.shortCode}
                </p>
              )}
            </div>

            {/* <div className="w-full">
                <Label className="mb-3">
                  Link Expiry Date <span className="text-black/30">(leave blank if no expiry date)</span>
                </Label>
                <DateTimePicker
                  value={expiryDate}
                  onChange={(date) => {
                    setExpiryDate(date);
                    setCreateErrors((prev) => ({ ...prev, expiresAt: "" }));
                  }}
                  hasError={!!createErrors.expiresAt}
                />
                {createErrors.expiresAt && (
                  <p className="text-semantic-danger text-body-2 mt-2">{createErrors.expiresAt}</p>
                )}
              </div> */}

            <div className="flex justify-end">
              <Button onClick={handleCreateLink} disabled={createUrl.isPending}>
                {createUrl.isPending ? (
                  "Loading..."
                ) : (
                  <>
                    <FaPlus />
                    Create Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* LINK CREATION CONFIRMATION DIALOG */}
        {createdLink && (
          <Dialog open={showConfirmPopup} onOpenChange={setConfirmPopup}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle className="text-h5">Link Created</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-2 border border-semantic-border rounded-xl p-6">
                <div className="flex flex-row items-center justify-start gap-4 min-w-0">
                  <p className="font-bold text-h6 break-all min-w-0 flex-1">
                    {shortLinkConfig.buildShortUrl(createdLink.shortUrl)}
                  </p>
                  <button
                    className="shrink-0 hover:text-semantic-primary-1 transition-colors"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        shortLinkConfig.buildShortUrl(createdLink.shortUrl),
                      );
                      setPopupCopied(true);
                      setTimeout(() => setPopupCopied(false), 1500);
                    }}
                  >
                    {popupCopied ? (
                      <span className="text-body-3">Copied!</span>
                    ) : (
                      <FaRegCopy />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-body-1 min-w-0">
                  <DownRightIcon className="shrink-0" />
                  <span className="break-all min-w-0">
                    {createdLink.targetUrl}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-body-3 text-semantic-foreground/50 mt-2">
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

              <DialogFooter>
                <Button onClick={() => setConfirmPopup(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* CARD URLs */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h5 font-bold">Existing Links</h3>
          </div>

          {isLoadingUrls ? (
            <h1>loading...</h1>
          ) : urls.length === 0 ? (
            <div className="text-center text-semantic-foreground/25 text-body-1 py-8 space-y-4">
              <h1 className="text-h3">{`( •_•)>⌐■-■`}</h1>
              <h2 className="text-h6">Nothing to show here...</h2>
            </div>
          ) : (
            <div className="space-y-4">
              {urls.map((url) => (
                <Card
                  key={url.id}
                  className="border-semantic-border cursor-pointer hover:scale-[101%] transition-transform"
                >
                  <CardContent className="p-5 flex flex-row max-sm:flex-col max-sm:gap-4 justify-between items-start gap-3">
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <p className="font-bold text-h6 max-lg:text-body-1 max-lg:font-bold break-all whitespace-normal">
                        {shortLinkConfig.buildShortUrl(url.shortCode)}
                      </p>

                      <div className="flex flex-row items-center gap-2 text-body-1 max-lg:text-body-2 min-w-0">
                        <DownRightIcon className="shrink-0" />
                        <span className="min-w-0 flex-1 break-all">{url.originalUrl}</span>
                      </div>

                      <div className="flex flex-row max-lg:flex-col gap-6 max-lg:gap-2 text-body-3 text-semantic-foreground/50 mt-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon />
                          Created on {url.createdAt}
                        </div>
                        <div className="flex items-center gap-1">
                          <ExpiredIcon />
                          {url.expiresAt
                            ? `Expires on ${url.expiresAt}`
                            : "Never expires"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-gray-400 shrink-0">
                      <button
                        className="hover:text-semantic-primary-1 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            shortLinkConfig.buildShortUrl(url.shortCode),
                          );
                          setCopiedId(url.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                      >
                        {copiedId === url.id ? (
                          <span className="text-body-3">Copied!</span>
                        ) : (
                          <FaRegCopy />
                        )}
                      </button>
                      <button
                        className="hover:text-semantic-warning transition-colors"
                        onClick={() => {
                          setSelectedLink(url);
                          setEditTargetUrl(url.originalUrl);
                          setEditShortCode(url.shortCode);
                          setEditExpiryDate(
                            url.expiresAt ? new Date(url.expiresAt) : undefined,
                          );
                          setEditPopup(true);
                        }}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        className="hover:text-semantic-danger transition-colors"
                        onClick={() => {
                          setSelectedLink(url);
                          setDeletePopup(true);
                        }}
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* EDIT DIALOG */}
        <Dialog
          open={showEditPopup}
          onOpenChange={(open) => {
            if (!open) closeEditPopup();
          }}
        >
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Link</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div>
                <Label htmlFor="editTargetUrl" className="mb-3">
                  Target Link
                </Label>
                <Input
                  id="editTargetUrl"
                  type="text"
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
                  className="mt-1 text-body-1"
                />
              </div>

              <div>
                <Label htmlFor="editShortCode" className="mb-3">
                  Short Link
                </Label>
                <div className="flex rounded-xl overflow-hidden border border-semantic-border mt-1">
                  <span className="min-w-0 max-w-full shrink truncate bg-semantic-muted px-3 flex items-center font-bold max-md:hidden">
                    {shortLinkPrefix}
                  </span>
                  <Input
                    id="editShortCode"
                    type="text"
                    value={editShortCode}
                    onChange={(e) =>
                      setEditShortCode(
                        shortLinkConfig.toEditableShortCode(e.target.value),
                      )
                    }
                    className="flex-1 border-0 rounded-none text-body-1"
                  />
                </div>
              </div>

              {/* <div>
                <Label className="mb-3">Link Expiry Date</Label>
                <DateTimePicker
                  value={editExpiryDate}
                  onChange={setEditExpiryDate}
                />
              </div> */}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeEditPopup}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditUrl}>
                <FaPlus />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DELETE ALERT DIALOG */}
        <AlertDialog
          open={showDeletePopup}
          onOpenChange={(open) => {
            if (!open) {
              setDeletePopup(false);
              setSelectedLink(null);
            }
          }}
        >
          <AlertDialogContent className="sm:max-w-[420px]">
            <AlertDialogHeader>
              <AlertDialogTitle className="">Delete Link</AlertDialogTitle>
              <AlertDialogDescription className="text-semantic-foreground/70">
                Are you sure you want to delete this link? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selectedLink && (
              <div className="border border-semantic-border rounded-xl p-4 min-w-0">
                <p className="font-bold text-body-1 truncate">
                  {shortLinkConfig.buildShortUrl(selectedLink.shortCode)}
                </p>
                <p className="text-body-2 text-semantic-foreground/50 truncate">
                  {selectedLink.originalUrl}
                </p>
              </div>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUrl}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default UrlShortenerPage;
