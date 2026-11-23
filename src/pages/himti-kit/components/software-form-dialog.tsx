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
import type {
  CreateHimtiKitSoftwareInput,
  HimtiKitSoftware,
} from "@/types/himti-kit";

interface SoftwareFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHimtiKitSoftwareInput) => Promise<void>;
  initialData?: HimtiKitSoftware | null;
  isLoading?: boolean;
}

export function SoftwareFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: SoftwareFormDialogProps) {
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUrlTouched, setIsUrlTouched] = useState(false);

  const validateDownloadUrl = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Download or website URL is required.";
    }
    if (!/^https?:\/\//i.test(trimmed)) {
      return "Download URL must start with http:// or https:// (e.g. https://...)";
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
      setName(initialData.name);
      setLogoUrl(initialData.logoUrl ?? "");
      setDownloadUrl(initialData.downloadUrl);
      setDescription(initialData.description);
    } else {
      setName("");
      setLogoUrl("");
      setDownloadUrl("");
      setDescription("");
    }
    setError(null);
    setUrlError(null);
    setIsUrlTouched(false);
  }, [initialData, open]);

  const handleDownloadUrlChange = (value: string) => {
    setDownloadUrl(value);
    if (isUrlTouched || urlError) {
      setUrlError(validateDownloadUrl(value));
    }
  };

  const handleDownloadUrlBlur = () => {
    setIsUrlTouched(true);
    setUrlError(validateDownloadUrl(downloadUrl));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Software name is required.");
      return;
    }

    const urlValidation = validateDownloadUrl(downloadUrl);
    if (urlValidation) {
      setIsUrlTouched(true);
      setUrlError(urlValidation);
      return;
    }

    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      setError(null);
      setUrlError(null);
      await onSubmit({
        name: name.trim(),
        logoUrl: logoUrl.trim() || null,
        downloadUrl: downloadUrl.trim(),
        description: description.trim(),
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save software entry.";
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
              {initialData ? "Edit Software Entry" : "Add Software Entry"}
            </DialogTitle>
            <DialogDescription>
              Add essential software tools and resources useful for Computer Science students.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="rounded-lg border border-semantic-danger-border bg-semantic-danger-background p-3 text-xs text-semantic-danger">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="software-name">
                Software Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="software-name"
                placeholder="e.g. Visual Studio Code, Docker Desktop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="software-logo">Logo / Icon URL</Label>
              <Input
                id="software-logo"
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="software-url">
                Official Website / Download URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="software-url"
                type="url"
                placeholder="https://code.visualstudio.com"
                value={downloadUrl}
                onChange={(e) => handleDownloadUrlChange(e.target.value)}
                onBlur={handleDownloadUrlBlur}
                aria-invalid={!!urlError}
                aria-describedby={urlError ? "software-url-error" : undefined}
                className={
                  urlError
                    ? "border-destructive focus-visible:ring-destructive/20"
                    : ""
                }
              />
              {urlError ? (
                <p
                  id="software-url-error"
                  role="alert"
                  className="flex items-center gap-1.5 text-xs text-destructive animate-in fade-in duration-150"
                >
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{urlError}</span>
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Provide a valid official website or direct download URL (starting with https://).
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="software-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="software-desc"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Short description of what the software is used for..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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
              {isLoading ? "Saving..." : initialData ? "Update Software" : "Create Software"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
