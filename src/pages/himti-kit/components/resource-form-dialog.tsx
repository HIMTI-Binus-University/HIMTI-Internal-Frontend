import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BINUS_IT_MAJORS,
  type CreateHimtiKitResourceInput,
  type HimtiKitResource,
} from "@/types/himti-kit";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHimtiKitResourceInput) => Promise<void>;
  initialData?: HimtiKitResource | null;
  defaultMajor?: string;
  isLoading?: boolean;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  defaultMajor,
  isLoading,
}: ResourceFormDialogProps) {
  const [title, setTitle] = useState("");
  const [major, setMajor] = useState<string>("Computer Science");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUrlTouched, setIsUrlTouched] = useState(false);

  const validateDownloadUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Download link is required.";
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      return "Download link must start with http:// or https:// (e.g. https://...)";
    }
    try {
      const parsed = new URL(trimmed);
      if (!parsed.hostname || parsed.hostname.length < 3) {
        return "Please enter a valid web address.";
      }
    } catch {
      return "Please enter a valid URL.";
    }
    return null;
  };

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setMajor(initialData.major || "Computer Science");
      setCoverImageUrl(initialData.coverImageUrl ?? "");
      setResourceUrl(initialData.resourceUrl);
      setDescription(initialData.description ?? "");
    } else {
      setTitle("");
      setMajor(
        defaultMajor && defaultMajor !== "ALL" && defaultMajor !== "All Majors"
          ? defaultMajor
          : "Computer Science"
      );
      setCoverImageUrl("");
      setResourceUrl("");
      setDescription("");
    }
    setError(null);
    setUrlError(null);
    setIsUrlTouched(false);
  }, [initialData, open, defaultMajor]);

  const handleResourceUrlChange = (value: string) => {
    setResourceUrl(value);
    if (isUrlTouched || urlError) {
      setUrlError(validateDownloadUrl(value));
    }
  };

  const handleResourceUrlBlur = () => {
    setIsUrlTouched(true);
    setUrlError(validateDownloadUrl(resourceUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!major.trim()) {
      setError("Jurusan is required.");
      return;
    }

    const urlValidation = validateDownloadUrl(resourceUrl);
    if (urlValidation) {
      setIsUrlTouched(true);
      setUrlError(urlValidation);
      return;
    }

    try {
      setError(null);
      setUrlError(null);
      await onSubmit({
        title: title.trim(),
        major: major.trim(),
        coverImageUrl: coverImageUrl.trim() || null,
        resourceUrl: resourceUrl.trim(),
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save resource.";
      if (/url|link/i.test(message)) {
        setUrlError(message);
      } else {
        setError(message);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form noValidate onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Learning Material" : "Add Learning Material"}
            </DialogTitle>
            <DialogDescription>
              Provide material details, target Jurusan IT, and download link for student access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-3 text-xs text-semantic-danger">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="resource-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="resource-title"
                placeholder="e.g. Data Structures & Algorithms Summary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="resource-major">
                  Jurusan IT <span className="text-destructive">*</span>
                </Label>
                <select
                  id="resource-major"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                >
                  {BINUS_IT_MAJORS.filter((m) => m !== "All Majors").map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="resource-cover">Cover Image URL</Label>
                <Input
                  id="resource-cover"
                  placeholder="https://..."
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resource-url">
                Resource / Download Link URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="resource-url"
                type="url"
                placeholder="https://drive.google.com/... or direct link"
                value={resourceUrl}
                onChange={(e) => handleResourceUrlChange(e.target.value)}
                onBlur={handleResourceUrlBlur}
                aria-invalid={!!urlError}
                aria-describedby={urlError ? "resource-url-error" : undefined}
                className={
                  urlError
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
              />
              {urlError ? (
                <p
                  id="resource-url-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in duration-150"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{urlError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Provide a valid HTTP or HTTPS link (e.g. Google Drive, OneDrive, or direct file link).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resource-desc">Description</Label>
              <textarea
                id="resource-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Brief summary or context about this material..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update Material" : "Create Material"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
