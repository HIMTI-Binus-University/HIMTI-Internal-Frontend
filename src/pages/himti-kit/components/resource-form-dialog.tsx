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
  CreateHimtiKitResourceInput,
  HimtiKitResource,
} from "@/types/himti-kit";

interface ResourceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CreateHimtiKitResourceInput) => Promise<void>;
  initialData?: HimtiKitResource | null;
  isLoading?: boolean;
}

export function ResourceFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isLoading,
}: ResourceFormDialogProps) {
  const [title, setTitle] = useState("");
  const [semester, setSemester] = useState<number | string>(1);
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setSemester(initialData.semester);
      setCoverImageUrl(initialData.coverImageUrl ?? "");
      setResourceUrl(initialData.resourceUrl);
      setDescription(initialData.description ?? "");
    } else {
      setTitle("");
      setSemester(1);
      setCoverImageUrl("");
      setResourceUrl("");
      setDescription("");
    }
    setError(null);
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!resourceUrl.trim()) {
      setError("Download/Resource URL is required.");
      return;
    }

    try {
      setError(null);
      await onSubmit({
        title: title.trim(),
        semester: Number(semester) || semester,
        coverImageUrl: coverImageUrl.trim() || null,
        resourceUrl: resourceUrl.trim(),
        description: description.trim() || null,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save resource.";
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {initialData ? "Edit Learning Material" : "Add Learning Material"}
            </DialogTitle>
            <DialogDescription>
              Provide resource details, download link, and semester for student access.
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
                <Label htmlFor="resource-semester">
                  Semester <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="resource-semester"
                  type="number"
                  min={1}
                  max={8}
                  placeholder="1 - 8"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  required
                />
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
                onChange={(e) => setResourceUrl(e.target.value)}
                required
              />
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
              {isLoading ? "Saving..." : initialData ? "Update Resource" : "Create Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
