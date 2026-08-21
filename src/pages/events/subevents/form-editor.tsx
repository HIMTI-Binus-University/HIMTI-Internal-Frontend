import { useEffect, useRef, useState } from "react";
import type { AxiosError } from "axios";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ClipboardList,
  Copy,
  Eye,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Navigate, useBlocker, useNavigate, useParams } from "react-router-dom";

import {
  useCloneRegistrationForm,
  useCreateRegistrationForm,
  usePreviewRegistrationForm,
  useRegistrationForm,
  useSaveRegistrationFormDraft,
  useValidateRegistrationForm,
} from "@/api/registration-forms/queries";
import {
  type EventPackage,
  useEventPackages,
} from "@/api/event-packages/queries";
import { useGetEvents, useGetSubevent } from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { titleCase } from "@/components/events/helpers";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  builderToDraft,
  canCreateForm,
  clientKey,
  moveItem,
  newEditorDraft,
  newAssignment,
  newQuestion,
  nextOptionValue,
  persistNewDraft,
  previewSections,
  toPayload,
  usesOptions,
  validateDraftLocally,
  validationForType,
  type BuilderForm,
  type DraftAssignment,
  type DraftQuestion,
  type DraftSection,
  type FieldType,
  type EditorDraft,
  formStages,
} from "./form-draft";
import { localDateTime } from "./registration-settings";
import { FormStatusBadge } from "./forms-list";
import { packageOptionLabel } from "./package-utils";

const fieldTypes: FieldType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "SELECT",
  "RADIO",
  "CHECKBOX",
  "FILE",
];
type ApiErrorBody = { code?: string; message?: string; msg?: string };
const apiError = (error: unknown) => {
  const response = (error as AxiosError<ApiErrorBody>).response;
  if (response?.data.code === "REVISION_CONFLICT")
    return "This draft changed on the server. Your local edits are preserved. Open the forms list in another tab to review the latest revision before saving again.";
  return (
    response?.data.message ?? response?.data.msg ?? "The form operation failed."
  );
};

