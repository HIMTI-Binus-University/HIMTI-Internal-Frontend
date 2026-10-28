import { useState } from "react";
import {
  ArrowLeft,
  Clock3,
  Eye,
  FileText,
  History,
  Save,
  Send,
  Users,
} from "lucide-react";

import { ResponsiStatusBadge } from "@/components/education/ResponsiStatusBadge";
import { MarkdownTextarea } from "@/components/markdown-textarea";
import { useNotification } from "@/components/notification";
import { ResourceMarkdown } from "@/components/resource-markdown";
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
import type { ResponsiStatus, ResponsiSummary } from "@/types/education";

type ResponsiWorkspaceProps = {
  summary: ResponsiSummary;
  courseOptions: string[];
  periodOptions: string[];
  onClose: () => void;
};

const EXAM_TYPE_OPTIONS = ["Mid Exam", "Final Exam"];

const buildEditorContent = (summary: ResponsiSummary) =>
  `# ${summary.title}

## Ringkasan

Responsi ini merangkum materi ${summary.course} untuk ${summary.examType} ${summary.academicPeriod}.

## Poin utama

1. Tulis konsep inti yang wajib dipahami.
2. Tambahkan contoh soal dan langkah penyelesaian.
3. Tandai bagian yang perlu ditinjau ulang.

## Catatan

Gunakan editor ini untuk menyusun materi bersama PIC dan kontributor.`;

const HISTORY_ITEMS = [
  {
    version: "v4",
    label: "Current draft",
    detail: "Edited by Joshua Alexander",
    time: "25 Oct 2026, 23.56 WIB",
    status: "DRAFT" as ResponsiStatus,
  },
  {
    version: "v3",
    label: "Published snapshot",
    detail: "Published by Rachel Vanesssa",
    time: "24 Oct 2026, 18.10 WIB",
    status: "PUBLISHED" as ResponsiStatus,
  },
  {
    version: "v2",
    label: "Submitted for review",
    detail: "Submitted by Abyan Ikram",
    time: "22 Oct 2026, 14.42 WIB",
    status: "UNDER_REVIEW" as ResponsiStatus,
  },
];

const ResponsiWorkspace = ({
  summary,
  courseOptions,
  periodOptions,
  onClose,
}: ResponsiWorkspaceProps) => {
  const notify = useNotification();
  const [title, setTitle] = useState(summary.title);
  const [course, setCourse] = useState(summary.course);
  const [academicPeriod, setAcademicPeriod] = useState(
    summary.academicPeriod,
  );
  const [examType, setExamType] = useState(summary.examType);
  const [pic, setPic] = useState(summary.pic);
  const [content, setContent] = useState(() => buildEditorContent(summary));
  const [status, setStatus] = useState<ResponsiStatus>(summary.status);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const reviewAction =
    status === "DRAFT"
      ? { label: "Submit for review", next: "UNDER_REVIEW" as const }
      : status === "UNDER_REVIEW"
        ? { label: "Publish Responsi", next: "PUBLISHED" as const }
        : null;

  const saveDraft = () => {
    notify("Draft saved locally. API sync comes next.");
  };

  const moveStatus = () => {
    if (!reviewAction) return;
    setStatus(reviewAction.next);
    notify(`${reviewAction.label} done locally. API sync comes next.`);
  };

  return (
    <>
      <Container className="flex min-h-0 flex-1 flex-col p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <IconButton label="Back to Responsi list" size="sm" onClick={onClose}>
            <ArrowLeft />
          </IconButton>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-foreground">
                {title || "Untitled Responsi"}
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
            <Button size="sm" variant="secondary" onClick={saveDraft}>
              <Save />
              Save draft
            </Button>
            {reviewAction && (
              <Button size="sm" onClick={moveStatus}>
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
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users aria-hidden="true" className="size-3.5" />
                Joshua is editing
              </span>
            </div>
            <label className="sr-only" htmlFor="responsi-content">
              Responsi content
            </label>
            <MarkdownTextarea
              id="responsi-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              spellCheck
              className="min-h-0 flex-1 resize-none rounded-none border-0 bg-transparent px-4 py-3 text-sm leading-6 focus-visible:ring-0"
            />
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
              {reviewAction ? (
                <Button
                  className="mt-3 w-full"
                  size="sm"
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
            </section>
          </aside>
        </div>
      </Container>

      <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Version history</SheetTitle>
            <SheetDescription>
              Internal snapshots for review and recovery. Not shown on the
              public site.
            </SheetDescription>
          </SheetHeader>

          <ol className="mt-5 space-y-3">
            {HISTORY_ITEMS.map((item) => (
              <li
                key={item.version}
                className="rounded-xl border border-border p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{item.version}</span>
                  <span className="text-sm">{item.label}</span>
                  <ResponsiStatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.detail}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.time}
                </p>
              </li>
            ))}
          </ol>
        </SheetContent>
      </Sheet>

      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-2xl"
        >
          <SheetHeader>
            <SheetTitle>Responsi preview</SheetTitle>
            <SheetDescription>
              How the summary reads once it is published. Preview reflects
              unsaved edits in this workspace.
            </SheetDescription>
          </SheetHeader>

          <article className="mt-5 rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-semibold leading-7 text-foreground">
                  {title || "Untitled Responsi"}
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

            <ResourceMarkdown className="mt-5 text-sm leading-6 text-foreground">
              {content}
            </ResourceMarkdown>
          </article>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ResponsiWorkspace;
