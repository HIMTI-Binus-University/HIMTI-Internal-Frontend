import { useState, useMemo } from "react";
import { AppWindow, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateHimtiKitSoftware,
  useDeleteHimtiKitSoftware,
  useGetHimtiKitSoftwares,
  useUpdateHimtiKitSoftware,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateHimtiKitSoftwareInput, HimtiKitSoftware } from "@/types/himti-kit";
import { SoftwareFormDialog } from "./software-form-dialog";

export function SoftwareTab() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSoftware, setEditingSoftware] = useState<HimtiKitSoftware | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HimtiKitSoftware | null>(null);

  const { data: softwares = [], isLoading, isError } = useGetHimtiKitSoftwares();
  const createMutation = useCreateHimtiKitSoftware();
  const updateMutation = useUpdateHimtiKitSoftware();
  const deleteMutation = useDeleteHimtiKitSoftware();

  const filteredSoftwares = useMemo(() => {
    return softwares.filter((item) => {
      return (
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [softwares, search]);

  const handleOpenCreate = () => {
    setEditingSoftware(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (software: HimtiKitSoftware) => {
    setEditingSoftware(software);
    setDialogOpen(true);
  };

  const handleSubmit = async (payload: CreateHimtiKitSoftwareInput) => {
    if (editingSoftware) {
      await updateMutation.mutateAsync({ id: editingSoftware.id, ...payload });
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
      {/* Search & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchField
            id="software-search"
            label="Search software directory"
            placeholder="Search software by name or description..."
            value={search}
            onChange={setSearch}
            className="relative w-full"
          />
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          <span>Add Software</span>
        </Button>
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
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-semantic-danger-border bg-semantic-danger-background p-6 text-center text-sm text-semantic-danger">
            Failed to load Software directory. Please verify the backend is running.
          </div>
        ) : filteredSoftwares.length === 0 ? (
          <EmptyState
            icon={AppWindow}
            title="No software entries found"
            description={
              search
                ? "No software matched your search query."
                : "No software tools have been added yet. Click 'Add Software' to create one."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSoftwares.map((software) => (
              <div
                key={software.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="p-4">
                  {/* Header: Logo and Title */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/30">
                      {software.logoUrl ? (
                        <img
                          src={software.logoUrl}
                          alt={software.name}
                          className="h-full w-full object-contain p-1.5"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <AppWindow className="h-6 w-6 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-base font-semibold text-foreground">
                        {software.name}
                      </h3>
                      <a
                        href={software.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                      >
                        <span className="truncate max-w-[160px]">
                          {software.downloadUrl.replace(/^https?:\/\//, "")}
                        </span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                    {software.description}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-border bg-muted/10 p-3">
                  <a
                    href={software.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Visit / Download</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenEdit(software)}
                      aria-label="Edit software"
                    >
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(software)}
                      aria-label="Delete software"
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
      <SoftwareFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingSoftware}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete software entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Software"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
