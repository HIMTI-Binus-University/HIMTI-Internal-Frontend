import { useState, useEffect } from "react";
import { AxiosError } from "axios";
// import { format } from "date-fns";

import {
  PageLayout,
  Container,
  ContainerHeader,
  EmptyState,
  PaginationFooter,
  SearchField,
} from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
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
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Link2,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";

import {
  useGetUrlList,
  useCreateUrl,
  useUpdateUrl,
  useDeleteUrl,
} from "@/hooks/url-shortener";
import type { UrlItem } from "@/types/url-shortener";
import { shortLinkConfig } from "@/config/runtime";
import { formatUrlCreatedAt } from "@/utils/url-shortener";
import qrcode from "qrcode";
import qrLogoUrl from "@/components/assets/qrlogo.png";

const URLS_PER_PAGE = 10;

function CreatedAt({ value }: { value?: string | null }) {
  const formattedValue = formatUrlCreatedAt(value);

  return (
    <>
      Created on{" "}
      {value && formattedValue !== "Date unavailable" ? (
        <time dateTime={value}>{formattedValue}</time>
      ) : (
        formattedValue
      )}
    </>
  );
}

// QR Code Dialog
function QRCodeDialog({
  url,
  onClose,
}: {
  url: string | null;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    if (!url) return;
    setDataUrl("");

    qrcode.toDataURL(url, { width: 256, margin: 2 }).then((qrDataUrl) => {
      const size = 256;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;

      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, size, size);

        const logoH = size * 0.22;
        const logoW = logoH * 0.9;
        const logoX = (size - logoW) / 2;
        const logoY = (size - logoH) / 2;
        const pad = 5;
        const bgW = logoW + pad * 2;
        const bgH = logoH + pad * 2;
        const bgX = logoX - pad;
        const bgY = logoY - pad;
        const r = 6;

        // White rounded background behind logo
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.moveTo(bgX + r, bgY);
        ctx.lineTo(bgX + bgW - r, bgY);
        ctx.quadraticCurveTo(bgX + bgW, bgY, bgX + bgW, bgY + r);
        ctx.lineTo(bgX + bgW, bgY + bgH - r);
        ctx.quadraticCurveTo(bgX + bgW, bgY + bgH, bgX + bgW - r, bgY + bgH);
        ctx.lineTo(bgX + r, bgY + bgH);
        ctx.quadraticCurveTo(bgX, bgY + bgH, bgX, bgY + bgH - r);
        ctx.lineTo(bgX, bgY + r);
        ctx.quadraticCurveTo(bgX, bgY, bgX + r, bgY);
        ctx.closePath();
        ctx.fill();

        const logoImg = new Image();
        logoImg.onload = () => {
          ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);
          setDataUrl(canvas.toDataURL("image/png"));
        };
        logoImg.src = qrLogoUrl;
      };
      qrImg.src = qrDataUrl;
    });
  }, [url]);

  const shortCode = url?.split("/").pop() ?? "";

  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[340px]">
        <DialogHeader>
          <DialogTitle>QR Code</DialogTitle>
          <p className="text-sm text-muted-foreground break-all">{url}</p>
        </DialogHeader>
        <div className="flex justify-center py-2">
          {dataUrl && (
            <img src={dataUrl} alt="QR Code" width={220} height={220} />
          )}
        </div>
        <DialogFooter className="gap-2">
          <a href={dataUrl} download={`qr-${shortCode}.png`}>
            <Button disabled={!dataUrl}>Download PNG</Button>
          </a>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Url Shortener Page
