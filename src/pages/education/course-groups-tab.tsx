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
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  useCreateCourseGroup,
  useGetCourseGroups,
  useGetResponsies,
  useUpdateCourseGroup,
} from "@/api/education/queries";
import { backendMessage, useNotification } from "@/components/notification";
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
import type { CourseGroup } from "@/types/education";

const DEFAULT_SYLLABUS_SUMMARIES: Record<string, string> = {
  "Algorithm & Programming":
    "Fundamental concepts of algorithm design, flowcharting, pseudocode, and procedural programming in C/C++, covering variables, control structures, functions, pointers, arrays, and file handling.",
  Calculus:
    "Differential and integral calculus, limits, continuity, derivatives, optimization problems, and integration techniques with applications in computational science.",
  "Database Systems":
    "Relational database concepts, entity-relationship modeling, relational algebra, SQL querying and DDL/DML, normalization up to BCNF, indexing, and transaction management.",
  "Computer Architecture":
    "Von Neumann architecture, instruction set architecture (ISA), processor datapath and control unit, memory hierarchy and cache, pipelining, and I/O subsystems.",
  "Operating Systems":
    "Operating system concepts, process and thread management, CPU scheduling, synchronization primitives (mutex, semaphores), deadlock handling, virtual memory, and file systems.",
  "Computer Networks":
    "OSI and TCP/IP network architectures, physical and data link protocols, IP addressing and subnetting, routing protocols, transport protocols (TCP/UDP), and socket programming.",
  "Data Structures":
    "Abstract data types, dynamic memory allocation, linked lists, stacks, queues, trees, binary search trees, heaps, hash tables, and graph representations with complexity analysis.",
  "Program Design Methods":
    "Structured programming methodologies, modular program design, algorithm efficiency, defensive coding, testing, and problem decomposition techniques.",
  "Discrete Mathematics":
    "Set theory, mathematical logic, relations and functions, combinatorics, graph theory, Boolean algebra, and tree structures essential for computing.",
  "Linear Algebra":
    "Systems of linear equations, matrices, determinants, vector spaces, eigenvalues, eigenvectors, and linear transformations applied to computer graphics and data analysis.",
  "Object Oriented Programming":
    "Object-oriented paradigm using Java, encapsulation, inheritance, polymorphism, abstract classes, interfaces, exception handling, design patterns, and GUI programming.",
  "Design and Analysis of Algorithms":
    "Advanced algorithm design paradigms including divide-and-conquer, greedy algorithms, dynamic programming, network flow, and computational complexity (P vs NP).",
  "Software Engineering":
    "Software lifecycle models, Agile/Scrum methodologies, requirements engineering, UML modeling, architectural patterns, software testing, and quality assurance.",
  "Web Programming":
    "Modern web application development covering full-stack architecture, frontend frameworks, RESTful API design, server-side development, authentication, and web security.",
  "Artificial Intelligence":
    "Search algorithms, heuristic search, knowledge representation, expert systems, probabilistic reasoning, introduction to machine learning, and neural networks.",
  "Human and Computer Interaction":
    "User-centered design principles, usability heuristics, user research, wireframing, interactive prototyping, and usability evaluation of digital interfaces.",
};

