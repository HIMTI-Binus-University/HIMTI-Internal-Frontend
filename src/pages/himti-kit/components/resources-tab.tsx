import { useState, useMemo } from "react";
import { BookOpen, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateHimtiKitResource,
  useDeleteHimtiKitResource,
  useGetHimtiKitResources,
  useUpdateHimtiKitResource,
} from "@/api/himti-kit/queries";
import { Container, EmptyState, SearchField } from "@/components/Utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateHimtiKitResourceInput, HimtiKitResource } from "@/types/himti-kit";
import { ResourceFormDialog } from "./resource-form-dialog";

export function ResourcesTab() {
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<HimtiKitResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HimtiKitResource | null>(null);

  const { data: resources = [], isLoading, isError } = useGetHimtiKitResources();
  const createMutation = useCreateHimtiKitResource();
  const updateMutation = useUpdateHimtiKitResource();
  const deleteMutation = useDeleteHimtiKitResource();

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchSemester =
        selectedSemester === "ALL" || String(item.semester) === selectedSemester;
      return matchSearch && matchSemester;
    });
  }, [resources, search, selectedSemester]);

  const handleOpenCreate = () => {
    setEditingResource(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (resource: HimtiKitResource) => {
    setEditingResource(resource);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: CreateHimtiKitResourceInput) => {
    if (editingResource) {
      await updateMutation.mutateAsync({ id: editingResource.id, ...payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchField
            id="resource-search"
            label="Search learning materials"
            placeholder="Search by title or topic..."
            value={search}
            onChange={setSearch}
            className="relative w-full"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 text-xs">
            {["ALL", "1", "2", "3", "4", "5", "6", "7", "8"].map((sem) => (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`rounded px-2.5 py-1 font-medium transition-colors ${
                  selectedSemester === sem
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {sem === "ALL" ? "All Semesters" : `Sem ${sem}`}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={handleOpenCreate} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Material</span>
          </Button>
        </div>
      </div>

      {/* Main List Content */}
      <Container className="p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <Skeleton className="h-32 w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-semantic-danger-border bg-semantic-danger-background p-6 text-center text-sm text-semantic-danger">
            Failed to load HIMTI KIT learning materials. Please verify the backend is running.
          </div>
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No learning materials found"
            description={
              search || selectedSemester !== "ALL"
                ? "Try adjusting your search query or semester filter."
                : "No learning materials have been uploaded yet. Click 'Add Material' to create one."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  {/* Cover Preview */}
                  <div className="relative h-36 w-full bg-muted/30">
                    {resource.coverImageUrl ? (
                      <img
                        src={resource.coverImageUrl}
                        alt={resource.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}
                    <Badge
                      variant="secondary"
                      className="absolute right-3 top-3 border border-border/80 bg-background/90 text-xs font-semibold backdrop-blur"
                    >
                      Semester {resource.semester}
                    </Badge>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {resource.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-border bg-muted/10 p-3">
                  <a
                    href={resource.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Download / Open Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(resource)}
                      aria-label="Edit resource"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(resource)}
                      aria-label="Delete resource"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>

      {/* Form Modal */}
      <ResourceFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingResource}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete learning material?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Material"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
