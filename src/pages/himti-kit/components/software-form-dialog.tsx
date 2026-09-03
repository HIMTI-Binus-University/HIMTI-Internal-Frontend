import { useState, useEffect } from "react";
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
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Software name is required.");
      return;
    }
    if (!downloadUrl.trim()) {
      setError("Download or website URL is required.");
      return;
    }
    if (!description.trim()) {
      setError("Description is required.");
      return;
    }

    try {
      setError(null);
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
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
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
                onChange={(e) => setDownloadUrl(e.target.value)}
                required
              />
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
