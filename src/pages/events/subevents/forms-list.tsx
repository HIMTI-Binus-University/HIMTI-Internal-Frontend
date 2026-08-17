import { useState } from "react";
import type { AxiosError } from "axios";
import { Copy, FilePlus2, LockKeyhole, Send, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useCloneRegistrationForm,
  useCloseRegistrationForm,
  usePublishRegistrationForm,
  useRegistrationForms,
} from "@/api/registration-forms/queries";
import { dateTime, titleCase } from "@/components/events/helpers";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "../components";

const errorMessage = (error: unknown) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  "The form operation failed.";

export const FormStatusBadge = ({
  status,
}: {
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
}) => {
  const colors =
    status === "DRAFT"
      ? "bg-amber-100 text-amber-800"
      : status === "PUBLISHED"
        ? "bg-emerald-100 text-emerald-800"
        : "bg-slate-200 text-slate-700";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${colors}`}>
      {titleCase(status)}
    </span>
  );
};

export function FormsList({
  eventId,
  subeventId,
}: {
  eventId: string;
  subeventId: string;
}) {
  const query = useRegistrationForms(subeventId);
  const navigate = useNavigate();
  const clone = useCloneRegistrationForm();
  const publish = usePublishRegistrationForm();
  const close = useCloseRegistrationForm();
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    action: "publish" | "close";
    id: string;
    name: string;
    version: number;
    revision: number;
  } | null>(null);
  const base = `/events/${eventId}/subevents/${subeventId}/forms`;
  const pendingError = clone.error ?? publish.error ?? close.error;
  const resetLifecycle = () => {
    clone.reset();
    publish.reset();
    close.reset();
  };

  if (query.isLoading)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading form versions...
      </p>
    );
  if (query.isError)
    return (
      <EmptyState
        title="Forms could not be loaded"
        description={errorMessage(query.error)}
        action={<Button onClick={() => query.refetch()}>Retry</Button>}
      />
    );
  if (!query.data?.length)
    return (
      <EmptyState
        title="No forms yet"
        description="Create the first registration form draft for this sub-event."
        action={
          <Button asChild>
            <Link to={`${base}/new`}>
              <FilePlus2 />
              Create form
            </Link>
          </Button>
        }
      />
    );

  const groups = Object.values(
    query.data.reduce<Record<string, typeof query.data>>((result, form) => {
      const key = form.logicalKey ?? form.id;
      (result[key] ??= []).push(form);
      return result;
    }, {}),
  )
    .map((versions) => [...versions].sort((a, b) => b.version - a.version))
    .sort((a, b) =>
      a[0].name.localeCompare(b[0].name, undefined, { sensitivity: "base" }),
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Registration forms</h2>
          <p className="text-sm text-muted-foreground">
            Draft, publish, and retain an auditable version history.
          </p>
        </div>
        <Button asChild>
          <Link to={`${base}/new`}>
            <FilePlus2 />
            Create form
          </Link>
        </Button>
      </div>
      {pendingError && (
        <p role="alert" className="text-sm text-semantic-danger">
          {errorMessage(pendingError)}
        </p>
      )}
      {groups.map((versions) => (
        <Card key={versions[0].logicalKey ?? versions[0].id}>
          <CardHeader>
            <CardTitle>{versions[0].name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {versions.map((form) => (
              <article
                key={form.id}
                className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold">Version {form.version}</span>
                    <FormStatusBadge status={form.status} />
                    <span className="text-xs text-muted-foreground">
                      {titleCase(form.stage)}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {form.description || "No description"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Updated {dateTime(form.updatedAt ?? form.createdAt)} ·{" "}
                    {form.sections.length} sections
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" asChild>
                    <Link to={`${base}/${encodeURIComponent(form.id)}`}>
                      {form.status === "DRAFT" ? "Edit" : "View"}
                    </Link>
                  </Button>
                  {form.status !== "DRAFT" && (
                    <Button
                      variant="secondary"
                      disabled={clone.isPending}
                      onClick={() => {
                        resetLifecycle();
                        clone.mutate(
                          { id: form.id },
                          {
                            onSuccess: (created) =>
                              navigate(
                                `${base}/${encodeURIComponent(created.id)}`,
                              ),
                          },
                        );
                      }}
                    >
                      <Copy />
                      {clone.isPending ? "Cloning..." : "Clone draft"}
                    </Button>
                  )}
                  {form.status === "DRAFT" && (
                    <Button
                      disabled={publish.isPending}
                      onClick={() =>
                        setLifecycleTarget({
                          action: "publish",
                          id: form.id,
                          name: form.name,
                          version: form.version,
                          revision: form.revision,
                        })
                      }
                    >
                      <Send />
                      Publish
                    </Button>
                  )}
                  {form.status === "PUBLISHED" && (
                    <Button
                      variant="secondary"
                      disabled={close.isPending}
                      onClick={() =>
                        setLifecycleTarget({
                          action: "close",
                          id: form.id,
                          name: form.name,
                          version: form.version,
                          revision: form.revision,
                        })
                      }
                    >
                      <XCircle />
                      Close
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </CardContent>
        </Card>
      ))}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        Published and closed versions are immutable. Clone one to create the
        next editable draft.
      </p>
      <AlertDialog
        open={lifecycleTarget !== null}
        onOpenChange={(open) => !open && setLifecycleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lifecycleTarget?.action === "publish"
                ? "Publish this form version?"
                : "Close this published form?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lifecycleTarget?.action === "publish" ? (
                <>
                  Version {lifecycleTarget.version} of {lifecycleTarget.name}{" "}
                  will become the active participant form, replace any currently
                  published version, and become read-only.
                </>
              ) : (
                <>
                  Version {lifecycleTarget?.version} of {lifecycleTarget?.name}{" "}
                  will no longer be available to participants. Its saved
                  responses and history will remain available.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={
                lifecycleTarget?.action === "close" ? "delete" : "default"
              }
              onClick={() => {
                if (!lifecycleTarget) return;
                resetLifecycle();
                const payload = {
                  id: lifecycleTarget.id,
                  revision: lifecycleTarget.revision,
                };
                if (lifecycleTarget.action === "publish")
                  publish.mutate(payload);
                else close.mutate(payload);
              }}
            >
              {lifecycleTarget?.action === "publish" ? "Publish" : "Close form"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
