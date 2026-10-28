import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  Eye,
  FileText,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

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
import type { ResponsiStatus, ResponsiSummary } from "@/types/education";
import ResponsiWorkspace from "./responsi-workspace";

const ALL = "all";
const PAGE_SIZE = 6;
const DAY_MS = 86_400_000;

// shortcut: mock rows stand in until the education API ships.
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

const RESPONSI_ROWS: ResponsiSummary[] = [
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
  Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));

const toSelectItems = (values: string[], allLabel: string) => [
  { value: ALL, label: allLabel },
  ...values.map((value) => ({ value, label: value })),
];

const formatLastUpdated = (value: string) => {
  const date = new Date(value);

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
  <nav aria-label="Responsi pagination" className="flex items-center gap-1.5">
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
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState(ALL);
  const [periodFilter, setPeriodFilter] = useState(ALL);
  const [examTypeFilter, setExamTypeFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [page, setPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState<ResponsiSummary | null>(null);

  const courseOptions = uniqueValues(RESPONSI_ROWS.map((row) => row.course));
  const periodOptions = uniqueValues(
    RESPONSI_ROWS.map((row) => row.academicPeriod),
  ).reverse();

  const courseItems = toSelectItems(courseOptions, "All Courses");
  const periodItems = toSelectItems(periodOptions, "All Academic Periods");
  const examTypeItems = toSelectItems(
    uniqueValues(RESPONSI_ROWS.map((row) => row.examType)),
    "All Exam Types",
  );
  const statusItems = toSelectItems(
    uniqueValues(RESPONSI_ROWS.map((row) => row.status)),
    "All Status",
  ).map((item) => ({
    ...item,
    label:
      item.value === ALL
        ? item.label
        : RESPONSI_STATUS_META[item.value as ResponsiStatus].label,
  }));

  const keyword = search.trim().toLowerCase();
  const filteredRows = RESPONSI_ROWS.filter((row) => {
    const matchesKeyword =
      !keyword ||
      [row.title, row.course, row.pic].some((value) =>
        value.toLowerCase().includes(keyword),
      );

    return (
      matchesKeyword &&
      (courseFilter === ALL || row.course === courseFilter) &&
      (periodFilter === ALL || row.academicPeriod === periodFilter) &&
      (examTypeFilter === ALL || row.examType === examTypeFilter) &&
      (statusFilter === ALL || row.status === statusFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const firstRow = (currentPage - 1) * PAGE_SIZE;
  const visibleRows = filteredRows.slice(firstRow, firstRow + PAGE_SIZE);
  const lastRow = Math.min(firstRow + PAGE_SIZE, filteredRows.length);

  const resetFilters = () => {
    setSearch("");
    setCourseFilter(ALL);
    setPeriodFilter(ALL);
    setExamTypeFilter(ALL);
    setStatusFilter(ALL);
    setPage(1);
  };

  const createDraft = () => {
    setSelectedRow({
      id: `draft-${Date.now()}`,
      title: "Untitled Responsi",
      course: courseOptions[0] ?? "",
      academicPeriod: periodOptions[0] ?? "",
      examType: "Mid Exam",
      pic: "Unassigned",
      status: "DRAFT",
      lastUpdated: new Date().toISOString(),
    });
  };

  if (selectedRow) {
    return (
      <ResponsiWorkspace
        summary={selectedRow}
        courseOptions={courseOptions}
        periodOptions={periodOptions}
        onClose={() => setSelectedRow(null)}
      />
    );
  }

  return (
    <Container className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold leading-7 tracking-tight text-foreground">
            Responsi
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and manage Responsi summaries.
          </p>
        </div>
        <Button size="sm" className="sm:shrink-0" onClick={createDraft}>
          <Plus />
          Create Responsi
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <label className="sr-only" htmlFor="responsi-search">
            Search Responsi
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
          items={courseItems}
          value={courseFilter}
          onValueChange={(value) => {
            setCourseFilter(value ?? ALL);
            setPage(1);
          }}
        >
          <SelectTrigger aria-label="Filter by course" className="lg:w-[160px]">
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
            className="lg:w-[176px]"
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
            className="lg:w-[160px]"
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
          <SelectTrigger aria-label="Filter by status" className="lg:w-[140px]">
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

        <Button
          variant="outline"
          className="lg:w-[84px]"
          onClick={resetFilters}
        >
          Reset
        </Button>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border">
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[980px] text-left">
            <caption className="sr-only">
              Responsi summaries with course, academic period, exam type, PIC,
              status, last updated, and actions
            </caption>
            <thead className="sticky top-0 z-10 bg-muted">
              <tr className="text-xs text-muted-foreground">
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Title
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Course
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Academic Period
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Exam Type
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  PIC
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Last Updated
                </th>
                <th scope="col" className="px-4 py-2.5 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleRows.length ? (
                visibleRows.map((row) => {
                  const updatedAt = formatLastUpdated(row.lastUpdated);

                  return (
                    <tr
                      key={row.id}
                      className="cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedRow(row)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-semantic-info-background text-primary">
                            <FileText aria-hidden="true" className="size-4" />
                          </span>
                          <button
                            type="button"
                            className="text-left text-sm font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedRow(row);
                            }}
                          >
                            {row.title}
                          </button>
                        </div>
                      </td>
                      <td className="max-w-[170px] px-4 py-3 text-sm text-muted-foreground">
                        {row.course}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {row.academicPeriod}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {row.examType}
                      </td>
                      <td className="max-w-[170px] px-4 py-3 text-sm leading-5 text-muted-foreground">
                        {row.pic}
                      </td>
                      <td className="px-4 py-3">
                        <ResponsiStatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs leading-5 text-muted-foreground">
                        <span className="block">{updatedAt.date}</span>
                        <span className="block">{updatedAt.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <IconButton
                            label={`Preview ${row.title}`}
                            tone="primary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedRow(row);
                            }}
                          >
                            <Eye />
                          </IconButton>
                          <IconButton
                            label={`Edit ${row.title}`}
                            tone="primary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedRow(row);
                            }}
                          >
                            <Pencil />
                          </IconButton>
                          <IconButton
                            label={`More actions for ${row.title}`}
                            size="sm"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <EllipsisVertical />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-muted-foreground"
                  >
                    No Responsi matches these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-none flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredRows.length ? firstRow + 1 : 0}-{lastRow} of{" "}
          {filteredRows.length} results
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
