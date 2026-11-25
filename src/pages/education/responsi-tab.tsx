import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { useGetCourseGroups, useGetResponsies } from "@/api/education/queries";
import { RESPONSI_STATUS_META } from "@/components/education/responsi-status";
import { ResponsiStatusBadge } from "@/components/education/ResponsiStatusBadge";
import { Container } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ResponsiStatus,
  ResponsiSummary,
  SummaryType,
} from "@/types/education";
import { EducationTable, EducationTableAction } from "./education-table";

const ALL = "all";
const PAGE_SIZE = 6;
const DAY_MS = 86_400_000;

const DEFAULT_COURSES = [
  "Algorithm & Programming",
  "Calculus",
  "Database Systems",
  "Computer Architecture",
  "Operating Systems",
  "Computer Networks",
];

const DEFAULT_PERIODS = ["2026/2027", "2025/2026", "2024/2025", "2023/2024"];

const CURRENT_RESPONSI: ResponsiSummary[] = [
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
    id: "limits-and-continuity",
    title: "Limits and Continuity",
    course: "Calculus",
    academicPeriod: "2026/2027",
    examType: "Mid Exam",
    pic: "Abyan Ikram Muhammad",
    status: "PUBLISHED",
    lastUpdated: "2026-10-22T11:30:00Z",
  },
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
];

const ARCHIVE_PERIODS = [
  { period: "2025/2026", daysAgo: 365 },
  { period: "2024/2025", daysAgo: 730 },
  { period: "2023/2024", daysAgo: 1_095 },
];

const FALLBACK_RESPONSI_ROWS: ResponsiSummary[] = [
  ...CURRENT_RESPONSI,
  ...ARCHIVE_PERIODS.flatMap(({ period, daysAgo }) =>
    CURRENT_RESPONSI.map((row) => ({
      ...row,
      id: `${row.id}-${period}`,
      academicPeriod: period,
      status: "ARCHIVED" as const,
      lastUpdated: new Date(
        Date.parse(row.lastUpdated) - daysAgo * DAY_MS,
      ).toISOString(),
    })),
  ),
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Asia/Jakarta",
});

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
    left.localeCompare(right),
  );

const toSelectItems = (values: string[], allLabel: string) => [
  { value: ALL, label: allLabel },
  ...values.map((value) => ({ value, label: value })),
];

const formatLastUpdated = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { date: "-", time: "-" };
  }

  return {
    date: dateFormatter.format(date),
    time: `${timeFormatter.format(date).replace(":", ".")} WIB`,
  };
};

const Pagination = ({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => (
  <nav aria-label="Summaries pagination" className="flex items-center gap-1.5">
    <Button
      aria-label="Previous page"
      variant="outline"
      size="icon"
      className="size-8"
      disabled={page <= 1}
      onClick={() => onPageChange(page - 1)}
    >
      <ChevronLeft aria-hidden="true" />
    </Button>
    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
      (pageNumber) => (
        <Button
          key={pageNumber}
          aria-current={pageNumber === page ? "page" : undefined}
          aria-label={`Page ${pageNumber}`}
          variant={pageNumber === page ? "default" : "outline"}
          size="icon"
          className="size-8"
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Button>
      ),
    )}
    <Button
      aria-label="Next page"
      variant="outline"
      size="icon"
      className="size-8"
      disabled={page >= totalPages}
      onClick={() => onPageChange(page + 1)}
    >
      <ChevronRight aria-hidden="true" />
    </Button>
  </nav>
);

const ResponsiTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: dbCourses = [] } = useGetCourseGroups();

  const urlCourse = searchParams.get("course");
  const urlId = searchParams.get("id");
  const urlAction = searchParams.get("action");

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState(urlCourse || ALL);
  const [periodFilter, setPeriodFilter] = useState(ALL);
  const [examTypeFilter, setExamTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [summaryTypeFilter, setSummaryTypeFilter] = useState<
    SummaryType | typeof ALL
  >(ALL);
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      search: search.trim() || undefined,
      summaryType: summaryTypeFilter !== ALL ? summaryTypeFilter : undefined,
      course: courseFilter !== ALL ? courseFilter : undefined,
      academicPeriod: periodFilter !== ALL ? periodFilter : undefined,
      examType: examTypeFilter !== ALL ? examTypeFilter : undefined,
      status:
        statusFilter !== ALL ? (statusFilter as ResponsiStatus) : undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [
      search,
      courseFilter,
      periodFilter,
      examTypeFilter,
      statusFilter,
      summaryTypeFilter,
      page,
    ],
  );

  const {
    data: responsiResponse,
    isLoading,
    isError,
    refetch,
  } = useGetResponsies(queryParams);

  const courseOptions = useMemo(() => {
    const fromDb = dbCourses.map((course) => course.name);
    return uniqueValues([...DEFAULT_COURSES, ...fromDb]);
  }, [dbCourses]);

  const periodOptions = DEFAULT_PERIODS;

  const courseItems = toSelectItems(courseOptions, "All Courses");
  const summaryTypeItems = toSelectItems(
    ["Responsi", "Study Club"],
    "All Types",
  );
  const periodItems = toSelectItems(periodOptions, "All Academic Periods");
  const examTypeItems = toSelectItems(
    ["Mid Exam", "Final Exam"],
    "All Exam Types",
  );
  const statusItems = toSelectItems(
    ["DRAFT", "UNDER_REVIEW", "PUBLISHED", "ARCHIVED"],
    "All Status",
  ).map((item) => ({
    ...item,
    label:
      item.value === ALL
        ? item.label
        : RESPONSI_STATUS_META[item.value as ResponsiStatus]?.label ||
          item.value,
  }));

  // Fallback to client-side filtering if response data is undefined (e.g., initial or test mock fallback)
  const isServerDriven = Boolean(responsiResponse?.pagination);

  const keyword = search.trim().toLowerCase();
  const fallbackFilteredRows = FALLBACK_RESPONSI_ROWS.filter((row) => {
    const matchesKeyword =
      !keyword ||
      [row.title, row.course, row.pic].some((value) =>
        value.toLowerCase().includes(keyword),
      );

    return (
      matchesKeyword &&
      (summaryTypeFilter === ALL ||
        (row.summaryType ?? "Responsi") === summaryTypeFilter) &&
      (courseFilter === ALL || row.course === courseFilter) &&
      (periodFilter === ALL || row.academicPeriod === periodFilter) &&
      (examTypeFilter === ALL || row.examType === examTypeFilter) &&
      (statusFilter === ALL || row.status === statusFilter)
    );
  });

  const visibleRows: ResponsiSummary[] = isServerDriven
    ? (responsiResponse?.data ?? [])
    : fallbackFilteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalResults = isServerDriven
    ? (responsiResponse?.pagination.total ?? 0)
    : fallbackFilteredRows.length;

  const totalPages = isServerDriven
    ? Math.max(1, responsiResponse?.pagination.totalPages ?? 1)
    : Math.max(1, Math.ceil(fallbackFilteredRows.length / PAGE_SIZE));

  const currentPage = Math.min(page, totalPages);
  const firstRow = totalResults === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const lastRow = isServerDriven
    ? Math.min(currentPage * PAGE_SIZE, totalResults)
    : Math.min((currentPage - 1) * PAGE_SIZE + PAGE_SIZE, totalResults);

  const resetFilters = () => {
    setSearch("");
    setCourseFilter(ALL);
    setPeriodFilter(ALL);
    setExamTypeFilter(ALL);
    setStatusFilter(ALL);
    setSummaryTypeFilter(ALL);
    setPage(1);
    if (searchParams.has("course")) {
      const next = new URLSearchParams(searchParams);
      next.delete("course");
      setSearchParams(next, { replace: true });
    }
  };

  const editorUrl = (id: string, preview = false) => {
    const params = new URLSearchParams();
    if (courseFilter !== ALL) params.set("course", courseFilter);
    if (id === "new" && summaryTypeFilter !== ALL) params.set("type", summaryTypeFilter);
    if (preview) params.set("preview", "1");
    return `/education/summaries/${encodeURIComponent(id)}${params.size ? `?${params}` : ""}`;
  };

  if (urlId || urlAction === "create")
    return <Navigate to={editorUrl(urlId || "new")} replace />;

  return (
    <Container className="flex min-h-0 min-w-0 flex-1 flex-col gap-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-ds-h4 font-semibold tracking-tight text-foreground">
            Summaries
          </h2>
          <p className="mt-1 text-base text-muted-foreground">
            Create, edit, and manage Responsi and Study Club summaries.
          </p>
        </div>
        <Button size="sm" className="sm:shrink-0" asChild>
          <Link to={editorUrl("new")}><Plus /> Create summary</Link>
        </Button>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <label className="sr-only" htmlFor="responsi-search">
            Search summaries
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 stroke-[1.75] text-muted-foreground"
          />
          <Input
            id="responsi-search"
            type="text"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title, course, or keyword..."
            className="pl-9"
          />
        </div>

        <Select
          items={summaryTypeItems}
          value={summaryTypeFilter}
          onValueChange={(value) => {
            setSummaryTypeFilter(
              value === "Responsi" || value === "Study Club" ? value : ALL,
            );
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by summary type"
            className="lg:w-[144px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {summaryTypeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={courseItems}
          value={courseFilter}
          onValueChange={(value) => {
            setCourseFilter(value ?? ALL);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by course" className="lg:w-[152px]">
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
          items={periodItems}
          value={periodFilter}
          onValueChange={(value) => {
            setPeriodFilter(value ?? ALL);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by academic period"
            className="lg:w-[196px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={examTypeItems}
          value={examTypeFilter}
          onValueChange={(value) => {
            setExamTypeFilter(value ?? ALL);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label="Filter by exam type"
            className="lg:w-[148px]"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {examTypeItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value ?? ALL);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by status" className="lg:w-[128px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusItems.map((item) => (
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
          onClick={resetFilters}
        >
          <RotateCcw aria-hidden="true" />
        </IconButton>
      </div>

      <EducationTable
        caption="Responsi and Study Club summaries"
        columns={["Title", "Course", "Academic Period", "Exam Type", "PIC", "Status", "Last Updated", "Actions"]}
        state={
          isLoading ? (
            <p role="status">Loading summaries...</p>
          ) : isError ? (
            <>
              <p role="alert">Could not load summaries.</p>
              <EducationTableAction onClick={() => void refetch()}>Retry</EducationTableAction>
            </>
          ) : !visibleRows.length ? (
            <p>No summaries match these filters.</p>
          ) : null
        }
      >
              {!isLoading && !isError && visibleRows.map((row) => {
                  const updatedAt = formatLastUpdated(row.lastUpdated);

                  return (
                    <tr
                      key={row.id}
                       className="cursor-pointer"
                       onClick={() => navigate(editorUrl(row.id))}
                    >
                       <td className="min-w-48">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-semantic-info-background text-primary">
                            <FileText aria-hidden="true" className="size-4" />
                          </span>
                           <Link
                             to={editorUrl(row.id)}
                             className="min-h-11 break-words text-left text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                             onClick={(event) => event.stopPropagation()}
                          >
                            {row.title}
                           </Link>
                        </div>
                      </td>
                       <td className="min-w-32 text-muted-foreground">
                        {row.course}
                      </td>
                       <td className="text-muted-foreground">
                        {row.academicPeriod}
                      </td>
                       <td className="text-muted-foreground">
                        {row.examType}
                      </td>
                       <td className="min-w-32 leading-5 text-muted-foreground">
                        {row.pic}
                      </td>
                       <td>
                        <ResponsiStatusBadge status={row.status} />
                      </td>
                       <td className="whitespace-nowrap text-xs leading-5 text-muted-foreground">
                        <span className="block">{updatedAt.date}</span>
                        <span className="block">{updatedAt.time}</span>
                      </td>
                       <td>
                         <div className="flex items-center gap-2">
                           <EducationTableAction
                             aria-label={`Preview ${row.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                               navigate(editorUrl(row.id, true));
                            }}
                          >
                             <Eye aria-hidden="true" />
                           </EducationTableAction>
                           <EducationTableAction
                             aria-label={`Edit ${row.title}`}
                            onClick={(event) => {
                              event.stopPropagation();
                               navigate(editorUrl(row.id));
                            }}
                          >
                             <Pencil aria-hidden="true" />
                           </EducationTableAction>
                        </div>
                      </td>
                    </tr>
                  );
                })}
      </EducationTable>

      <div className="flex flex-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {firstRow}-{lastRow} of {totalResults} results
        </p>
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </Container>
  );
};

export default ResponsiTab;