const UrlShortenerPage = () => {
  const shortLinkPrefix = shortLinkConfig.displayPrefix;
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [popupCopied, setPopupCopied] = useState(false);
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
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [pageError, setPageError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [targetUrl, setTargetUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [createdLink, setCreatedLink] = useState<{
    shortUrl: string;
    targetUrl: string;
    createdAt?: string;
    expiresAt?: string | null;
  } | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const { data: urlsData, isLoading: isLoadingUrls, refetch } = useGetUrlList({
    page: currentPage,
    limit: URLS_PER_PAGE,
    search: debouncedSearchQuery,
  });
  const createUrl = useCreateUrl();
  const updateUrl = useUpdateUrl();
  const deleteUrl = useDeleteUrl();

  const urls = urlsData?.data || [];
  const paginationMeta = urlsData?.meta;
  const totalPages = paginationMeta?.totalPages ?? 1;
  const totalRecords = paginationMeta?.totalRecords ?? 0;
  const pageStart =
    totalRecords === 0
      ? 0
      : ((paginationMeta?.page ?? currentPage) - 1) * URLS_PER_PAGE + 1;
  const pageEnd = Math.min(
    (paginationMeta?.page ?? currentPage) * URLS_PER_PAGE,
    totalRecords,
  );

  useEffect(() => {
    if (
      paginationMeta &&
      paginationMeta.totalPages > 0 &&
      currentPage > paginationMeta.totalPages
    ) {
      setCurrentPage(paginationMeta.totalPages);
    }
  }, [currentPage, paginationMeta]);

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
    setPageError("");
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
        setPageError("");
        setConfirmPopup(true);
        setTargetUrl("");
        setShortCode("");
        setExpiryDate(undefined);
        setCurrentPage(1);
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
          setPageError("Failed to create short link. Please check the URL and try again.");
        }
      },
    });
  };

  const handleSaveEditUrl = () => {
    if (!selectedLink) return;

    if (!editTargetUrl || !editShortCode) {
      setPageError("Target URL and Short Code are required.");
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
        setPageError("");
        refetch();
      },
      onError: (error) => {
        console.error(error);
        setPageError("Failed to update link. Please review the link details and try again.");
      },
    });
  };

  const handleDeleteUrl = () => {
    if (!selectedLink) return;

    deleteUrl.mutate(
      { id: selectedLink.id },
      {
        onSuccess: () => {
          setDeletePopup(false);
          setSelectedLink(null);
          setPageError("");
          refetch();
        },
        onError: (error) => {
          console.error(error);
          setPageError("Failed to delete link. Please try again.");
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
    <PageLayout icon={Link2} title="URL Shortener">
        {pageError && (
          <div className="flex gap-3 rounded-xl border border-semantic-danger-border bg-semantic-danger-background px-4 py-3 text-sm text-semantic-danger">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{pageError}</p>
          </div>
        )}

        {/* FORM CREATE LINK */}
        <Container>
          <ContainerHeader>Create New Link</ContainerHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="targetUrl" className="mb-2">
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
                <p className="mt-2 text-sm text-semantic-danger">
                  {createErrors.originalUrl}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Label htmlFor="shortCode" className="mb-2">
                Short Link
              </Label>
              <div
                className={`mt-1 flex overflow-hidden rounded-lg border ${
                  createErrors.shortCode
                    ? "border-semantic-danger"
                    : "border-semantic-border"
                }`}
              >
                <span className="flex min-w-0 max-w-full shrink items-center truncate whitespace-nowrap bg-muted px-3 text-sm font-semibold text-muted-foreground max-md:hidden">
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
                  className="flex-1 rounded-none border-0 text-sm focus-visible:ring-0"
                  placeholder="ReallyCoolVideos"
                />
              </div>
              {createErrors.shortCode && (
                <p className="mt-2 text-sm text-semantic-danger">
                  {createErrors.shortCode}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Button onClick={handleCreateLink} disabled={createUrl.isPending}>
                {createUrl.isPending ? (
                  "Loading..."
                ) : (
                  <>
                    <Plus />
                    Create Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </Container>

        {/* LINK CREATION CONFIRMATION DIALOG */}
        {createdLink && (
          <Dialog open={showConfirmPopup} onOpenChange={setConfirmPopup}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Link Created</DialogTitle>
              </DialogHeader>

              <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/35 p-4">
                <div className="flex flex-row items-center justify-start gap-4 min-w-0">
                  <p className="min-w-0 flex-1 break-all text-base font-semibold">
                    {shortLinkConfig.buildShortUrl(createdLink.shortUrl)}
                  </p>
                  <IconButton
                    label={popupCopied ? "Link copied" : "Copy short link"}
                    tone="primary"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        shortLinkConfig.buildShortUrl(createdLink.shortUrl),
                      );
                      setPopupCopied(true);
                      setTimeout(() => setPopupCopied(false), 1500);
                    }}
                  >
                    {popupCopied ? <Check /> : <Copy />}
                  </IconButton>
                </div>

                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <ArrowRight className="h-[18px] w-[18px] shrink-0 stroke-[1.75]" />
                  <span className="break-all min-w-0">
                    {createdLink.targetUrl}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-6 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4 stroke-[1.75]" />
                    <CreatedAt value={createdLink.createdAt} />
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
        <Container>
          <ContainerHeader>
            {debouncedSearchQuery
              ? `Results for "${debouncedSearchQuery}" (${totalRecords})`
              : `Existing Links (${totalRecords})`}
          </ContainerHeader>

          <SearchField
            id="urlSearch"
            label="Search links"
            placeholder="Search by short code or target URL..."
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
          />

          {isLoadingUrls ? (
            <p className="text-sm text-muted-foreground">Loading links...</p>
          ) : urls.length === 0 ? (
            <EmptyState
              icon={Link2}
              title={
                debouncedSearchQuery
                  ? "No links match your search"
                  : "No links yet"
              }
              description={
                debouncedSearchQuery
                  ? "Try a different short code or target URL."
                  : "Create your first short link to make sharing easier."
              }
            />
          ) : (
            <div>
              {urls.map((url) => (
                <article
                  key={url.id}
                  className="-mx-5 flex items-start justify-between gap-3 border-t border-border px-5 py-4 transition-colors first:border-t-0 hover:bg-muted/35 max-sm:flex-col max-sm:gap-4"
                >
                    <div className="flex flex-col gap-2 min-w-0 flex-1">
                      <p className="break-all whitespace-normal text-base font-semibold leading-6">
                        {shortLinkConfig.buildShortUrl(url.shortCode)}
                      </p>

                      <div className="flex min-w-0 flex-row items-center gap-2 text-sm text-muted-foreground">
                        <ArrowRight className="h-4 w-4 shrink-0 stroke-[1.75]" />
                        <span className="min-w-0 flex-1 break-all">{url.originalUrl}</span>
                      </div>

                      <div className="mt-1 flex flex-row gap-6 text-xs text-muted-foreground max-lg:flex-col max-lg:gap-2">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4 stroke-[1.75]" />
                          <CreatedAt value={url.createdAt} />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton
                        label={copiedId === url.id ? "Link copied" : "Copy short link"}
                        tone="primary"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            shortLinkConfig.buildShortUrl(url.shortCode),
                          );
                          setCopiedId(url.id);
                          setTimeout(() => setCopiedId(null), 1500);
                        }}
                      >
                        {copiedId === url.id ? <Check /> : <Copy />}
                      </IconButton>
                      <IconButton
                        label="Generate QR code"
                        tone="primary"
                        onClick={() =>
                          setQrUrl(shortLinkConfig.buildShortUrl(url.shortCode))
                        }
                      >
                        <QrCode />
                      </IconButton>
                      <IconButton
                        label="Edit link"
                        tone="primary"
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
                        <Pencil />
                      </IconButton>
                      <IconButton
                        label="Delete link"
                        tone="danger"
                        onClick={() => {
                          setSelectedLink(url);
                          setDeletePopup(true);
                        }}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                </article>
              ))}

              {totalPages > 1 && (
                <PaginationFooter
                  label={`Showing ${pageStart}-${pageEnd} of ${totalRecords} links`}
                  page={paginationMeta?.page ?? currentPage}
                  totalPages={totalPages}
                  onPrevious={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  onNext={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                />
              )}
            </div>
          )}
        </Container>

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
                <Label htmlFor="editTargetUrl" className="mb-2">
                  Target Link
                </Label>
                <Input
                  id="editTargetUrl"
                  type="text"
                  value={editTargetUrl}
                  onChange={(e) => setEditTargetUrl(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="editShortCode" className="mb-2">
                  Short Link
                </Label>
                <div className="mt-1 flex overflow-hidden rounded-lg border border-input">
                  <span className="flex min-w-0 max-w-full shrink items-center truncate bg-muted px-3 text-sm font-semibold text-muted-foreground max-md:hidden">
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
                    className="flex-1 rounded-none border-0 focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={closeEditPopup}>
                Cancel
              </Button>
              <Button onClick={handleSaveEditUrl}>
                <Plus />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* QR CODE DIALOG, IMPORTANT */}
        <QRCodeDialog url={qrUrl} onClose={() => setQrUrl(null)} />

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
              <AlertDialogDescription>
                Are you sure you want to delete this link? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selectedLink && (
              <div className="min-w-0 rounded-lg border border-border bg-muted/35 p-4">
                <p className="truncate text-sm font-semibold">
                  {shortLinkConfig.buildShortUrl(selectedLink.shortCode)}
                </p>
                <p className="truncate text-sm text-muted-foreground">
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
    </PageLayout>
  );
};

export default UrlShortenerPage;
