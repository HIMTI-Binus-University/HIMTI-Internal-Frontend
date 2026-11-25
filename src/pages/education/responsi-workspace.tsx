import { HocuspocusProvider } from "@hocuspocus/provider";
import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Eye,
  FileText,
  History,
  Save,
  Send,
} from "lucide-react";

import {
  useApproveResponsi,
  useCreateResponsi,
  useGetResponsiVersions,
  useRestoreResponsiVersion,
  useUpdateResponsi,
} from "@/api/education/queries";
import { useGetMe } from "@/api/auth/queries";
import { ResponsiStatusBadge } from "@/components/education/ResponsiStatusBadge";
import { ConfirmAction } from "@/components/events/ConfirmAction";
import { backendMessage, useNotification } from "@/components/notification";
import { Container } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  ResponsiEditorCandidate,
  ResponsiStatus,
  ResponsiSummary,
  SummaryType,
} from "@/types/education";

import ResponsiEditors from "./responsi-editors";

const ResponsiEditor = lazy(() => import("./responsi-editor"));

type ResponsiWorkspaceProps = {
  summary: ResponsiSummary;
  initialContent?: string;
  initialApproval?: string | null;
  initialCollaborationRevision?: number;
  editorIds?: string[];
  editors?: ResponsiEditorCandidate[];
  initialPreview?: boolean;
  courseOptions: string[];
  periodOptions: string[];
  onClose: () => void;
  onSaved?: (updated: ResponsiSummary) => void;
};

const EXAM_TYPE_OPTIONS = ["Mid Exam", "Final Exam"];

const buildEditorContent = (summary: ResponsiSummary) =>
  `# ${summary.title}

## Ringkasan

Ringkasan ini merangkum materi ${summary.course} untuk ${summary.examType} ${summary.academicPeriod}.

## Poin utama

1. Tulis konsep inti yang wajib dipahami.
2. Tambahkan contoh soal dan langkah penyelesaian.
3. Tandai bagian yang perlu ditinjau ulang.

## Catatan

Gunakan editor ini untuk menyusun materi bersama PIC dan kontributor.`;

