import { useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Layers3,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  useActivatePeriod,
  useCreatePeriod,
  useCreateResource,
  useDeletePeriod,
  useDeleteResource,
  useGetPeriods,
  useGetResources,
  useOrderResources,
  useSetReregistration,
  useUpdatePeriod,
  useUpdateResource,
} from "@/api/batches/queries";
import { useGetRegistrationOptions } from "@/api/rbac/queries";
import { Container, ContainerHeader, EmptyState, PageLayout } from "@/components/Utils";
import { ResourceMarkdown } from "@/components/resource-markdown";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import type { Period, Resource, ResourcePayload } from "@/types/batches";
import { getSafeHttpUrl, normalizeHttpUrlInput } from "@/utils/http-url";

const ALL_REGIONS = "all";
const EMPTY_PERIODS: Period[] = [];
const textareaClass =
  "flex min-h-24 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50";

const errorMessage = (error: unknown, fallback: string) => {
  const data = (error as AxiosError<{ message?: string; msg?: string }>).response?.data;
  return data?.message ?? data?.msg ?? fallback;
};

const BatchesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pageError, setPageError] = useState("");
  const [periodDialog, setPeriodDialog] = useState<"create" | "edit" | null>(null);
  const [periodId, setPeriodId] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [periodFormError, setPeriodFormError] = useState("");
  const [deletePeriodTarget, setDeletePeriodTarget] = useState<Period | null>(null);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editResource, setEditResource] = useState<Resource | null>(null);
  const [resourceForm, setResourceForm] = useState<ResourcePayload>({
    title: "",
    description: "",
    url: null,
    regionId: null,
  });
  const [resourceFormError, setResourceFormError] = useState("");
  const [deleteResourceTarget, setDeleteResourceTarget] = useState<Resource | null>(null);
  const resourceDialogRef = useRef<HTMLDivElement>(null);

  const periodsQuery = useGetPeriods();
  const periods = periodsQuery.data ?? EMPTY_PERIODS;
  const selectedId = searchParams.get("period") ?? "";
  const selectedPeriod = periods.find((period) => period.id === selectedId);
  const resourcesQuery = useGetResources(selectedPeriod?.id ?? "");
  const resources = [...(resourcesQuery.data ?? [])].sort(
    (left, right) => left.position - right.position,
  );
  const { data: registrationOptions } = useGetRegistrationOptions();
  const regions = registrationOptions?.binusRegions ?? [];

  const createPeriod = useCreatePeriod();
  const updatePeriod = useUpdatePeriod();
  const deletePeriod = useDeletePeriod();
  const activatePeriod = useActivatePeriod();
  const setReregistration = useSetReregistration();
  const createResource = useCreateResource(selectedPeriod?.id ?? "");
  const updateResource = useUpdateResource(selectedPeriod?.id ?? "");
  const deleteResource = useDeleteResource(selectedPeriod?.id ?? "");
  const orderResources = useOrderResources(selectedPeriod?.id ?? "");

  useEffect(() => {
    if (
      !periods.length ||
      selectedPeriod ||
      (selectedId && periodsQuery.isFetching)
    ) return;
    const fallback = periods.find((period) => period.isActive) ?? periods[0];
    setSearchParams({ period: fallback.id }, { replace: true });
  }, [
    periods,
    periodsQuery.isFetching,
    selectedId,
    selectedPeriod,
    setSearchParams,
  ]);

  const selectPeriod = (id: string | null) => {
    if (id) setSearchParams({ period: id });
  };

  const openCreatePeriod = () => {
    setPeriodId("");
    setPeriodLabel("");
    setPeriodFormError("");
    setPeriodDialog("create");
  };

  const openEditPeriod = () => {
    if (!selectedPeriod) return;
    setPeriodId(selectedPeriod.id);
    setPeriodLabel(selectedPeriod.label);
    setPeriodFormError("");
    setPeriodDialog("edit");
  };

  const savePeriod = () => {
    if (!periodId.trim() || !periodLabel.trim()) {
      setPeriodFormError("Period ID and label are required.");
      return;
    }
    const mutation = periodDialog === "create" ? createPeriod : updatePeriod;
    mutation.mutate(
      { id: periodId.trim(), label: periodLabel.trim() },
      {
        onSuccess: () => {
          if (periodDialog === "create") setSearchParams({ period: periodId.trim() });
          setPeriodDialog(null);
          setPageError("");
        },
        onError: (error) =>
          setPeriodFormError(errorMessage(error, `Failed to ${periodDialog} period.`)),
      },
    );
  };

  const openResourceDialog = (resource?: Resource) => {
    setEditResource(resource ?? null);
    setResourceForm(
      resource
        ? {
            title: resource.title,
            description: resource.description,
            url: resource.url,
            regionId: resource.region?.id ?? null,
          }
        : { title: "", description: "", url: null, regionId: null },
    );
    setResourceFormError("");
    setResourceDialogOpen(true);
  };

  const saveResource = () => {
    if (!resourceForm.title.trim() || !resourceForm.description.trim()) {
      setResourceFormError("Title and description are required.");
      return;
    }
    if (resourceForm.url) {
      try {
        normalizeHttpUrlInput(resourceForm.url);
      } catch {
        setResourceFormError(
          "Enter a valid web link such as youtube.com. Only HTTP and HTTPS links are allowed.",
        );
        return;
      }
    }
    const payload = {
      ...resourceForm,
      title: resourceForm.title.trim(),
      description: resourceForm.description.trim(),
      url: resourceForm.url?.trim() || null,
    };
    const options = {
      onSuccess: () => {
        setResourceDialogOpen(false);
        setPageError("");
      },
      onError: (error: Error) =>
        setResourceFormError(errorMessage(error, "Failed to save resource.")),
    };
    if (editResource) updateResource.mutate({ id: editResource.id, ...payload }, options);
    else createResource.mutate(payload, options);
  };

  const moveResource = (index: number, direction: -1 | 1) => {
    const reordered = resources.map((resource) => resource.id);
    [reordered[index], reordered[index + direction]] = [
      reordered[index + direction],
      reordered[index],
    ];
    orderResources.mutate(reordered, {
      onError: (error) => setPageError(errorMessage(error, "Failed to reorder resources.")),
    });
  };

  return (
    <PageLayout
      icon={Layers3}
       title="Batches"
       actions={
        <Button size="sm" onClick={openCreatePeriod}>
          <Plus />
          <span className="max-sm:sr-only">New period</span>
        </Button>
      }
    >
      {pageError && (
        <div role="alert" className="rounded-xl border border-semantic-danger-border bg-semantic-danger-background px-4 py-3 text-sm text-semantic-danger">
          {pageError}
        </div>
      )}

      <Container>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
           <div>
             <h2 className="text-lg font-semibold leading-7 tracking-tight text-foreground">
               Academic periods
             </h2>
             <p className="mt-1 text-sm text-muted-foreground">
               Choose the academic period you want to manage.
             </p>
           </div>
          {selectedPeriod && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="edit" onClick={openEditPeriod}>
                <Pencil /> Edit
              </Button>
              <Button
                size="sm"
                variant="delete"
                disabled={selectedPeriod.isActive || !!selectedPeriod._count.memberships || !!selectedPeriod._count.resources}
                title="Only empty inactive periods can be deleted"
                onClick={() => setDeletePeriodTarget(selectedPeriod)}
              >
                <Trash2 /> Delete
              </Button>
            </div>
          )}
        </div>

        <Label className="mb-2" htmlFor="period-selector">Academic period</Label>
        {periodsQuery.isLoading ? (
          <Skeleton aria-hidden="true" className="h-10 w-full sm:max-w-md" />
        ) : periodsQuery.isError ? (
          <div className="flex flex-wrap items-center gap-3 text-sm text-semantic-danger">
            <span>Could not load academic periods.</span>
            <Button size="sm" variant="outline" onClick={() => periodsQuery.refetch()}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : periods.length ? (
          <Select
            items={periods.map((period) => ({ value: period.id, label: period.label }))}
            value={selectedPeriod?.id ?? periods[0].id}
            onValueChange={selectPeriod}
          >
            <SelectTrigger id="period-selector" className="sm:max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.label}{period.isActive ? " (Active)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-sm text-muted-foreground">Create an academic period to get started.</p>
        )}

        {selectedPeriod && (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-5">
              <Badge variant={selectedPeriod.isActive ? "success" : "neutral"}>
                {selectedPeriod.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge variant={selectedPeriod.registrationOpen ? "info" : "neutral"}>
                Reregistration {selectedPeriod.registrationOpen ? "open" : "closed"}
              </Badge>
            </div>

            <dl className="mt-4 divide-y divide-border overflow-hidden rounded-lg bg-muted/50 sm:grid sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                ["Period ID", selectedPeriod.id],
                ["Memberships", selectedPeriod._count.memberships],
                ["Resources", selectedPeriod._count.resources],
              ].map(([label, value]) => (
                <div key={label} className="px-4 py-3">
                  <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              {!selectedPeriod.isActive && (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={activatePeriod.isPending}
                  onClick={() =>
                    activatePeriod.mutate(selectedPeriod.id, {
                      onError: (error) => setPageError(errorMessage(error, "Failed to activate period.")),
                    })
                  }
                >
                  Activate period
                </Button>
              )}
              <div className="flex items-center justify-between gap-4 sm:ml-auto">
                <div>
                  <p className="text-sm font-semibold">Reregistration</p>
                  <p className="text-xs text-muted-foreground">Allow pengurus to register again</p>
                </div>
                <Switch
                  checked={selectedPeriod.registrationOpen}
                  aria-label={`${selectedPeriod.registrationOpen ? "Close" : "Open"} reregistration`}
                  disabled={setReregistration.isPending}
                  onCheckedChange={(open) =>
                    setReregistration.mutate(
                      { id: selectedPeriod.id, open },
                      { onError: (error) => setPageError(errorMessage(error, "Failed to update reregistration.")) },
                    )
                  }
                />
              </div>
            </div>
          </>
        )}
      </Container>

      <Container>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          <div>
            <ContainerHeader className="mb-1">Batch resources</ContainerHeader>
            <p className="text-sm text-muted-foreground">
              Resources shown to pengurus in this batch.
            </p>
          </div>
          {selectedPeriod && (
            <Button size="sm" onClick={() => openResourceDialog()}>
              <Plus />
              Add resource
            </Button>
          )}
        </div>

        {!selectedPeriod ? (
          <EmptyState
            icon={Layers3}
            title="No batch selected"
            description="Choose a batch above to manage its resources."
          />
        ) : resourcesQuery.isLoading ? (
          <div className="space-y-3" aria-label="Loading batch resources">
            {[0, 1].map((item) => <Skeleton key={item} aria-hidden="true" className="h-24" />)}
          </div>
        ) : resourcesQuery.isError ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-5 py-8 text-center">
            <p className="text-sm text-semantic-danger">Could not load batch resources.</p>
            <Button size="sm" variant="outline" onClick={() => resourcesQuery.refetch()}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : resources.length === 0 ? (
          <EmptyState
            icon={Layers3}
            title="No batch resources yet"
            description="Add the first resource for this batch."
          />
        ) : (
          <ul className="-mx-5 -mb-5 divide-y divide-border border-t border-border">
            {resources.map((resource, index) => {
              const safeUrl = getSafeHttpUrl(resource.url);
              return (
                <li key={resource.id}>
                  <article className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">{resource.title}</h2>
                        <Badge variant="neutral">{resource.region?.shortName || resource.region?.name || "All regions"}</Badge>
                      </div>
                      <ResourceMarkdown className="mt-1 max-w-3xl text-sm text-muted-foreground">
                        {resource.description}
                      </ResourceMarkdown>
                      {safeUrl && (
                        <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline">
                          {resource.url}<ExternalLink className="h-4 w-4 shrink-0" />
                        </a>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton className="h-11 w-11 sm:h-9 sm:w-9" label={`Move ${resource.title} up`} disabled={index === 0 || orderResources.isPending} onClick={() => moveResource(index, -1)}>
                        <ArrowUp />
                      </IconButton>
                      <IconButton className="h-11 w-11 sm:h-9 sm:w-9" label={`Move ${resource.title} down`} disabled={index === resources.length - 1 || orderResources.isPending} onClick={() => moveResource(index, 1)}>
                        <ArrowDown />
                      </IconButton>
                      <IconButton className="h-11 w-11 sm:h-9 sm:w-9" label={`Edit ${resource.title}`} tone="primary" onClick={() => openResourceDialog(resource)}>
                        <Pencil />
                      </IconButton>
                      <IconButton className="h-11 w-11 sm:h-9 sm:w-9" label={`Delete ${resource.title}`} tone="danger" onClick={() => setDeleteResourceTarget(resource)}>
                        <Trash2 />
                      </IconButton>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </Container>

      <Dialog open={!!periodDialog} onOpenChange={(open) => !open && setPeriodDialog(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{periodDialog === "create" ? "Create academic period" : "Edit academic period"}</DialogTitle>
            <DialogDescription>Use the backend period identifier and a clear label for pengurus.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="period-id" className="mb-2">Period ID</Label>
              <Input id="period-id" value={periodId} disabled={periodDialog === "edit"} placeholder="2026-2027" onChange={(event) => { setPeriodId(event.target.value); setPeriodFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="period-label" className="mb-2">Label</Label>
              <Input id="period-label" value={periodLabel} placeholder="Pengurus 2026/2027" onChange={(event) => { setPeriodLabel(event.target.value); setPeriodFormError(""); }} />
            </div>
            {periodFormError && <p role="alert" className="text-sm text-semantic-danger">{periodFormError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialog(null)}>Cancel</Button>
            <Button disabled={createPeriod.isPending || updatePeriod.isPending} onClick={savePeriod}>Save period</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resourceDialogOpen} onOpenChange={setResourceDialogOpen}>
        <DialogContent ref={resourceDialogRef} className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editResource ? "Edit batch resource" : "Add batch resource"}</DialogTitle>
            <DialogDescription>Region is resource context only; every member in the period can see every resource.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-title" className="mb-2">Title</Label>
              <Input id="resource-title" value={resourceForm.title} onChange={(event) => { setResourceForm({ ...resourceForm, title: event.target.value }); setResourceFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="resource-description" className="mb-2">Description</Label>
              <textarea id="resource-description" rows={4} className={textareaClass} value={resourceForm.description} onChange={(event) => { setResourceForm({ ...resourceForm, description: event.target.value }); setResourceFormError(""); }} />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Markdown supported: **bold**, *italic*, lists, `code`, quotes, and [links](https://example.com).
              </p>
              {resourceForm.description.trim() && (
                <div className="mt-3 rounded-lg border border-border bg-muted/25 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preview</p>
                  <ResourceMarkdown className="text-sm text-muted-foreground">
                    {resourceForm.description}
                  </ResourceMarkdown>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="resource-url" className="mb-2">URL <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="resource-url" type="text" inputMode="url" placeholder="youtube.com or https://example.com" value={resourceForm.url ?? ""} onChange={(event) => { setResourceForm({ ...resourceForm, url: event.target.value || null }); setResourceFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="resource-region" className="mb-2">Region context</Label>
              <Select
                items={[{ value: ALL_REGIONS, label: "All regions" }, ...regions.map((region) => ({ value: region.id, label: region.shortName || region.name }))]}
                value={resourceForm.regionId ?? ALL_REGIONS}
                onValueChange={(value) => setResourceForm({ ...resourceForm, regionId: value === ALL_REGIONS ? null : value })}
              >
                <SelectTrigger id="resource-region"><SelectValue /></SelectTrigger>
                <SelectContent portalContainer={resourceDialogRef}>
                  <SelectItem value={ALL_REGIONS}>All regions</SelectItem>
                  {regions.map((region) => <SelectItem key={region.id} value={region.id}>{region.shortName || region.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {resourceFormError && <p role="alert" className="text-sm text-semantic-danger">{resourceFormError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
            <Button disabled={createResource.isPending || updateResource.isPending} onClick={saveResource}>Save resource</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePeriodTarget} onOpenChange={(open) => !open && setDeletePeriodTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete academic period</AlertDialogTitle>
            <AlertDialogDescription>Delete the empty period {deletePeriodTarget?.label}? This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="delete" onClick={() => deletePeriodTarget && deletePeriod.mutate(deletePeriodTarget.id, {
              onSuccess: () => { setDeletePeriodTarget(null); setSearchParams({}); },
              onError: (error) => { setDeletePeriodTarget(null); setPageError(errorMessage(error, "Failed to delete period.")); },
            })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteResourceTarget} onOpenChange={(open) => !open && setDeleteResourceTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete batch resource</AlertDialogTitle>
            <AlertDialogDescription>Delete {deleteResourceTarget?.title}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="delete" onClick={() => deleteResourceTarget && deleteResource.mutate(deleteResourceTarget.id, {
              onSuccess: () => setDeleteResourceTarget(null),
              onError: (error) => { setDeleteResourceTarget(null); setPageError(errorMessage(error, "Failed to delete resource.")); },
            })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default BatchesPage;
