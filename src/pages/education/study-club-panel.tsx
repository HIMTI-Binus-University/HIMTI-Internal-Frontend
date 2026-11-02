import { useState, type FormEvent } from "react";
import { ExternalLink, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
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
import type { CourseGroup } from "@/types/education";
import { backendMessage } from "@/components/notification";
import {
  formatSessionDate,
  formatSessionTime,
  toWibInput,
  studyClubLinkError,
  type StudyClubSession,
  type StudyClubPayload,
} from "./study-clubs";

interface Props {
  session: StudyClubSession | null;
  preview: boolean;
  courses: CourseGroup[];
  initialCourse: string;
  onClose: () => void;
  onEdit: () => void;
  onSave: (payload: StudyClubPayload) => Promise<void>;
}

export default function StudyClubPanel({
  session,
  preview,
  courses,
  initialCourse,
  onClose,
  onEdit,
  onSave,
}: Props) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [linkErrors, setLinkErrors] = useState({
    meetingUrl: "",
    registrationUrl: "",
  });
  const [panelContainer, setPanelContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const courseOptions =
    session && !courses.some((course) => course.id === session.courseId)
      ? [
          ...courses,
          {
            id: session.courseId,
            name: session.course,
            code: null,
            status: "INACTIVE" as const,
          },
        ]
      : courses;
  const startWib = session ? toWibInput(session.startsAt) : "";
  const endWib = session ? toWibInput(session.endsAt) : "";

  const validateLink = (input: HTMLInputElement) => {
    const message = studyClubLinkError(input.value);
    input.setCustomValidity(message);
    setLinkErrors((current) => ({ ...current, [input.name]: message }));
  };
  const changeLink = (input: HTMLInputElement) => {
    input.setCustomValidity("");
    if (linkErrors[input.name as keyof typeof linkErrors]) validateLink(input);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    setError("");
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const course = courseOptions.find((item) => item.id === text("courseId"));
    const startsAt = new Date(
      `${text("startDate")}T${text("startTime")}:00+07:00`,
    );
    const endsAt = new Date(`${text("endDate")}T${text("endTime")}:00+07:00`);
    const capacity = text("capacity") ? Number(text("capacity")) : null;
    if (!text("title") || !course)
      return setError("Enter a title and select a course.");
    if (
      !Number.isFinite(startsAt.getTime()) ||
      !Number.isFinite(endsAt.getTime()) ||
      endsAt <= startsAt
    )
      return setError("End date and time must be after the start.");
    const invalidLink = ["meetingUrl", "registrationUrl"].find((name) =>
      studyClubLinkError(text(name)),
    );
    if (invalidLink) {
      const input = event.currentTarget.elements.namedItem(
        invalidLink,
      ) as HTMLInputElement;
      validateLink(input);
      input.focus();
      return;
    }
    if (
      capacity !== null &&
      (!Number.isSafeInteger(capacity) ||
        capacity < 1 ||
        capacity > 2_147_483_647)
    )
      return setError(
        "Capacity must be a positive whole number up to 2,147,483,647.",
      );
    if (!text("location") && !text("meetingUrl"))
      return setError("Add a location or an online meeting link.");
    try {
      setSaving(true);
      await onSave({
        title: text("title"),
        type: text("type") === "Responsi" ? "Responsi" : "Study Club",
        courseId: course.id,
        description: text("description"),
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        location: text("location"),
        meetingUrl: text("meetingUrl"),
        registrationUrl: text("registrationUrl"),
        capacity,
      });
    } catch (cause) {
      setError(
        backendMessage(
          cause,
          "Could not save this session. Check your connection and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && !saving) onClose();
      }}
    >
      <SheetContent
        className={`flex w-full flex-col gap-0 bg-card p-0 sm:max-w-[520px] [&>button]:right-3 [&>button]:top-3 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center ${saving ? "[&>button]:pointer-events-none [&>button]:opacity-50" : ""}`}
        onEscapeKeyDown={(event) => {
          if (saving) event.preventDefault();
        }}
        onPointerDownOutside={(event) => {
          if (saving) event.preventDefault();
        }}
      >
        <SheetHeader className="shrink-0 border-b border-border px-6 py-5 pr-16 text-left">
          <SheetTitle className="text-xl">
            {preview
              ? "Session details"
              : session
                ? "Edit session"
                : "Create session"}
          </SheetTitle>
          <SheetDescription className="leading-6">
            {preview
              ? "Session details. All times are in WIB (UTC+7)."
              : "Schedule a Study Club or Responsi session. All times are in WIB (UTC+7)."}
          </SheetDescription>
        </SheetHeader>
        {preview && session ? (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div>
              <p className="text-sm font-medium text-primary">{session.type}</p>
              <h3 className="mt-1 break-words text-xl font-semibold">
                {session.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {session.course}
              </p>
            </div>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-5 border-y border-border py-6 text-sm leading-6">
              <dt className="text-muted-foreground">Starts</dt>
              <dd>
                {formatSessionDate(session.startsAt)},{" "}
                {formatSessionTime(session.startsAt)} WIB
              </dd>
              <dt className="text-muted-foreground">Ends</dt>
              <dd>
                {formatSessionDate(session.endsAt)},{" "}
                {formatSessionTime(session.endsAt)} WIB
              </dd>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="break-words">
                {session.location || "Online meeting"}
              </dd>
              <dt className="text-muted-foreground">Capacity</dt>
              <dd>
                {session.capacity
                  ? `${session.capacity} participants (informational)`
                  : "Not specified"}
              </dd>
            </dl>
            {session.description && (
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                {session.description}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {session.meetingUrl && (
                <Button asChild variant="outline" className="min-h-11">
                  <a
                    href={session.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Meeting link
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              )}
              {session.registrationUrl && (
                <Button asChild variant="outline" className="min-h-11">
                  <a
                    href={session.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Registration link
                    <ExternalLink aria-hidden="true" />
                  </a>
                </Button>
              )}
            </div>
            <Button onClick={onEdit} className="min-h-11">
              <Pencil aria-hidden="true" />
              Edit session
            </Button>
          </div>
        ) : (
          <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="space-y-2">
                <Label htmlFor="session-title">Session title</Label>
                <Input
                  id="session-title"
                  name="title"
                  defaultValue={session?.title}
                  maxLength={255}
                  required
                  className="h-11"
                  placeholder="Enter the session title"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="session-type">Session type</Label>
                  <Select
                    name="type"
                    defaultValue={session?.type ?? "Study Club"}
                    items={[
                      { value: "Study Club", label: "Study Club" },
                      { value: "Responsi", label: "Responsi" },
                    ]}
                  >
                    <SelectTrigger id="session-type" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent portalContainer={panelContainer}>
                      <SelectItem value="Study Club">Study Club</SelectItem>
                      <SelectItem value="Responsi">Responsi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="session-course">Course</Label>
                  <Select
                    name="courseId"
                    defaultValue={session?.courseId ?? (initialCourse || null)}
                    required
                    items={courseOptions.map((course) => ({
                      value: course.id,
                      label: course.name,
                    }))}
                  >
                    <SelectTrigger id="session-course" className="h-11">
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent portalContainer={panelContainer}>
                      {courseOptions.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-description">
                  Description (optional)
                </Label>
                <textarea
                  id="session-description"
                  name="description"
                  defaultValue={session?.description}
                  maxLength={5000}
                  rows={3}
                  className="flex min-h-28 w-full resize-y rounded-lg border border-input bg-card px-3 py-3 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20"
                  placeholder="Topics, preparation, or other session details"
                />
              </div>
              <fieldset className="border-t border-border pt-6">
                <legend className="pr-3 text-sm font-semibold">Schedule</legend>
                <p className="mb-5 text-xs leading-5 text-muted-foreground">
                  All dates and times use WIB (UTC+7).
                </p>
                <div className="grid max-w-sm grid-cols-[minmax(0,1fr)_7rem] gap-x-3 gap-y-5 sm:grid-cols-[minmax(0,1fr)_8rem]">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="session-start-date">Start date</Label>
                    <Input
                      id="session-start-date"
                      name="startDate"
                      type="date"
                      defaultValue={startWib.slice(0, 10)}
                      required
                      className="h-11 min-w-0"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="session-start-time">Start time</Label>
                    <Input
                      id="session-start-time"
                      name="startTime"
                      type="time"
                      defaultValue={startWib.slice(11)}
                      required
                      className="h-11 min-w-0"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="session-end-date">End date</Label>
                    <Input
                      id="session-end-date"
                      name="endDate"
                      type="date"
                      defaultValue={endWib.slice(0, 10)}
                      required
                      className="h-11 min-w-0"
                    />
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="session-end-time">End time</Label>
                    <Input
                      id="session-end-time"
                      name="endTime"
                      type="time"
                      defaultValue={endWib.slice(11)}
                      required
                      className="h-11 min-w-0"
                    />
                  </div>
                </div>
              </fieldset>
              <fieldset className="border-t border-border pt-6">
                <legend className="pr-3 text-sm font-semibold">
                  Location & access
                </legend>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="session-location">Location</Label>
                    <Input
                      id="session-location"
                      name="location"
                      defaultValue={session?.location}
                      maxLength={255}
                      className="h-11"
                      placeholder="Room, campus, or venue"
                    />
                    <p className="text-xs text-muted-foreground">
                      Add a location or a meeting link for online sessions.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-meeting">
                      Meeting URL (optional)
                    </Label>
                    <Input
                      id="session-meeting"
                      name="meetingUrl"
                      type="url"
                      defaultValue={session?.meetingUrl}
                      maxLength={2048}
                      className="h-11"
                      placeholder="https://example.com/meeting"
                      aria-invalid={Boolean(linkErrors.meetingUrl)}
                      aria-describedby="session-meeting-help session-meeting-error"
                      onChange={(event) => changeLink(event.currentTarget)}
                      onBlur={(event) => validateLink(event.currentTarget)}
                      onInvalid={(event) => validateLink(event.currentTarget)}
                    />
                    <p
                      id="session-meeting-help"
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      Use a full http:// or https:// link.
                    </p>
                    <p
                      id="session-meeting-error"
                      role={linkErrors.meetingUrl ? "alert" : undefined}
                      className={
                        linkErrors.meetingUrl
                          ? "text-xs leading-5 text-destructive"
                          : "hidden"
                      }
                    >
                      {linkErrors.meetingUrl}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-registration">
                      Registration URL (optional)
                    </Label>
                    <Input
                      id="session-registration"
                      name="registrationUrl"
                      type="url"
                      defaultValue={session?.registrationUrl}
                      maxLength={2048}
                      className="h-11"
                      placeholder="https://example.com/register"
                      aria-invalid={Boolean(linkErrors.registrationUrl)}
                      aria-describedby="session-registration-help session-registration-error"
                      onChange={(event) => changeLink(event.currentTarget)}
                      onBlur={(event) => validateLink(event.currentTarget)}
                      onInvalid={(event) => validateLink(event.currentTarget)}
                    />
                    <p
                      id="session-registration-help"
                      className="text-xs leading-5 text-muted-foreground"
                    >
                      Use a full http:// or https:// link to the registration
                      form.
                    </p>
                    <p
                      id="session-registration-error"
                      role={linkErrors.registrationUrl ? "alert" : undefined}
                      className={
                        linkErrors.registrationUrl
                          ? "text-xs leading-5 text-destructive"
                          : "hidden"
                      }
                    >
                      {linkErrors.registrationUrl}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="session-capacity">
                      Capacity (optional)
                    </Label>
                    <Input
                      id="session-capacity"
                      name="capacity"
                      type="number"
                      min={1}
                      max={2_147_483_647}
                      step={1}
                      defaultValue={session?.capacity ?? ""}
                      className="h-11"
                      placeholder="Number of participants"
                    />
                    <p className="text-xs text-muted-foreground">
                      Informational only. No participant tracking or quota
                      enforcement.
                    </p>
                  </div>
                </div>
              </fieldset>
            </div>
            <div className="shrink-0 space-y-3 border-t border-border bg-card px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              {error && (
                <p role="alert" className="text-sm leading-6 text-destructive">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-h-11"
                  disabled={saving || !courseOptions.length}
                >
                  {saving ? "Saving..." : "Save session"}
                </Button>
              </div>
            </div>
          </form>
        )}
        <div ref={setPanelContainer} />
      </SheetContent>
    </Sheet>
  );
}