const ResponsiWorkspace = ({
  summary,
  initialContent,
  initialApproval,
  initialCollaborationRevision,
  editorIds,
  editors,
  initialPreview = false,
  courseOptions,
  periodOptions,
  onClose,
  onSaved,
}: ResponsiWorkspaceProps) => {
  const notify = useNotification();
  const { data: me } = useGetMe();
  const hasPermission = (permission: string) =>
    me?.permissions.includes("manage_education") ||
    Boolean(me?.permissions.includes(permission));
  const canEdit = me?.permissions.includes("manage_education") ||
    Boolean(me && hasPermission("edit_education_summary") && editorIds?.includes(me.id));
  const canSave = summary.id.startsWith("draft-")
    ? hasPermission("create_education_summary")
    : canEdit;
  const activeId = summary.id;
  const [title, setTitle] = useState(summary.title);
  const [summaryType, setSummaryType] = useState<SummaryType>(
    summary.summaryType ?? "Responsi",
  );
  const [course, setCourse] = useState(summary.course);
  const [academicPeriod, setAcademicPeriod] = useState(summary.academicPeriod);
  const [examType, setExamType] = useState(summary.examType);
  const [pic, setPic] = useState(summary.pic);
  const [content, setContent] = useState(() => initialContent ?? buildEditorContent(summary));
  const [approval, setApproval] = useState(initialApproval);
  const [revision, setRevision] = useState(initialCollaborationRevision);
  const [status, setStatus] = useState<ResponsiStatus>(summary.status);
  const [editorsOpen, setEditorsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(initialPreview);

  const isDraftId = activeId.startsWith("draft-");

  const collaborationUrl = import.meta.env.VITE_EDUCATION_COLLABORATION_URL;
  const shouldCollaborate = Boolean(
    collaborationUrl && canEdit && revision !== undefined &&
    (status === "DRAFT" || status === "UNDER_REVIEW") && !isDraftId,
  );
  const room = shouldCollaborate ? `${activeId}:${revision}` : null;
  const [liveRoom, setLiveRoom] = useState<{ name: string; provider: HocuspocusProvider }>();
  const [liveStatus, setLiveStatus] = useState("Connecting to live editing?");
  const [liveReady, setLiveReady] = useState(false);

  useEffect(() => {
    if (!room || !collaborationUrl) return;
    setLiveRoom(undefined);
    setLiveReady(false);
    setLiveStatus("Connecting to live editing?");
    const provider = new HocuspocusProvider({
      url: collaborationUrl,
      name: room,
      token: "session",
      onSynced: ({ state }) => {
        if (state) {
          setLiveRoom({ name: room, provider });
          setLiveReady(true);
          setLiveStatus("Live editing connected");
        }
      },
      onUnsyncedChanges: ({ number }) => setLiveReady(provider.synced && number === 0),
      onDisconnect: () => {
        setLiveReady(false);
        setLiveStatus("Connection lost. Reconnecting?");
      },
      onAuthenticationFailed: () => {
        setLiveReady(false);
        setLiveStatus("Live editing access changed. Reload to reconnect.");
      },
    });
    return () => {
      provider.destroy();
      provider.document.destroy();
    };
  }, [room, collaborationUrl]);

  const liveProvider = liveRoom?.name === room ? liveRoom?.provider : undefined;

  useEffect(() => setApproval(initialApproval), [initialApproval]);

  const { data: versions = [], isLoading: isLoadingVersions } =
    useGetResponsiVersions(isDraftId ? undefined : activeId);

  const createResponsiMutation = useCreateResponsi();
  const approveResponsiMutation = useApproveResponsi();
  const updateResponsiMutation = useUpdateResponsi();
  const restoreVersionMutation = useRestoreResponsiVersion();
  const isPending =
    createResponsiMutation.isPending ||
    approveResponsiMutation.isPending ||
    updateResponsiMutation.isPending ||
    restoreVersionMutation.isPending ||
    (shouldCollaborate && !liveReady);

  const reviewAction =
    status === "DRAFT" && canSave
      ? { label: "Submit for review", next: "UNDER_REVIEW" as const }
      : status === "UNDER_REVIEW" && approval && hasPermission("publish_education_summary")
        ? { label: "Publish summary", next: "PUBLISHED" as const }
        : null;

  const saveDraft = async () => {
    try {
      if (isDraftId) {
        const created = await createResponsiMutation.mutateAsync({
          title: title.trim() || "Untitled summary",
          summaryType,
          course,
          academicPeriod,
          examType: (examType as "Mid Exam" | "Final Exam") || "Mid Exam",
          pic: pic.trim() || "Unassigned",
          content,
          status: "DRAFT",
        });
        setStatus(created.status);
        notify("Summary draft saved successfully.", "success");
        onSaved?.(created);
      } else {
        const updated = await updateResponsiMutation.mutateAsync({
          id: activeId,
          summaryType,
          title: title.trim() || "Untitled summary",
          course,
          academicPeriod,
          examType: (examType as "Mid Exam" | "Final Exam") || "Mid Exam",
          pic: pic.trim() || "Unassigned",
          ...(!shouldCollaborate && { content }),
          status,
        });
        setStatus(updated.status);
        setApproval(updated.approvedById);
        setRevision(updated.collaborationRevision);
        notify("Draft saved successfully.", "success");
        onSaved?.(updated);
      }
    } catch (err) {
      notify(backendMessage(err, "Failed to save draft."), "error");
    }
  };

  const moveStatus = async () => {
    if (!reviewAction) return;
    const nextStatus = reviewAction.next;
    try {
      if (isDraftId) {
        const created = await createResponsiMutation.mutateAsync({
          title: title.trim() || "Untitled summary",
          summaryType,
          course,
          academicPeriod,
          examType: (examType as "Mid Exam" | "Final Exam") || "Mid Exam",
          pic: pic.trim() || "Unassigned",
          content,
          status: nextStatus,
        });
        setStatus(created.status);
        notify(`${reviewAction.label} completed.`, "success");
        onSaved?.(created);
      } else {
        const updated = await updateResponsiMutation.mutateAsync({
          id: activeId,
          summaryType,
          title: title.trim() || "Untitled summary",
          course,
          academicPeriod,
          examType: (examType as "Mid Exam" | "Final Exam") || "Mid Exam",
          pic: pic.trim() || "Unassigned",
          ...((!shouldCollaborate || nextStatus === "PUBLISHED") && { content }),
          status: nextStatus,
        });
        setStatus(updated.status);
        setApproval(updated.approvedById);
        setRevision(updated.collaborationRevision);
        notify(`${reviewAction.label} completed.`);
        onSaved?.(updated);
      }
    } catch (err) {
      notify(backendMessage(err, "Failed to update status."), "error");
    }
  };

  return (
    <>
      <Container className="flex min-h-0 flex-1 flex-col p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <IconButton
            label="Back to summaries list"
            size="sm"
            onClick={onClose}
          >
            <ArrowLeft />
          </IconButton>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-foreground">
                {title || "Untitled summary"}
              </h2>
              <ResponsiStatusBadge status={status} />
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {course} · {academicPeriod} · {examType}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setHistoryOpen(true)}
            >
              <History />
              History
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye />
              Preview
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={isPending || !course || !canSave}
              onClick={saveDraft}
            >
              <Save />
              {isPending ? "Saving..." : "Save draft"}
            </Button>
            {reviewAction && (
              <Button size="sm" disabled={isPending || !course} onClick={moveStatus}>
                <Send />
                {reviewAction.label}
              </Button>
            )}
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_280px] lg:overflow-hidden">
          <section
            aria-labelledby="responsi-editor-heading"
            className="flex min-h-[320px] flex-col overflow-hidden rounded-xl border border-border bg-card lg:min-h-0"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
              <div className="flex items-center gap-2">
                <FileText
                  aria-hidden="true"
                  className="size-4 text-muted-foreground"
                />
                <h3
                  id="responsi-editor-heading"
                  className="text-sm font-semibold"
                >
                  Document
                </h3>
                <Badge variant="neutral">Markdown</Badge>
              </div>
            </div>
            {shouldCollaborate && (
              <p role="status" className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
                {liveStatus}
              </p>
            )}
            {(!shouldCollaborate || liveProvider) && (
              <Suspense fallback={<p role="status" className="p-4">Loading editor...</p>}>
                <ResponsiEditor
                  key={room ?? "local"}
                  value={content}
                  onChange={setContent}
                  readOnly={!canSave}
                  provider={liveProvider}
                  collaboratorName={me?.name}
                />
              </Suspense>
            )}
          </section>

          <aside className="flex min-h-0 flex-col gap-4 lg:overflow-y-auto">
            <section
              aria-labelledby="responsi-details-heading"
              className="rounded-xl border border-border p-4"
            >
              <h3
                id="responsi-details-heading"
                className="text-sm font-semibold"
              >
                Metadata
              </h3>
              <div className="mt-3 space-y-3">
                <div>
                  <Label htmlFor="responsi-title" className="mb-1.5">
                    Title
                  </Label>
                  <Input
                    id="responsi-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="summary-type" className="mb-1.5">
                    Summary type
                  </Label>
                  <Select
                    items={[
                      { value: "Responsi", label: "Responsi" },
                      { value: "Study Club", label: "Study Club" },
                    ]}
                    value={summaryType}
                    onValueChange={(value) => {
                      if (value === "Responsi" || value === "Study Club")
                        setSummaryType(value);
                    }}
                  >
                    <SelectTrigger id="summary-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Responsi">Responsi</SelectItem>
                      <SelectItem value="Study Club">Study Club</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsi-course" className="mb-1.5">
                    Course
                  </Label>
                  <Select
                    items={courseOptions.map((value) => ({
                      value,
                      label: value,
                    }))}
                    value={course}
                    onValueChange={(value) => setCourse(value ?? course)}
                  >
                    <SelectTrigger id="responsi-course">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courseOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsi-period" className="mb-1.5">
                    Academic period
                  </Label>
                  <Select
                    items={periodOptions.map((value) => ({
                      value,
                      label: value,
                    }))}
                    value={academicPeriod}
                    onValueChange={(value) =>
                      setAcademicPeriod(value ?? academicPeriod)
                    }
                  >
                    <SelectTrigger id="responsi-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsi-exam-type" className="mb-1.5">
                    Exam type
                  </Label>
                  <Select
                    items={EXAM_TYPE_OPTIONS.map((value) => ({
                      value,
                      label: value,
                    }))}
                    value={examType}
                    onValueChange={(value) =>
                      setExamType(
                        (value as ResponsiSummary["examType"]) ?? examType,
                      )
                    }
                  >
                    <SelectTrigger id="responsi-exam-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXAM_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="responsi-pic" className="mb-1.5">
                    PIC
                  </Label>
                  <Input
                    id="responsi-pic"
                    value={pic}
                    onChange={(event) => setPic(event.target.value)}
                  />
                </div>
              </div>
            </section>

            <section
              aria-labelledby="responsi-review-heading"
              className="rounded-xl border border-border p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3
                  id="responsi-review-heading"
                  className="text-sm font-semibold"
                >
                  Review & publish
                </h3>
                <ResponsiStatusBadge status={status} />
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Review is required before the first publish. Only users with
                publish permission can make it public.
              </p>
              {status === "UNDER_REVIEW" && !approval &&
              hasPermission("review_education_summary") ? (
                <ConfirmAction
                  label="Approve summary"
                  description="Approve the saved version for publication. Save any changes before approving."
                  onConfirm={async () => {
                    const updated = await approveResponsiMutation.mutateAsync(activeId);
                    setApproval(updated.approvedById);
                  }}
                  successMessage="Summary approved."
                >
                  <Button className="mt-3 w-full" size="sm" disabled={isPending}>
                    Approve summary
                  </Button>
                </ConfirmAction>
              ) : reviewAction ? (
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  disabled={isPending}
                  onClick={moveStatus}
                >
                  <Send />
                  {reviewAction.label}
                </Button>
              ) : (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock3 aria-hidden="true" className="size-3.5" />
                  No review action for this status.
                </p>
              )}
              {!isDraftId && me?.permissions.includes("manage_education") && (
                <Button
                  className="mt-2 w-full"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() => setEditorsOpen(true)}
                >
                  Assign editors
                </Button>
              )}
              {!isDraftId && status !== "ARCHIVED" &&
              hasPermission("archive_education_summary") && (
                <ConfirmAction
                  label="Archive summary"
                  description="This removes the summary from the published list."
                  onConfirm={async () => {
                    const updated = await updateResponsiMutation.mutateAsync({
                      id: activeId,
                      status: "ARCHIVED",
                    });
                    setStatus(updated.status);
                    setApproval(updated.approvedById);
                    onSaved?.(updated);
                  }}
                >
                  <Button className="mt-2 w-full" variant="outline" size="sm" disabled={isPending}>
                    Archive summary
                  </Button>
                </ConfirmAction>
              )}
            </section>
          </aside>
        </div>
      </Container>

      {editorsOpen && (
        <ResponsiEditors
          id={activeId}
          editors={editors ?? []}
          onClose={() => setEditorsOpen(false)}
        />
      )}

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Version history</SheetTitle>
            <SheetDescription>
              Internal snapshots for review and recovery. Not shown on the
              public site.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 space-y-3">
            {isLoadingVersions ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                Loading versions...
              </p>
            ) : versions.length > 0 ? (
              <ol className="space-y-3">
                {versions.map((item) => (
                  <li
                    key={item.id || item.version}
                    className="rounded-xl border border-border p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">
                        {item.version}
                      </span>
                      <span className="text-sm">
                        {item.summary || "Published snapshot"}
                      </span>
                      <ResponsiStatusBadge status="PUBLISHED" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.author
                        ? `Published by ${item.author}`
                        : "Snapshot created on publish"}
                    </p>
                    {item.reviewerName && (
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        Reviewed by {item.reviewerName}
                      </p>
                    )}
                    {Boolean(item.editorNames?.length) && (
                      <p className="mt-1 break-words text-xs text-muted-foreground">
                        Editors {item.editorNames?.join(", ")}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString("en-GB", {
                        timeZone: "Asia/Jakarta",
                      })}{" "}
                      WIB
                    </p>
                    {canEdit && <ConfirmAction
                      label={`Restore ${item.version}`}
                      description="This replaces the current document content, including unsaved edits, and sends the summary back to review."
                      successMessage="Version restored and sent to review."
                      onConfirm={async () => {
                        const restored = await restoreVersionMutation.mutateAsync({
                          id: activeId,
                          versionId: item.id,
                        });
                        setContent(restored.content);
                        setStatus(restored.status);
                        setApproval(restored.approvedById);
                        setRevision(restored.collaborationRevision);
                        onSaved?.(restored);
                      }}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        disabled={isPending}
                        aria-label={`Restore ${item.version}`}
                      >
                        Restore
                      </Button>
                    </ConfirmAction>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No published snapshots yet. A new version is automatically
                generated every time this summary is published.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Summary preview</SheetTitle>
            <SheetDescription>
              How the summary reads once it is published. Preview reflects
              unsaved edits in this workspace.
            </SheetDescription>
          </SheetHeader>

          <article className="mt-5 rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold leading-7 text-foreground">
                  {title || "Untitled summary"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course} · {academicPeriod} · {examType}
                </p>
              </div>
              <ResponsiStatusBadge status={status} />
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-3 text-xs">
              <div>
                <dt className="text-muted-foreground">PIC</dt>
                <dd className="mt-0.5 font-medium text-foreground">{pic}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Academic period</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {academicPeriod}
                </dd>
              </div>
            </dl>

            <Suspense fallback={<p role="status" className="p-4">Loading preview...</p>}>
              <ResponsiEditor value={content} readOnly />
            </Suspense>
          </article>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ResponsiWorkspace;