export default function FormEditorPage() {
  const { eventId = "", subeventId = "", formId = "new" } = useParams();
  const navigate = useNavigate();
  const base = `/events/${eventId}/subevents/${subeventId}/forms`;
  const events = useGetEvents();
  const subevent = useGetSubevent(subeventId);
  const formQuery = useRegistrationForm(formId);
  const packagesQuery = useEventPackages(subeventId);
  const create = useCreateRegistrationForm({ updateCache: false });
  const saveMutation = useSaveRegistrationFormDraft();
  const clone = useCloneRegistrationForm();
  const validate = useValidateRegistrationForm();
  const preview = usePreviewRegistrationForm();
  const [draft, setDraft] = useState<EditorDraft | null>(null);
  const [loadedRevision, setLoadedRevision] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingCreatedForm, setPendingCreatedForm] =
    useState<BuilderForm | null>(null);
  const allowNavigation = useRef(false);
  const event = events.data?.data.find((item) => item.id === eventId);

  const creationKey = `${eventId}:${subeventId}`;
  const creationReady = canCreateForm(
    eventId,
    subeventId,
    Boolean(event),
    subevent.data,
  );
  useEffect(() => {
    setDraft(null);
    setLoadedRevision(null);
    setDirty(false);
    setError("");
    setNotice("");
    setPreviewOpen(false);
    setPendingCreatedForm(null);
    allowNavigation.current = false;
    create.reset();
    saveMutation.reset();
    clone.reset();
    validate.reset();
    preview.reset();
    // Mutation objects are stable and UI state is scoped to the route form ID.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creationKey, formId]);

  useEffect(() => {
    if (formId === "new" && creationReady)
      setDraft((current) => current ?? newEditorDraft());
  }, [creationReady, formId]);

  useEffect(() => {
    const form = formQuery.data;
    if (!form || dirty || loadedRevision === form.revision) return;
    setDraft(builderToDraft(form));
    setLoadedRevision(form.revision);
  }, [dirty, formQuery.data, loadedRevision]);

  const blocker = useBlocker(dirty && !allowNavigation.current);

  useEffect(() => {
    const protect = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", protect);
    return () => window.removeEventListener("beforeunload", protect);
  }, [dirty]);

  const edit = (recipe: (current: EditorDraft) => EditorDraft) => {
    setDraft((current) => (current ? recipe(current) : current));
    setDirty(true);
    setNotice("");
    setError("");
  };
  const leave = () => navigate(base);
  const isNew = formId === "new";
  const locked = !isNew && formQuery.data?.status !== "DRAFT";
  const questionCount =
    draft?.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0,
    ) ?? 0;

  const save = async () => {
    if (!draft || locked) return;
    setError("");
    setNotice("");
    try {
      const payload = toPayload(draft);
      if (isNew) {
        const result = await persistNewDraft({
          draft,
          subEventId: subeventId,
          created: pendingCreatedForm,
          create: (metadata) => create.mutateAsync(metadata),
          save: (id, nextDraft) =>
            saveMutation.mutateAsync({ id, draft: nextDraft }),
        });
        if (result.status === "invalid") {
          setError(
            result.issues
              .map((issue) => `${issue.path}: ${issue.message}`)
              .join(" · "),
          );
          return;
        }
        if (result.status === "create-failed") {
          setError(apiError(result.error));
          return;
        }
        if (result.status === "save-failed") {
          setPendingCreatedForm(result.created);
          setError(apiError(result.error));
          return;
        }
        setDraft(builderToDraft(result.saved));
        setLoadedRevision(result.saved.revision);
        setPendingCreatedForm(result.created);
        setDirty(false);
        allowNavigation.current = true;
        navigate(`${base}/${encodeURIComponent(result.saved.id)}`, {
          replace: true,
        });
        return;
      }
      const result = await validate.mutateAsync({ id: formId, draft: payload });
      if (!result.valid) {
        setError(
          result.issues
            .map((issue) => `${issue.path}: ${issue.message}`)
            .join(" · "),
        );
        return;
      }
      const saved = await saveMutation.mutateAsync({
        id: formId,
        draft: payload,
      });
      setDraft(builderToDraft(saved));
      setLoadedRevision(saved.revision);
      setDirty(false);
      setNotice(`Saved revision ${saved.revision}.`);
    } catch (failure) {
      setError(apiError(failure));
    }
  };
  const openPreview = () => {
    if (!draft) return;
    setPreviewOpen(true);
    preview.reset();
    if (!isNew) preview.mutate({ id: formId, draft: toPayload(draft) });
  };
  const detailStatus = (formQuery.error as AxiosError | null)?.response?.status;
  if ((!events.isLoading && !event) || (subevent.isError && !subevent.data))
    return <Navigate to="/events" replace />;
  if (subevent.data && subevent.data.eventId !== eventId)
    return <Navigate to="/events" replace />;
  if (
    (formQuery.isError && (detailStatus === 403 || detailStatus === 404)) ||
    (formQuery.data && formQuery.data.subEventId !== subeventId)
  )
    return <Navigate to={base} replace />;
  if (formQuery.isError)
    return (
      <PageLayout icon={ClipboardList} title="Form builder">
        <EmptyQueryError
          message={apiError(formQuery.error)}
          retry={() => formQuery.refetch()}
          back={() => navigate(base)}
        />
      </PageLayout>
    );
  if (
    !event ||
    !subevent.data ||
    (!isNew && (formQuery.isLoading || !formQuery.data)) ||
    !draft
  )
    return (
      <PageLayout icon={ClipboardList} title="Form builder">
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading form builder...
        </p>
      </PageLayout>
    );
  const form = formQuery.data;
  const displayStatus = form?.status ?? "DRAFT";
  const displayVersion = form?.version ?? 1;
  const savePending = create.isPending || saveMutation.isPending;
  const localPreviewIssues = isNew ? validateDraftLocally(draft) : [];

  return (
    <PageLayout
      icon={ClipboardList}
      title="Form builder"
      breadcrumbs={[
        "Tools",
        "Events",
        event.name,
        subevent.data.name,
        "Forms",
        draft.name,
      ]}
    >
      <AlertDialog
        open={blocker.state === "blocked"}
        onOpenChange={(open) => {
          if (!open && blocker.state === "blocked") blocker.reset();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your latest form edits have not been saved. If you leave now,
              those changes will be permanently discarded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              variant="delete"
              onClick={() => blocker.state === "blocked" && blocker.proceed()}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 rounded-xl border border-primary/15 bg-primary p-5 text-primary-foreground sm:flex-row sm:items-end">
          <div>
            <button
              type="button"
              onClick={leave}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-primary-foreground/75 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </button>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">{draft.name}</h1>
              <FormStatusBadge status={displayStatus} />
            </div>
            <p className="mt-1 text-sm text-primary-foreground/75">
              Version {displayVersion} · {questionCount} questions across{" "}
              {draft.sections.length} sections {dirty && "· Unsaved changes"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={openPreview}>
              <Eye />
              Preview
            </Button>
            {locked ? (
              <Button
                variant="secondary"
                disabled={clone.isPending}
                onClick={() =>
                  clone.mutate(
                    { id: form!.id },
                    {
                      onSuccess: (created) =>
                        navigate(`${base}/${encodeURIComponent(created.id)}`),
                    },
                  )
                }
              >
                <Copy />
                {clone.isPending ? "Cloning..." : "Clone new draft"}
              </Button>
            ) : (
              <Button
                onClick={save}
                disabled={!dirty || savePending || validate.isPending}
              >
                <Save />
                {savePending ? "Saving form..." : "Save form"}
              </Button>
            )}
          </div>
        </header>
        {locked && (
          <p className="mb-4 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            This {displayStatus.toLowerCase()} version is read-only to preserve
            the exact participant contract and submission history. Clone it to
            create editable version {displayVersion + 1}.
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-semantic-danger-background p-3 text-sm text-semantic-danger"
          >
            {error}
          </p>
        )}
        {clone.isError && (
          <p role="alert" className="mb-4 text-sm text-semantic-danger">
            {apiError(clone.error)}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-4 text-sm text-emerald-700">
            {notice}
          </p>
        )}
        <fieldset
          disabled={locked}
          className="grid gap-6 border-0 p-0 lg:grid-cols-[minmax(0,1fr)_20rem]"
        >
          <main className="space-y-5">
            {draft.sections.map((section, sectionIndex) => (
              <SectionEditor
                key={section.clientKey}
                section={section}
                index={sectionIndex}
                total={draft.sections.length}
                update={(next) =>
                  edit((current) => ({
                    ...current,
                    sections: current.sections.map((item) =>
                      item.clientKey === section.clientKey ? next : item,
                    ),
                  }))
                }
                move={(direction) =>
                  edit((current) => ({
                    ...current,
                    sections: moveItem(
                      current.sections,
                      sectionIndex,
                      direction,
                    ),
                  }))
                }
                remove={() =>
                  edit((current) => ({
                    ...current,
                    sections: current.sections.filter(
                      (item) => item.clientKey !== section.clientKey,
                    ),
                  }))
                }
              />
            ))}
            {!draft.sections.length && (
              <Card>
                <CardContent className="py-12 text-center text-sm text-muted-foreground">
                  Add a section to begin building the form.
                </CardContent>
              </Card>
            )}
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                edit((current) => ({
                  ...current,
                  sections: [
                    ...current.sections,
                    {
                      clientKey: clientKey("section"),
                      title: `Section ${current.sections.length + 1}`,
                      description: null,
                      questions: [],
                    },
                  ],
                }))
              }
            >
              <Plus />
              Add section
            </Button>
          </main>
          <aside className="self-start lg:sticky lg:top-5">
            <Card>
              <CardHeader>
                <CardTitle>Form settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Field label="Form name">
                  <Input
                    value={draft.name}
                    onChange={(event) =>
                      edit((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    rows={4}
                    className="w-full rounded-lg border bg-background p-3 text-sm"
                    value={draft.description ?? ""}
                    onChange={(event) =>
                      edit((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Stage">
                  <Select
                    value={draft.stage}
                    onValueChange={(stage) =>
                      edit((current) => ({
                        ...current,
                        stage: stage as EditorDraft["stage"],
                        assignments: current.assignments.map((assignment) => ({
                          ...assignment,
                          blocksCheckIn:
                            stage === "POST_REGISTRATION" &&
                            assignment.blocksCheckIn,
                        })),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formStages.map((stage) => (
                        <SelectItem key={stage} value={stage}>
                          {stage === "REGISTRATION"
                            ? "Registration"
                            : "Post-registration"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <p className="text-xs leading-5 text-muted-foreground">
                  {draft.stage === "REGISTRATION"
                    ? "Collected during checkout. Registration assignments never block check-in."
                    : "Collected after registration for follow-up requirements and check-in readiness."}
                </p>
                <div className="border-t pt-4">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">
                        Routing assignments
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Route to one package or keep the all-packages fallback.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        edit((current) => ({
                          ...current,
                          assignments: [
                            ...current.assignments,
                            newAssignment(current.assignments.length),
                          ],
                        }))
                      }
                    >
                      <Plus /> Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {draft.assignments.map((assignment, index) => (
                      <AssignmentEditor
                        key={assignment.id ?? `assignment-${index}`}
                        assignment={assignment}
                        index={index}
                        total={draft.assignments.length}
                        stage={draft.stage}
                        packages={packagesQuery.data ?? []}
                        update={(next) =>
                          edit((current) => ({
                            ...current,
                            assignments: current.assignments.map(
                              (item, itemIndex) =>
                                itemIndex === index ? next : item,
                            ),
                          }))
                        }
                        remove={() =>
                          edit((current) => ({
                            ...current,
                            assignments: current.assignments.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          }))
                        }
                        move={(direction) =>
                          edit((current) => ({
                            ...current,
                            assignments: moveItem(
                              current.assignments,
                              index,
                              direction,
                            ),
                          }))
                        }
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Saving sends the entire ordered draft. Revision{" "}
                  {draft.revision} protects against concurrent edits.
                </p>
              </CardContent>
            </Card>
          </aside>
        </fieldset>
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preview.data?.name ?? draft.name}</DialogTitle>
            <DialogDescription>
              {preview.data?.description ??
                draft.description ??
                "Participant-facing preview"}
            </DialogDescription>
          </DialogHeader>
          {!isNew && preview.isPending && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Building server preview...
            </p>
          )}
          {!isNew && preview.isError && (
            <div className="space-y-3 rounded-lg bg-semantic-danger-background p-3">
              <p role="alert" className="text-sm text-semantic-danger">
                {apiError(preview.error)}
              </p>
              <Button size="sm" variant="secondary" onClick={openPreview}>
                Retry preview
              </Button>
            </div>
          )}
          {!isNew && preview.data && !preview.data.validation.valid && (
            <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              Preview has {preview.data.validation.issues.length} validation
              issue(s). The local preview remains available.
            </p>
          )}
          {isNew && localPreviewIssues.length > 0 && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <p>
                Preview has {localPreviewIssues.length} validation issue(s). The
                local preview remains available.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {localPreviewIssues.map((issue, index) => (
                  <li key={`${issue.path}-${issue.code}-${index}`}>
                    {issue.path}: {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isNew ? (
            <Preview sections={draft.sections} />
          ) : (
            preview.data && <Preview sections={previewSections(preview.data)} />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}

function AssignmentEditor({
  assignment,
  index,
  total,
  stage,
  packages,
  update,
  remove,
  move,
}: {
  assignment: DraftAssignment;
  index: number;
  total: number;
  stage: EditorDraft["stage"];
  packages: EventPackage[];
  update: (assignment: DraftAssignment) => void;
  remove: () => void;
  move: (direction: number) => void;
}) {
  const setWindow = (key: "opensAt" | "closesAt", value: string) =>
    update({
      ...assignment,
      [key]: value ? new Date(value).toISOString() : null,
    });
  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
      <div className="flex items-center justify-between">
        <strong className="text-xs uppercase tracking-wide">
          Route {index + 1}
        </strong>
        <div className="flex">
          <IconButton
            label={`Move route ${index + 1} up`}
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ArrowUp />
          </IconButton>
          <IconButton
            label={`Move route ${index + 1} down`}
            disabled={index === total - 1}
            onClick={() => move(1)}
          >
            <ArrowDown />
          </IconButton>
          <IconButton label={`Delete route ${index + 1}`} onClick={remove}>
            <Trash2 />
          </IconButton>
        </div>
      </div>
      <Field label="Audience">
        <Select
          value={assignment.audience}
          onValueChange={(audience) =>
            update({
              ...assignment,
              audience: audience as DraftAssignment["audience"],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="BUYER">Buyer only</SelectItem>
            <SelectItem value="EACH_ATTENDEE">Each attendee</SelectItem>
            <SelectItem value="ALL_ORDER_MEMBERS">All order members</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label="Ticket package">
        <select
          aria-label={`Ticket package for route ${index + 1}`}
          value={assignment.ticketPackageId ?? "ALL"}
          onChange={(event) =>
            update({
              ...assignment,
              ticketPackageId:
                event.target.value === "ALL" ? null : event.target.value,
            })
          }
          className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
        >
          <option value="ALL">All packages (fallback)</option>
          {packages.map((item) => (
            <option key={item.id} value={item.id}>
              {packageOptionLabel(item)}
            </option>
          ))}
          {assignment.ticketPackageId &&
            !packages.some(
              (item) => item.id === assignment.ticketPackageId,
            ) && (
              <option value={assignment.ticketPackageId}>
                Historical package (inactive or unavailable)
              </option>
            )}
        </select>
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={assignment.isRequired}
          onCheckedChange={(checked) =>
            update({
              ...assignment,
              isRequired: checked === true,
              blocksCheckIn: checked === true && assignment.blocksCheckIn,
            })
          }
        />
        Required
      </label>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={assignment.blocksCheckIn}
          disabled={stage === "REGISTRATION" || !assignment.isRequired}
          onCheckedChange={(checked) =>
            update({ ...assignment, blocksCheckIn: checked === true })
          }
        />
        Blocks check-in
      </label>
      <Field label="Opens">
        <Input
          type="datetime-local"
          value={localDateTime(assignment.opensAt)}
          onChange={(event) => setWindow("opensAt", event.target.value)}
        />
      </Field>
      <Field label="Closes">
        <Input
          type="datetime-local"
          value={localDateTime(assignment.closesAt)}
          onChange={(event) => setWindow("closesAt", event.target.value)}
        />
      </Field>
      <p className="text-xs text-muted-foreground">
        Order {index + 1} ·{" "}
        {assignment.ticketPackageId
          ? "Package-specific"
          : "All packages fallback"}
      </p>
    </div>
  );
}

function SectionEditor({
  section,
  index,
  total,
  update,
  move,
  remove,
}: {
  section: DraftSection;
  index: number;
  total: number;
  update: (section: DraftSection) => void;
  move: (direction: number) => void;
  remove: () => void;
}) {
  return (
    <Card>
      <CardHeader className="border-b bg-muted/30">
        <div className="flex gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
            {index + 1}
          </span>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <Input
              aria-label="Section title"
              value={section.title}
              onChange={(event) =>
                update({ ...section, title: event.target.value })
              }
            />
            <Input
              aria-label="Section description"
              value={section.description ?? ""}
              placeholder="Description"
              onChange={(event) =>
                update({ ...section, description: event.target.value })
              }
            />
          </div>
          <div className="flex">
            <IconButton
              label="Move section up"
              disabled={index === 0}
              onClick={() => move(-1)}
            >
              <ArrowUp />
            </IconButton>
            <IconButton
              label="Move section down"
              disabled={index === total - 1}
              onClick={() => move(1)}
            >
              <ArrowDown />
            </IconButton>
            <IconButton label="Delete section" onClick={remove}>
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-5">
        {section.questions.map((question, questionIndex) => (
          <QuestionEditor
            key={question.clientKey}
            question={question}
            index={questionIndex}
            total={section.questions.length}
            update={(next) =>
              update({
                ...section,
                questions: section.questions.map((item) =>
                  item.clientKey === question.clientKey ? next : item,
                ),
              })
            }
            move={(direction) =>
              update({
                ...section,
                questions: moveItem(
                  section.questions,
                  questionIndex,
                  direction,
                ),
              })
            }
            remove={() =>
              update({
                ...section,
                questions: section.questions.filter(
                  (item) => item.clientKey !== question.clientKey,
                ),
              })
            }
            duplicate={() =>
              update({
                ...section,
                questions: [
                  ...section.questions,
                  {
                    ...question,
                    id: undefined,
                    fieldKey: undefined,
                    clientKey: clientKey("question"),
                    label: `${question.label} (copy)`,
                    options: question.options.map((option) => ({
                      label: option.label,
                      value: option.value,
                    })),
                  },
                ],
              })
            }
          />
        ))}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() =>
            update({
              ...section,
              questions: [...section.questions, newQuestion()],
            })
          }
        >
          <Plus />
          Add question
        </Button>
      </CardContent>
    </Card>
  );
}

function QuestionEditor({
  question,
  index,
  total,
  update,
  move,
  remove,
  duplicate,
}: {
  question: DraftQuestion;
  index: number;
  total: number;
  update: (question: DraftQuestion) => void;
  move: (direction: number) => void;
  remove: () => void;
  duplicate: () => void;
}) {
  const validation = question.validation;
  const numberValidation = (key: keyof typeof validation, value: string) => {
    const parsed = value === "" ? undefined : Number(value);
    if (parsed !== undefined && !Number.isFinite(parsed)) return;
    update({
      ...question,
      validation: {
        ...validation,
        [key]: parsed,
      },
    });
  };
  return (
    <div className="rounded-xl border">
      <div className="flex items-center gap-2 border-b bg-muted/30 px-3 py-2">
        <span className="text-xs font-bold text-muted-foreground">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="rounded-md bg-card px-2 py-1 text-xs font-semibold text-primary">
          {titleCase(question.fieldType)}
        </span>
        <div className="ml-auto flex">
          <IconButton
            label="Move question up"
            disabled={index === 0}
            onClick={() => move(-1)}
          >
            <ArrowUp />
          </IconButton>
          <IconButton
            label="Move question down"
            disabled={index === total - 1}
            onClick={() => move(1)}
          >
            <ArrowDown />
          </IconButton>
          <IconButton label="Duplicate question" onClick={duplicate}>
            <Copy />
          </IconButton>
          <IconButton label="Delete question" onClick={remove}>
            <Trash2 />
          </IconButton>
        </div>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2">
        <Field label="Question">
          <Input
            value={question.label}
            onChange={(event) =>
              update({ ...question, label: event.target.value })
            }
          />
        </Field>
        <Field label="Field type">
          <Select
            value={question.fieldType}
            onValueChange={(type) =>
              update({
                ...question,
                fieldType: type as FieldType,
                options: usesOptions(type as FieldType) ? question.options : [],
                validation: validationForType(
                  question.validation,
                  type as FieldType,
                ),
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {titleCase(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Help text">
          <Input
            value={question.helpText ?? ""}
            onChange={(event) =>
              update({ ...question, helpText: event.target.value })
            }
          />
        </Field>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold">
          <Checkbox
            checked={question.isRequired}
            onCheckedChange={(checked) =>
              update({ ...question, isRequired: checked === true })
            }
          />
          Required
        </label>
        {(question.fieldType === "TEXT" ||
          question.fieldType === "TEXTAREA") && (
          <>
            <NumberField
              label="Minimum length"
              value={validation.minLength}
              min={0}
              onChange={(value) => numberValidation("minLength", value)}
            />
            <NumberField
              label="Maximum length"
              value={validation.maxLength}
              min={1}
              onChange={(value) => numberValidation("maxLength", value)}
            />
            <Field
              label="Pattern"
              helper="Matched against the complete answer. Use bounded safe syntax such as literals, character classes, groups, alternation, and bounded quantifiers. The server compiles and validates it."
              className="sm:col-span-2"
            >
              <Input
                value={validation.pattern ?? ""}
                maxLength={256}
                placeholder="e.g. [A-Z]{2}[0-9]{4}"
                onChange={(event) =>
                  update({
                    ...question,
                    validation: {
                      ...validation,
                      pattern: event.target.value || undefined,
                    },
                  })
                }
              />
            </Field>
            <Field
              label="Participant error message"
              helper="Shown when the server determines that the complete answer does not match."
              className="sm:col-span-2"
            >
              <Input
                value={validation.patternMessage ?? ""}
                maxLength={200}
                placeholder="Explain the expected format"
                onChange={(event) =>
                  update({
                    ...question,
                    validation: {
                      ...validation,
                      patternMessage: event.target.value || undefined,
                    },
                  })
                }
              />
            </Field>
          </>
        )}
        {question.fieldType === "NUMBER" && (
          <>
            <NumberField
              label="Minimum value"
              value={validation.min}
              step="any"
              onChange={(value) => numberValidation("min", value)}
            />
            <NumberField
              label="Maximum value"
              value={validation.max}
              step="any"
              onChange={(value) => numberValidation("max", value)}
            />
          </>
        )}
        {question.fieldType === "DATE" && (
          <>
            <Field label="Minimum date">
              <Input
                type="date"
                value={validation.minDate ?? ""}
                onChange={(event) =>
                  update({
                    ...question,
                    validation: {
                      ...validation,
                      minDate: event.target.value || undefined,
                    },
                  })
                }
              />
            </Field>
            <Field label="Maximum date">
              <Input
                type="date"
                value={validation.maxDate ?? ""}
                onChange={(event) =>
                  update({
                    ...question,
                    validation: {
                      ...validation,
                      maxDate: event.target.value || undefined,
                    },
                  })
                }
              />
            </Field>
          </>
        )}
        {question.fieldType === "CHECKBOX" && (
          <>
            <NumberField
              label="Minimum selections"
              value={validation.minSelections}
              min={0}
              onChange={(value) => numberValidation("minSelections", value)}
            />
            <NumberField
              label="Maximum selections"
              value={validation.maxSelections}
              min={1}
              onChange={(value) => numberValidation("maxSelections", value)}
            />
          </>
        )}
        {question.fieldType === "FILE" && (
          <>
            <Field
              label="Allowed MIME types"
              helper="Comma-separated, e.g. image/png, application/pdf"
            >
              <Input
                value={validation.allowedFileTypes?.join(", ") ?? ""}
                onChange={(event) =>
                  update({
                    ...question,
                    validation: {
                      ...validation,
                      allowedFileTypes: event.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    },
                  })
                }
              />
            </Field>
            <NumberField
              label="Maximum file size (MB)"
              value={validation.maxFileSizeMb}
              min={0.01}
              max={100}
              step="any"
              onChange={(value) => numberValidation("maxFileSizeMb", value)}
            />
            <NumberField
              label="Maximum files"
              value={validation.maxFiles}
              min={1}
              max={20}
              onChange={(value) => numberValidation("maxFiles", value)}
            />
          </>
        )}
        {usesOptions(question.fieldType) && (
          <OptionsEditor question={question} update={update} />
        )}
      </div>
    </div>
  );
}

function OptionsEditor({
  question,
  update,
}: {
  question: DraftQuestion;
  update: (question: DraftQuestion) => void;
}) {
  return (
    <div className="space-y-3 sm:col-span-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Options</span>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() =>
            update({
              ...question,
              options: [
                ...question.options,
                {
                  label: `Option ${question.options.length + 1}`,
                  value: nextOptionValue(
                    question.options.map((option) => option.value),
                  ),
                },
              ],
            })
          }
        >
          <Plus />
          Add option
        </Button>
      </div>
      {question.options.map((option, index) => (
        <div
          key={option.id ?? `${question.clientKey}-${index}`}
          className="grid grid-cols-[1fr_1fr_auto_auto_auto] gap-2"
        >
          <Input
            aria-label={`Option ${index + 1} label`}
            value={option.label}
            placeholder="Label"
            onChange={(event) =>
              update({
                ...question,
                options: question.options.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, label: event.target.value }
                    : item,
                ),
              })
            }
          />
          <Input
            aria-label={`Option ${index + 1} value`}
            value={option.value}
            placeholder="Value"
            onChange={(event) =>
              update({
                ...question,
                options: question.options.map((item, itemIndex) =>
                  itemIndex === index
                    ? { ...item, value: event.target.value }
                    : item,
                ),
              })
            }
          />
          <IconButton
            label="Move option up"
            disabled={index === 0}
            onClick={() =>
              update({
                ...question,
                options: moveItem(question.options, index, -1),
              })
            }
          >
            <ArrowUp />
          </IconButton>
          <IconButton
            label="Move option down"
            disabled={index === question.options.length - 1}
            onClick={() =>
              update({
                ...question,
                options: moveItem(question.options, index, 1),
              })
            }
          >
            <ArrowDown />
          </IconButton>
          <IconButton
            label="Delete option"
            onClick={() =>
              update({
                ...question,
                options: question.options.filter(
                  (_, itemIndex) => itemIndex !== index,
                ),
              })
            }
          >
            <Trash2 />
          </IconButton>
        </div>
      ))}
    </div>
  );
}

export function Preview({ sections }: { sections: DraftSection[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.clientKey}>
          <h3 className="font-bold">{section.title}</h3>
          {section.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {section.description}
            </p>
          )}
          <div className="mt-4 space-y-5">
            {section.questions.map((question) => (
              <PreviewQuestion key={question.clientKey} question={question} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
function PreviewQuestion({ question }: { question: DraftQuestion }) {
  const label = (
    <>
      <span className="text-sm font-semibold">
        {question.label}
        {question.isRequired && (
          <span className="text-semantic-danger"> *</span>
        )}
      </span>
      {question.helpText && (
        <span className="block text-xs text-muted-foreground">
          {question.helpText}
        </span>
      )}
    </>
  );
  if (question.fieldType === "RADIO" || question.fieldType === "CHECKBOX")
    return (
      <fieldset>
        <legend>{label}</legend>
        <div className="mt-2 space-y-2">
          {question.options.map((option, index) => (
            <label
              key={option.id ?? index}
              className="flex items-center gap-2 text-sm"
            >
              <input
                disabled
                type={question.fieldType === "RADIO" ? "radio" : "checkbox"}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  return (
    <label className="block space-y-2">
      {label}
      {question.fieldType === "TEXTAREA" ? (
        <textarea
          disabled
          rows={3}
          className="w-full rounded-lg border bg-muted/40 p-2"
          minLength={question.validation.minLength}
          maxLength={question.validation.maxLength}
        />
      ) : question.fieldType === "SELECT" ? (
        <select
          disabled
          className="h-10 w-full rounded-lg border bg-muted/40 px-3"
        >
          <option>Select an option</option>
          {question.options.map((option, index) => (
            <option key={option.id ?? index}>{option.label}</option>
          ))}
        </select>
      ) : question.fieldType === "FILE" ? (
        <Input
          disabled
          type="file"
          multiple={(question.validation.maxFiles ?? 1) > 1}
          accept={question.validation.allowedFileTypes?.join(",")}
        />
      ) : (
        <Input
          disabled
          type={
            question.fieldType === "NUMBER"
              ? "number"
              : question.fieldType === "DATE"
                ? "date"
                : "text"
          }
          min={
            question.fieldType === "DATE"
              ? question.validation.minDate
              : question.validation.min
          }
          max={
            question.fieldType === "DATE"
              ? question.validation.maxDate
              : question.validation.max
          }
          minLength={question.validation.minLength}
          maxLength={question.validation.maxLength}
        />
      )}
      {(question.fieldType === "TEXT" || question.fieldType === "TEXTAREA") &&
        question.validation.pattern && (
          <span className="block text-xs text-muted-foreground">
            Complete-answer format required
            {question.validation.patternMessage
              ? `: ${question.validation.patternMessage}`
              : "."}
          </span>
        )}
    </label>
  );
}

const Field = ({
  label,
  helper,
  className,
  children,
}: {
  label: string;
  helper?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`block space-y-2 ${className ?? ""}`}>
    <span className="block text-sm font-semibold">{label}</span>
    {helper && (
      <span className="block text-xs text-muted-foreground">{helper}</span>
    )}
    {children}
  </label>
);
const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value?: number;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number | "any";
}) => (
  <Field label={label}>
    <Input
      type="number"
      value={value ?? ""}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(event.target.value)}
    />
  </Field>
);
const IconButton = ({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) => (
  <Button type="button" size="sm" variant="ghost" aria-label={label} {...props}>
    {children}
  </Button>
);

const EmptyQueryError = ({
  message,
  retry,
  back,
}: {
  message: string;
  retry: () => void;
  back: () => void;
}) => (
  <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
    <div>
      <h2 className="text-lg font-bold">Form could not be loaded</h2>
      <p role="alert" className="mt-2 text-sm text-muted-foreground">
        {message}
      </p>
    </div>
    <div className="flex justify-center gap-2">
      <Button onClick={retry}>Retry</Button>
      <Button variant="secondary" onClick={back}>
        Back to forms
      </Button>
    </div>
  </div>
);
