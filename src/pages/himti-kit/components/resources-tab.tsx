import { useState, useMemo } from "react";
import { BookOpen, ExternalLink, Filter, GraduationCap, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
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
import {
  BINUS_IT_MAJORS,
  MAJOR_SHORT_LABELS,
  type CreateHimtiKitResourceInput,
  type HimtiKitResource,
} from "@/types/himti-kit";
import { ResourceFormDialog } from "./resource-form-dialog";

export function ResourcesTab() {
  const [search, setSearch] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<HimtiKitResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HimtiKitResource | null>(null);

  const { data: resources = [], isLoading, isError } = useGetHimtiKitResources();
  const createMutation = useCreateHimtiKitResource();
  const updateMutation = useUpdateHimtiKitResource();
  const deleteMutation = useDeleteHimtiKitResource();

  const filterOptions = ["ALL", ...BINUS_IT_MAJORS.filter((m) => m !== "All Majors")];

  // Dynamic counts per major
  const majorCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: resources.length };
    for (const r of resources) {
      counts[r.major] = (counts[r.major] || 0) + 1;
    }
    return counts;
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()));
      const matchMajor =
        selectedMajor === "ALL" ||
        item.major === selectedMajor ||
        item.major === "All Majors";
      return matchSearch && matchMajor;
    });
  }, [resources, search, selectedMajor]);

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
      {/* Search and Controls Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
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

          <div className="flex items-center gap-2.5">
            {/* Quick Dropdown for Direct Access */}
            <div className="relative flex items-center">
              <select
                id="jurusan-dropdown"
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="h-9 rounded-lg border border-border bg-card pl-8 pr-3 text-xs font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                aria-label="Filter by Jurusan"
              >
                {filterOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "ALL" ? "All Jurusan" : opt} ({majorCounts[opt] || 0})
                  </option>
                ))}
              </select>
              <GraduationCap className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>

            {/* Add Material Button */}
            <Button size="sm" onClick={handleOpenCreate} className="gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Add Material</span>
            </Button>
          </div>
        </div>

        {/* Revamped Horizontal Pills Bar with Live Counts */}
        <div className="relative flex items-center">
          <div className="flex w-full items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 text-xs scrollbar-thin">
            {filterOptions.map((opt) => {
              const label = MAJOR_SHORT_LABELS[opt] || opt;
              const count = majorCounts[opt] || 0;
              const isSelected = selectedMajor === opt;

              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedMajor(opt)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-muted/30 hover:text-foreground"
                  }`}
                  title={opt === "ALL" ? "All Jurusan" : opt}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      isSelected
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filter Sub-indicator */}
        {(selectedMajor !== "ALL" || search.trim()) && (
          <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-3.5 w-3.5 text-primary" />
              <span>
                Filtered by:{" "}
                <strong className="text-foreground">
                  {selectedMajor === "ALL" ? "All Jurusan" : selectedMajor}
                </strong>
                {search && (
                  <>
                    {" "}
                    • Search: <strong className="text-foreground">&quot;{search}&quot;</strong>
                  </>
                )}
                {" "}({filteredResources.length} {filteredResources.length === 1 ? "material" : "materials"} found)
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedMajor("ALL");
                setSearch("");
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset filter</span>
            </button>
          </div>
        )}
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
          <div className="space-y-4 py-6 text-center">
            <EmptyState
              icon={BookOpen}
              title={
                selectedMajor !== "ALL"
                  ? `No materials found for ${selectedMajor}`
                  : "No learning materials found"
              }
              description={
                search
                  ? `No materials matching "${search}". Try clearing your search.`
                  : selectedMajor !== "ALL"
                  ? `There are no materials uploaded yet for this jurusan. You can be the first to upload one!`
                  : "No learning materials have been uploaded yet. Click 'Add Material' to create one."
              }
            />

            {selectedMajor !== "ALL" && (
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedMajor("ALL")}>
                  View All Jurusan
                </Button>
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add for {selectedMajor}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div>
                  {/* Cover Preview & Jurusan Tag */}
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
                      className="absolute right-3 top-3 max-w-[200px] truncate border border-border/80 bg-background/90 text-xs font-semibold text-foreground backdrop-blur"
                      title={resource.major}
                    >
                      {MAJOR_SHORT_LABELS[resource.major] || resource.major || "General IT"}
                    </Badge>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <h3 className="line-clamp-2 text-base font-semibold text-foreground">
                      {resource.title}
                    </h3>
                    {resource.description && (
                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
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
        defaultMajor={selectedMajor}
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