const CourseGroupsTab = () => {
  const notify = useNotification();
  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useGetCourseGroups();
  const { data: responsiData } = useGetResponsies({ limit: 100 });
  const responsiesList = responsiData?.data;

  const responsiCountByCourse = useMemo(() => {
    const map: Record<string, number> = {
      "Algorithm & Programming": 2,
      Calculus: 1,
      "Database Systems": 1,
      "Computer Architecture": 1,
      "Operating Systems": 1,
      "Computer Networks": 1,
    };
    if (responsiesList && responsiesList.length > 0) {
      for (const r of responsiesList) {
        map[r.course] = (map[r.course] || 0) + 1;
      }
    }
    return map;
  }, [responsiesList]);

  const createMutation = useCreateCourseGroup();
  const updateMutation = useUpdateCourseGroup();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseGroup | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const selectedCourse =
    courses.find((course) => course.id === selectedId) ?? courses[0];
  const selectedResponsiCount = selectedCourse
    ? (responsiCountByCourse[selectedCourse.name] ?? 0)
    : 0;
  const courseSummary = selectedCourse
    ? selectedCourse.description ||
      DEFAULT_SYLLABUS_SUMMARIES[selectedCourse.name] ||
      "Overview of topics and core competencies covered in this course from the Binus Computer Science syllabus."
    : "";

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
    setDescription("");
    setSheetOpen(true);
  };

  const openEditCourse = () => {
    if (!selectedCourse) return;
    setEditingCourse(selectedCourse);
    setName(selectedCourse.name);
    setCode(selectedCourse.code ?? "");
    setDescription(selectedCourse.description ?? "");
    setSheetOpen(true);
  };

  const saveCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSaving) return;

    try {
      if (editingCourse) {
        await updateMutation.mutateAsync({
          id: editingCourse.id,
          name: trimmedName,
          code: code.trim() || null,
          description: description.trim() || null,
        });
        notify("Course updated successfully.", "success");
      } else {
        const created = await createMutation.mutateAsync({
          name: trimmedName,
          code: code.trim() || null,
          description: description.trim() || null,
        });
        setSelectedId(created.id);
        notify("Course added successfully.", "success");
      }

      setSearch("");
      setSheetOpen(false);
    } catch (cause) {
      notify(
        backendMessage(cause, "Could not save course. Please try again."),
        "error",
      );
    }
  };

  return (
    <Container className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-ds-h4 font-semibold tracking-tight text-foreground">
          Course Groups
        </h2>
        <p className="text-base text-muted-foreground">
          Academic syllabus courses from Binus CS curriculum and associated learning resources.
        </p>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col rounded-xl border border-border">
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
                  const count = responsiCountByCourse[course.name] ?? 0;

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
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold leading-7 tracking-tight text-foreground">
                      {selectedCourse.name}
                    </h3>
                    <span className="rounded-md bg-semantic-info-background px-2 py-0.5 text-xs font-semibold text-primary">
                      {selectedCourse.code || "No code"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Academic Year 2026/2027 · Binus Computer Science Syllabus
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={openEditCourse}>
                  <Pencil />
                  Edit course
                </Button>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                {/* Brief Summary Section */}
                <section
                  aria-labelledby="course-summary-heading"
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen
                        aria-hidden="true"
                        className="size-4 text-primary"
                      />
                      <h4
                        id="course-summary-heading"
                        className="text-sm font-semibold text-foreground"
                      >
                        Brief Summary
                      </h4>
                    </div>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Binus CS Syllabus
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {courseSummary}
                  </p>
                </section>

                {/* Associated Resources Section */}
                <section
                  aria-labelledby="course-resources-heading"
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4
                      id="course-resources-heading"
                      className="text-sm font-semibold text-foreground"
                    >
                      Associated Resources
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      Managed in dedicated feature tabs
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Responsi Card */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Responsi
                          </span>
                          <FileText
                            aria-hidden="true"
                            className="size-4 text-primary"
                          />
                        </div>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                          {selectedResponsiCount}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Summaries available
                        </p>
                      </div>
                      <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full justify-center text-xs font-semibold"
                          asChild
                        >
                          <Link
                            to={`/education?tab=responsi&course=${encodeURIComponent(selectedCourse.name)}`}
                          >
                            Open in Responsi tab &rarr;
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-center text-xs text-muted-foreground"
                          asChild
                        >
                          <Link
                            to={`/education?tab=responsi&course=${encodeURIComponent(selectedCourse.name)}&action=create`}
                          >
                            <Plus className="mr-1 size-3.5" /> Create Responsi
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Study Clubs Card */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Study Clubs
                          </span>
                          <CalendarDays
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                          />
                        </div>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                          --
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Scheduled peer sessions
                        </p>
                      </div>
                      <div className="mt-4 border-t border-border pt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full justify-center text-xs font-semibold"
                          asChild
                        >
                          <Link to="/education?tab=study-clubs">
                            View Study Clubs &rarr;
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* Videos Card */}
                    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Videos
                          </span>
                          <CirclePlay
                            aria-hidden="true"
                            className="size-4 text-muted-foreground"
                          />
                        </div>
                        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                          --
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Recorded tutorials
                        </p>
                      </div>
                      <div className="mt-4 border-t border-border pt-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full justify-center text-xs font-semibold"
                          asChild
                        >
                          <Link to="/education?tab=videos">
                            View Videos &rarr;
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </section>
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
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingCourse ? "Edit course" : "Add course"}
            </SheetTitle>
            <SheetDescription>
              {editingCourse
                ? "Update the course name, syllabus code, or brief summary."
                : "Add a course group to organize Responsi, Study Clubs, and Videos."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={saveCourse} className="mt-5 space-y-4">
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
                placeholder="e.g. COMP6047001"
              />
            </div>

            <div>
              <Label htmlFor="course-description" className="mb-1.5">
                Brief summary / Syllabus overview
              </Label>
              <textarea
                id="course-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Overview of topics and concepts covered in this course..."
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving || !name.trim()}>
                {isSaving
                  ? "Saving..."
                  : editingCourse
                    ? "Save changes"
                    : "Add course"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </Container>
  );
};

export default CourseGroupsTab;
