import { useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CirclePlay,
  FileText,
  Pencil,
  Plus,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useGetCourseGroups } from "@/api/education/queries";
import { ResponsiStatusBadge } from "@/components/education/ResponsiStatusBadge";
import { useNotification } from "@/components/notification";
import { Container } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { CourseGroup, ResponsiSummary } from "@/types/education";

// shortcut: connected resources are mock data until the Responsi API ships.
const COURSE_RESPONSI: Record<string, ResponsiSummary[]> = {
  "Algorithm & Programming": [
    {
      id: "dynamic-programming",
      title: "Dynamic Programming",
      course: "Algorithm & Programming",
      academicPeriod: "2026/2027",
      examType: "Mid Exam",
      pic: "Joshua Alexander Larido",
      status: "PUBLISHED",
      lastUpdated: "2026-10-25T16:56:00Z",
    },
    {
      id: "graph-algorithms",
      title: "Graph Algorithms",
      course: "Algorithm & Programming",
      academicPeriod: "2026/2027",
      examType: "Final Exam",
      pic: "Rachel Vanesssa",
      status: "DRAFT",
      lastUpdated: "2026-10-20T07:02:00Z",
    },
  ],
  Calculus: [
    {
      id: "limits-and-continuity",
      title: "Limits and Continuity",
      course: "Calculus",
      academicPeriod: "2026/2027",
      examType: "Mid Exam",
      pic: "Abyan Ikram Muhammad",
      status: "PUBLISHED",
      lastUpdated: "2026-10-22T11:30:00Z",
    },
  ],
  "Database Systems": [
    {
      id: "database-normalization",
      title: "Database Normalization",
      course: "Database Systems",
      academicPeriod: "2026/2027",
      examType: "Mid Exam",
      pic: "Abyan Ikram Muhammad",
      status: "PUBLISHED",
      lastUpdated: "2026-10-25T09:36:00Z",
    },
  ],
  "Computer Architecture": [
    {
      id: "computer-architecture-basics",
      title: "Computer Architecture Basics",
      course: "Computer Architecture",
      academicPeriod: "2026/2027",
      examType: "Mid Exam",
      pic: "Joshua Alexander Larido",
      status: "UNDER_REVIEW",
      lastUpdated: "2026-10-21T09:19:00Z",
    },
  ],
  "Operating Systems": [
    {
      id: "operating-systems",
      title: "Operating Systems",
      course: "Operating Systems",
      academicPeriod: "2026/2027",
      examType: "Mid Exam",
      pic: "Abyan Ikram Muhammad",
      status: "DRAFT",
      lastUpdated: "2026-10-18T04:20:00Z",
    },
  ],
  "Computer Networks": [
    {
      id: "network-fundamentals",
      title: "Network Fundamentals",
      course: "Computer Networks",
      academicPeriod: "2026/2027",
      examType: "Final Exam",
      pic: "Christopher Sebastian",
      status: "ARCHIVED",
      lastUpdated: "2026-10-10T02:14:00Z",
    },
  ],
};

