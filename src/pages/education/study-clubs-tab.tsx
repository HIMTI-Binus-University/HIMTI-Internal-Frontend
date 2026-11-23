import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  Info,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { useGetCourseGroups } from "@/api/education/queries";
import {
  useCreateStudyClub,
  useGetStudyClubs,
  useUpdateStudyClub,
} from "@/api/study-clubs/queries";
import { Container } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StudyClubPanel from "./study-club-panel";
import {
  formatSessionDate,
  formatSessionTime,
  sessionStatus,
  type StudyClubSession,
  type StudyClubPayload,
} from "./study-clubs";

const PAGE_SIZE = 6;

export default function StudyClubsTab() {
  const [params, setParams] = useSearchParams();
  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useGetCourseGroups();
  const [search, setSearch] = useState("");
  const courseFilter = params.get("course") ?? "all";
  const [period, setPeriod] = useState<"upcoming" | "past" | "all">("upcoming");
  const [type, setType] = useState<"all" | StudyClubSession["type"]>("all");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(Date.now);
  const [panel, setPanel] = useState<{
    session: StudyClubSession | null;
    preview: boolean;
  } | null>(null);
  const [feedback, setFeedback] = useState("");
  const createRef = useRef<HTMLButtonElement>(null);

  const {
    data: response,
    isLoading: sessionsLoading,
    isError: sessionsError,
    refetch: refetchSessions,
  } = useGetStudyClubs({
    search: search.trim() || undefined,
    course: courseFilter !== "all" ? courseFilter : undefined,
    type: type !== "all" ? type : undefined,
    schedule: period,
    page,
    limit: PAGE_SIZE,
  });
  const createMutation = useCreateStudyClub();
  const updateMutation = useUpdateStudyClub();
  const visible = response?.data ?? [];
  const total = response?.pagination.total ?? 0;
  const totalPages = response?.pagination.totalPages ?? 1;
  const currentPage = Math.min(page, totalPages);
  const hasFilters = Boolean(
    search.trim() ||
    courseFilter !== "all" ||
    type !== "all" ||
    period !== "upcoming",
  );
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (response && page > totalPages) setPage(totalPages);
  }, [response, page, totalPages]);

  const courseOptions = Array.from(
    new Set([
      ...courses.map((course) => course.name),
      ...visible.map((session) => session.course),
      ...(courseFilter !== "all" ? [courseFilter] : []),
    ]),
  ).sort();
  const courseItems = [
    { value: "all", label: "All Courses" },
    ...courseOptions.map((course) => ({ value: course, label: course })),
  ];
  const typeItems = [
    { value: "all", label: "All Session Types" },
    { value: "Study Club", label: "Study Club" },
    { value: "Responsi", label: "Responsi" },
  ];
  const scheduleItems = [
    { value: "upcoming", label: "Upcoming & Ongoing" },
    { value: "past", label: "Past Sessions" },
    { value: "all", label: "All Sessions" },
  ];
  const reset = () => {
    setSearch("");
    setPeriod("upcoming");
    setType("all");
    setPage(1);
    const next = new URLSearchParams(params);
    next.delete("course");
    setParams(next, { replace: true });
  };
  const closePanel = () => {
    setPanel(null);
    requestAnimationFrame(() => createRef.current?.focus());
  };
  const save = async (payload: StudyClubPayload) => {
    const session = panel?.session
      ? await updateMutation.mutateAsync({ id: panel.session.id, payload })
      : await createMutation.mutateAsync(payload);
    setNow(Date.now());
    reset();
    setPeriod(sessionStatus(session) === "Past" ? "past" : "upcoming");
    setFeedback("Session saved successfully.");
    closePanel();
  };
  const loading = coursesLoading || sessionsLoading;
  const isError = coursesError || sessionsError;

  return (
    <Container className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-ds-h4 font-semibold tracking-tight text-foreground">
            Schedules
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Manage Study Club and Responsi schedules.
          </p>
        </div>
        <Button
          ref={createRef}
          size="sm"
          className="h-11 sm:shrink-0 lg:h-9"
          disabled={
            loading ||
            isError ||
            !courses.some((course) => course.status === "ACTIVE")
          }
          onClick={() => {
            setFeedback("");
            setPanel({ session: null, preview: false });
          }}
        >
          <Plus aria-hidden="true" />
          Create session
        </Button>
      </div>
      <p
        role="status"
        className={feedback ? "mt-3 text-sm text-primary" : "sr-only"}
      >
        {feedback}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_minmax(180px,252px)_176px_200px_40px]">
        <div className="relative sm:col-span-2 xl:col-span-1">
          <label className="sr-only" htmlFor="session-search">
            Search sessions
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="session-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="h-11 pl-9 lg:h-10"
            placeholder="Search by title, course, or location..."
          />
        </div>
        <Select
          items={courseItems}
          value={courseFilter}
          onValueChange={(value) => {
            const next = new URLSearchParams(params);
            if (!value || value === "all") next.delete("course");
            else next.set("course", value);
            setParams(next, { replace: true });
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by course" className="h-11 lg:h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {courseItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={typeItems}
          value={type}
          onValueChange={(value) => {
            setType(
              value === "Study Club" || value === "Responsi" ? value : "all",
            );
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by session type"
            className="h-11 lg:h-10"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={scheduleItems}
          value={period}
          onValueChange={(value) => {
            setPeriod(value === "past" || value === "all" ? value : "upcoming");
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by schedule"
            className="h-11 lg:h-10"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scheduleItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <IconButton
          label="Reset filters"
          tone="danger"
          className="size-11 border border-danger-border lg:size-10"
          onClick={reset}
        >
          <RotateCcw aria-hidden="true" />
        </IconButton>
      </div>
      <div className="mt-4 min-h-[300px] flex-1 overflow-y-auto rounded-xl border border-border">
        {loading ? (
          <p
            role="status"
            className="p-10 text-center text-sm text-muted-foreground"
          >
            Loading courses and sessions...
          </p>
        ) : isError ? (
          <div role="alert" className="mx-auto max-w-lg p-8 text-center">
            <p className="text-sm text-destructive">
              Could not load courses or sessions. Check the connection and try
              again.
            </p>
            <Button
              variant="outline"
              className="mt-4 min-h-11"
              onClick={() => {
                void refetchSessions();
                void refetchCourses();
              }}
            >
              Retry
            </Button>
          </div>
        ) : !visible.length ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-10 text-center">
            <CalendarDays
              aria-hidden="true"
              className="mb-4 size-9 text-primary"
            />
            <h3 className="text-base font-semibold">
              {hasFilters
                ? "No sessions match these filters"
                : "Your next session starts here"}
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              {hasFilters
                ? "Try another course, schedule, or search term."
                : courses.some((course) => course.status === "ACTIVE")
                  ? "Create a Study Club or Responsi session and keep the course, time, and meeting details together."
                  : "Add an active course in Course Groups before scheduling a session."}
            </p>
            {hasFilters && (
              <Button
                variant="outline"
                className="mt-4 min-h-11"
                onClick={reset}
              >
                Reset filters
              </Button>
            )}
          </div>
        ) : (
          <table className="block w-full text-left lg:table">
            <caption className="sr-only">
              Study Club and Responsi sessions. All schedule times are in WIB.
            </caption>
            <thead className="hidden bg-muted/50 lg:table-header-group">
              <tr className="text-xs text-muted-foreground">
                {[
                  "Session",
                  "Course",
                  "Schedule (WIB)",
                  "Location",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 font-semibold last:w-32"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="block divide-y divide-border lg:table-row-group">
              {visible.map((session) => {
                const status = sessionStatus(session, now);
                return (
                  <tr
                    key={session.id}
                    className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 transition-colors hover:bg-muted/30 lg:table-row lg:p-0"
                  >
                    <td className="col-span-2 min-w-0 sm:col-span-1 lg:max-w-[260px] lg:px-4 lg:py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-semantic-info-background text-primary">
                          <CalendarDays aria-hidden="true" className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <button
                            aria-label={session.title}
                            className="min-h-11 break-words text-left text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={() => setPanel({ session, preview: true })}
                          >
                            {session.title}
                            <span className="mt-1 block text-xs font-normal text-muted-foreground">
                              {session.type}
                            </span>
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="col-span-2 min-w-0 text-sm text-muted-foreground sm:col-span-1 lg:max-w-[180px] lg:px-4 lg:py-3">
                      <span className="mb-1 block text-xs font-semibold lg:hidden">
                        Course
                      </span>
                      <span className="break-words">{session.course}</span>
                    </td>
                    <td className="text-sm tabular-nums lg:px-4 lg:py-3">
                      <span className="block">
                        {formatSessionDate(session.startsAt)}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">
                        {formatSessionTime(session.startsAt)} -{" "}
                        {formatSessionTime(session.endsAt)} WIB
                      </span>
                      {formatSessionDate(session.startsAt) !==
                        formatSessionDate(session.endsAt) && (
                        <span className="block text-xs text-muted-foreground">
                          Ends {formatSessionDate(session.endsAt)}
                        </span>
                      )}
                    </td>
                    <td className="min-w-0 text-sm text-muted-foreground lg:max-w-[180px] lg:px-4 lg:py-3">
                      <span className="flex items-start gap-1.5">
                        <MapPin
                          aria-hidden="true"
                          className="mt-0.5 size-4 shrink-0"
                        />
                        <span className="break-words">
                          {session.location || "Online meeting"}
                        </span>
                      </span>
                      {session.capacity && (
                        <span className="mt-1 block text-xs">
                          Capacity: {session.capacity}
                        </span>
                      )}
                    </td>
                    <td className="self-center lg:px-4 lg:py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${status === "Past" ? "bg-muted text-muted-foreground" : "bg-semantic-info-background text-primary"}`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="lg:px-4 lg:py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11 text-primary"
                          aria-label={`Preview ${session.title}`}
                          onClick={() => setPanel({ session, preview: true })}
                        >
                          <Eye aria-hidden="true" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-11 text-primary"
                          aria-label={`Edit ${session.title}`}
                          onClick={() => setPanel({ session, preview: false })}
                        >
                          <Pencil aria-hidden="true" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Showing {total ? (currentPage - 1) * PAGE_SIZE + 1 : 0}-
            {Math.min(currentPage * PAGE_SIZE, total)} of {total} sessions
          </p>
          {visible.some((session) => session.isDemo) && (
            <p className="flex items-start gap-1.5 text-xs leading-5 text-muted-foreground">
              <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
              <span>
                Includes labelled demo sessions for development, not a real
                schedule.
              </span>
            </p>
          )}
        </div>
        <nav
          aria-label="Schedules pagination"
          className="flex items-center gap-2"
        >
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Previous sessions page"
            disabled={currentPage <= 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <span className="text-sm tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-11"
            aria-label="Next sessions page"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(currentPage + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </nav>
      </div>
      {panel && (
        <StudyClubPanel
          key={`${panel.session?.id ?? "new"}-${panel.preview}`}
          session={panel.session}
          preview={panel.preview}
          courses={courses.filter((course) => course.status === "ACTIVE")}
          initialCourse={
            courses.find((course) => course.name === courseFilter)?.id ?? ""
          }
          onClose={closePanel}
          onEdit={() => setPanel({ ...panel, preview: false })}
          onSave={save}
        />
      )}
    </Container>
  );
}
