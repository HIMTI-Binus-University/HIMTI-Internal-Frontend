import { useEffect, useState } from "react";
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
  Users,
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
import { Switch } from "@/components/ui/switch";
import type { Period, Resource, ResourcePayload } from "@/types/batches";

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
    if (!periods.length || selectedPeriod) return;
    const fallback = periods.find((period) => period.isActive) ?? periods[0];
    setSearchParams({ period: fallback.id }, { replace: true });
  }, [periods, selectedPeriod, setSearchParams]);

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
        new URL(resourceForm.url);
      } catch {
        setResourceFormError("URL must be a valid absolute URL.");
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
      title="Batch"
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
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <Label className="mb-2" htmlFor="period-selector">Academic period</Label>
            {periodsQuery.isLoading ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted sm:max-w-md" />
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
      </Container>

      {selectedPeriod && (
        <Container>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <ContainerHeader>{selectedPeriod.label}</ContainerHeader>
                <Badge variant={selectedPeriod.isActive ? "success" : "neutral"}>
                  {selectedPeriod.isActive ? "Active" : "Inactive"}
                </Badge>
                <Badge variant={selectedPeriod.registrationOpen ? "info" : "neutral"}>
                  Reregistration {selectedPeriod.registrationOpen ? "open" : "closed"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">ID: {selectedPeriod.id}</p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <strong className="text-foreground">{selectedPeriod._count.memberships}</strong> memberships
                </span>
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Layers3 className="h-4 w-4" />
                  <strong className="text-foreground">{selectedPeriod._count.resources}</strong> resources
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-lg bg-muted/50 p-3 sm:min-w-72">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Reregistration</p>
                  <p className="text-xs text-muted-foreground">Allow pengurus to register again</p>
                </div>
                <Switch
                  checked={selectedPeriod.registrationOpen}
                  label={`${selectedPeriod.registrationOpen ? "Close" : "Open"} reregistration`}
                  disabled={setReregistration.isPending}
                  onCheckedChange={(open) =>
                    setReregistration.mutate(
                      { id: selectedPeriod.id, open },
                      { onError: (error) => setPageError(errorMessage(error, "Failed to update reregistration.")) },
                    )
                  }
                />
              </div>
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
            </div>
          </div>
        </Container>
      )}

      {selectedPeriod && (
        <Container>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <ContainerHeader>Generic cards</ContainerHeader>
              <p className="mt-1 text-sm text-muted-foreground">Resources shown to pengurus in this period.</p>
            </div>
            <Button size="sm" onClick={() => openResourceDialog()}>
              <Plus />
              <span className="max-sm:sr-only">Add card</span>
            </Button>
          </div>

          {resourcesQuery.isLoading ? (
            <div className="space-y-3" aria-label="Loading generic cards">
              {[0, 1].map((item) => <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />)}
            </div>
          ) : resourcesQuery.isError ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm text-semantic-danger">Could not load generic cards.</p>
              <Button size="sm" variant="outline" onClick={() => resourcesQuery.refetch()}>
                <RefreshCw /> Retry
              </Button>
            </div>
          ) : resources.length === 0 ? (
            <EmptyState icon={Layers3} title="No generic cards yet" description="Add the first resource for this academic period." />
          ) : (
            <div className="-mx-5 -mb-5 divide-y divide-border border-t border-border">
              {resources.map((resource, index) => (
                <article key={resource.id} className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-foreground">{resource.title}</h2>
                      <Badge variant="neutral">{resource.region?.shortName || resource.region?.name || "All regions"}</Badge>
                    </div>
                    <p className="mt-1 max-w-3xl whitespace-pre-wrap text-sm text-muted-foreground">{resource.description}</p>
                    {resource.url && (
                      <a href={resource.url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline">
                        {resource.url}<ExternalLink className="h-4 w-4 shrink-0" />
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <IconButton label={`Move ${resource.title} up`} disabled={index === 0 || orderResources.isPending} onClick={() => moveResource(index, -1)}>
                      <ArrowUp />
                    </IconButton>
                    <IconButton label={`Move ${resource.title} down`} disabled={index === resources.length - 1 || orderResources.isPending} onClick={() => moveResource(index, 1)}>
                      <ArrowDown />
                    </IconButton>
                    <IconButton label={`Edit ${resource.title}`} tone="primary" onClick={() => openResourceDialog(resource)}>
                      <Pencil />
                    </IconButton>
                    <IconButton label={`Delete ${resource.title}`} tone="danger" onClick={() => setDeleteResourceTarget(resource)}>
                      <Trash2 />
                    </IconButton>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Container>
      )}

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
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editResource ? "Edit generic card" : "Add generic card"}</DialogTitle>
            <DialogDescription>Region is card context only; every member in the period can see every card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-title" className="mb-2">Title</Label>
              <Input id="resource-title" value={resourceForm.title} onChange={(event) => { setResourceForm({ ...resourceForm, title: event.target.value }); setResourceFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="resource-description" className="mb-2">Description</Label>
              <textarea id="resource-description" rows={4} className={textareaClass} value={resourceForm.description} onChange={(event) => { setResourceForm({ ...resourceForm, description: event.target.value }); setResourceFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="resource-url" className="mb-2">URL <span className="font-normal text-muted-foreground">(optional)</span></Label>
              <Input id="resource-url" type="url" placeholder="https://example.com" value={resourceForm.url ?? ""} onChange={(event) => { setResourceForm({ ...resourceForm, url: event.target.value || null }); setResourceFormError(""); }} />
            </div>
            <div>
              <Label htmlFor="resource-region" className="mb-2">Region context</Label>
              <Select
                items={[{ value: ALL_REGIONS, label: "All regions" }, ...regions.map((region) => ({ value: region.id, label: region.shortName || region.name }))]}
                value={resourceForm.regionId ?? ALL_REGIONS}
                onValueChange={(value) => setResourceForm({ ...resourceForm, regionId: value === ALL_REGIONS ? null : value })}
              >
                <SelectTrigger id="resource-region"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_REGIONS}>All regions</SelectItem>
                  {regions.map((region) => <SelectItem key={region.id} value={region.id}>{region.shortName || region.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {resourceFormError && <p role="alert" className="text-sm text-semantic-danger">{resourceFormError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceDialogOpen(false)}>Cancel</Button>
            <Button disabled={createResource.isPending || updateResource.isPending} onClick={saveResource}>Save card</Button>
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
            <AlertDialogTitle>Delete generic card</AlertDialogTitle>
            <AlertDialogDescription>Delete {deleteResourceTarget?.title}? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="delete" onClick={() => deleteResourceTarget && deleteResource.mutate(deleteResourceTarget.id, {
              onSuccess: () => setDeleteResourceTarget(null),
              onError: (error) => { setDeleteResourceTarget(null); setPageError(errorMessage(error, "Failed to delete card.")); },
            })}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
};

export default BatchesPage;