const ResourcePlaceholder = ({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) => (
  <section className="rounded-xl border border-dashed border-border p-4">
    <div className="flex flex-wrap items-center gap-2">
      <Icon aria-hidden="true" className="size-4 text-muted-foreground" />
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
        Managed in its own tab
      </span>
    </div>
    <p className="mt-2 text-xs leading-5 text-muted-foreground">
      {description}
    </p>
  </section>
);

const CourseGroupsTab = () => {
  const notify = useNotification();
  const {
    data: serverCourses = [],
    isLoading,
    isError,
    refetch,
  } = useGetCourseGroups();
  // shortcut: local edits stay in this draft until the Course Group write API ships.
  const [draftCourses, setDraftCourses] = useState<CourseGroup[] | null>(null);
  const courses = draftCourses ?? serverCourses;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseGroup | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const selectedCourse =
    courses.find((course) => course.id === selectedId) ?? courses[0];
  const selectedResponsi = selectedCourse
    ? (COURSE_RESPONSI[selectedCourse.name] ?? [])
    : [];

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) =>
      [course.name, course.code ?? ""].some((value) =>
        value.toLowerCase().includes(keyword),
      ),
    );
  }, [courses, search]);

  const openAddCourse = () => {
    setEditingCourse(null);
    setName("");
    setCode("");
    setSheetOpen(true);
  };

  const openEditCourse = () => {
    if (!selectedCourse) return;
    setEditingCourse(selectedCourse);
    setName(selectedCourse.name);
    setCode(selectedCourse.code ?? "");
    setSheetOpen(true);
  };

  const saveCourse = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (editingCourse) {
      setDraftCourses((current) =>
        (current ?? serverCourses).map((course) =>
          course.id === editingCourse.id
            ? { ...course, name: trimmedName, code: code.trim() || null }
            : course,
        ),
      );
      notify("Course updated locally. API sync comes next.");
    } else {
      const created: CourseGroup = {
        id: `course-${Date.now()}`,
        name: trimmedName,
        code: code.trim() || null,
        status: "ACTIVE",
      };
      setDraftCourses((current) => [...(current ?? serverCourses), created]);
      setSelectedId(created.id);
      notify("Course added locally. API sync comes next.");
    }

    setSearch("");
    setSheetOpen(false);
  };

  return (
    <Container className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
      <div>
        <h2 className="text-ds-h4 font-semibold tracking-tight text-foreground">
          Course Groups
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Organize courses and see the resources connected to each one.
        </p>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[280px_minmax(0,1fr)] lg:overflow-hidden">
        <aside className="flex max-h-[340px] min-h-0 flex-col overflow-hidden rounded-xl border border-border lg:max-h-none">
          <div className="border-b border-border p-3">
            <label className="sr-only" htmlFor="course-group-search">
              Search courses
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.75] text-muted-foreground"
              />
              <Input
                id="course-group-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses..."
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="mt-2 w-full justify-start"
              onClick={openAddCourse}
            >
              <Plus />
              Add course
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {isLoading ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Loading courses...
              </p>
            ) : isError ? (
              <div className="px-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Could not load courses.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : filteredCourses.length ? (
              <ul className="space-y-0.5">
                {filteredCourses.map((course) => {
                  const isSelected = course.id === selectedCourse?.id;
                  const count = COURSE_RESPONSI[course.name]?.length ?? 0;

                  return (
                    <li key={course.id}>
                      <button
                        type="button"
                        aria-current={isSelected ? "true" : undefined}
                        onClick={() => setSelectedId(course.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                          isSelected
                            ? "bg-semantic-info-background text-primary"
                            : "hover:bg-muted/60",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            isSelected
                              ? "bg-card text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          <BookOpen aria-hidden="true" className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {course.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {course.code || "No code"} · {count} Responsi
                          </span>
                        </span>
                        <ChevronRight
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground"
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {courses.length
                  ? "No courses match this search."
                  : "No courses yet."}
              </p>
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">Loading course...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Could not load course groups.
              </p>
            </div>
          ) : selectedCourse ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-4">
                <div>
                  <h3 className="text-lg font-semibold leading-7 tracking-tight text-foreground">
                    {selectedCourse.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedCourse.code || "No course code"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openEditCourse}>
                  <Pencil />
                  Edit course
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <section aria-labelledby="course-responsi-heading">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText
                        aria-hidden="true"
                        className="size-4 text-muted-foreground"
                      />
                      <h4
                        id="course-responsi-heading"
                        className="text-sm font-semibold text-foreground"
                      >
                        Responsi
                      </h4>
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {selectedResponsi.length}
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/education?tab=responsi&course=${encodeURIComponent(selectedCourse.name)}&action=create`}
                      >
                        <Plus />
                        Create
                      </Link>
                    </Button>
                  </div>

                  {selectedResponsi.length ? (
                    <ul className="mt-2 divide-y divide-border overflow-hidden rounded-xl border border-border">
                      {selectedResponsi.map((responsi) => (
                        <li key={responsi.id}>
                          <Link
                            to={`/education?tab=responsi&id=${encodeURIComponent(responsi.id)}`}
                            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {responsi.title}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {responsi.examType} · {responsi.academicPeriod}
                              </p>
                            </div>
                            <ResponsiStatusBadge status={responsi.status} />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 rounded-xl border border-dashed border-border px-3 py-5 text-center text-sm text-muted-foreground">
                      No Responsi for this course yet.
                    </p>
                  )}
                </section>

                <ResourcePlaceholder
                  icon={CalendarDays}
                  title="Study Clubs"
                  description="Session schedules for this course are managed in the Study Clubs tab. This section is read-only here."
                />
                <ResourcePlaceholder
                  icon={CirclePlay}
                  title="Videos"
                  description="Recordings for this course are managed in the Videos tab. This section is read-only here."
                />
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Add a course to start connecting resources.
              </p>
            </div>
          )}
        </section>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingCourse ? "Edit course" : "Add course"}
            </SheetTitle>
            <SheetDescription>
              Course names are shared by Responsi, Study Clubs, and Videos.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-5 space-y-3" onSubmit={saveCourse}>
            <div>
              <Label htmlFor="course-name" className="mb-1.5">
                Course name
              </Label>
              <Input
                id="course-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Algorithm & Programming"
                required
              />
            </div>
            <div>
              <Label htmlFor="course-code" className="mb-1.5">
                Course code
              </Label>
              <Input
                id="course-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="e.g. CS-101"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCourse ? "Save changes" : "Add course"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Container>
  );
};

export default CourseGroupsTab;
