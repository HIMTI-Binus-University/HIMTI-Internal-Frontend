import { useState } from "react";
import type { AxiosError } from "axios";
import { Copy, FilePlus2, LockKeyhole, Send, Trash2, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import {
  useCloneRegistrationForm,
  useCloseRegistrationForm,
  useDeleteRegistrationForm,
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
  const remove = useDeleteRegistrationForm();
  const [lifecycleTarget, setLifecycleTarget] = useState<{
    action: "publish" | "close";
    id: string;
    name: string;
    revision: number;
    stage?: "REGISTRATION" | "POST_REGISTRATION";
    audience?: "BUYER" | "EACH_ATTENDEE";
    isRequired?: boolean;
    blocksCheckIn?: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    revision: number;
  } | null>(null);
  const base = `/events/${eventId}/subevents/${subeventId}/forms`;
  const pendingError = clone.error ?? publish.error ?? close.error ?? remove.error;
  const resetLifecycle = () => {
    clone.reset();
    publish.reset();
    close.reset();
    remove.reset();
  };

  if (query.isLoading)
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        Loading forms...
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

  const forms = [...query.data].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Registration forms</h2>
          <p className="text-sm text-muted-foreground">
            Create independent forms, edit drafts, and preserve published responses.
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
      {forms.map((form) => (
        <Card key={form.id}>
          <CardHeader>
            <CardTitle>{form.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
              <article
                key={form.id}
                className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-4 md:flex-row md:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
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
                      {clone.isPending ? "Duplicating..." : "Duplicate form"}
                    </Button>
                  {form.status === "DRAFT" && (
                    <>
                    <Button
                      disabled={publish.isPending}
                      onClick={() =>
                        setLifecycleTarget({
                          action: "publish",
                          id: form.id,
                          name: form.name,
                          revision: form.revision,
                          stage: form.stage,
                          audience: form.audience,
                          isRequired: form.isRequired,
                          blocksCheckIn: form.blocksCheckIn,
                        })
                      }
                    >
                      <Send />
                      Publish
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={remove.isPending}
                      onClick={() => setDeleteTarget({
                        id: form.id,
                        name: form.name,
                        revision: form.revision,
                      })}
                    >
                      <Trash2 />
                      Delete
                    </Button>
                    </>
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
          </CardContent>
        </Card>
      ))}
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        Published and closed forms are immutable. Duplicate one to create a
        separate editable draft.
      </p>
      <AlertDialog
        open={lifecycleTarget !== null}
        onOpenChange={(open) => !open && setLifecycleTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lifecycleTarget?.action === "publish"
                ? "Publish this form?"
                : "Close this published form?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lifecycleTarget?.action === "publish" ? (
                <>
                  {lifecycleTarget.name} will become available to participants
                  and can no longer be edited. It applies to every ticket
                  package. {lifecycleTarget.stage === "REGISTRATION"
                    ? "The registration leader completes one required form during registration; it does not affect check-in."
                    : `${lifecycleTarget.audience === "BUYER" ? "The registration leader submits one response" : "Each attendee submits a separate response"}. ${lifecycleTarget.isRequired ? "Completion is required" : "Completion is optional"}${lifecycleTarget.blocksCheckIn ? " and check-in is unavailable until it is completed" : " and it does not prevent check-in"}.`}
                </>
              ) : (
                <>
                  {lifecycleTarget?.name} will no longer be available to participants. Its saved
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
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this draft?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.name} will be removed from normal form administration.
              The backend retains it as a soft-deleted audit record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep draft</AlertDialogCancel>
            <AlertDialogAction
              variant="delete"
              onClick={() => {
                if (!deleteTarget) return;
                remove.mutate(deleteTarget, {
                  onSuccess: () => setDeleteTarget(null),
                });
              }}
            >
              Delete draft
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
