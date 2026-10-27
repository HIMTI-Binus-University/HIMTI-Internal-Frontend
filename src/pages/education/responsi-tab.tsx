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

import { Container } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
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

const STATUS_META: Record<
  ResponsiStatus,
  {
    label: string;
    variant: "success" | "warning" | "neutral" | "danger";
  }
> = {
  PUBLISHED: { label: "Published", variant: "success" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  DRAFT: { label: "Draft", variant: "neutral" },
  ARCHIVED: { label: "Archived", variant: "danger" },
};

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

const StatusBadge = ({ status }: { status: ResponsiStatus }) => {
  const meta = STATUS_META[status];

  return (
    <Badge
      variant={meta.variant}
      className="gap-1.5 rounded-md px-2.5 py-1 font-medium"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
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
      className="size-9"
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
          className="size-9"
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
      className="size-9"
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

  const courseItems = toSelectItems(
    uniqueValues(RESPONSI_ROWS.map((row) => row.course)),
    "All Courses",
  );
  const periodItems = toSelectItems(
    uniqueValues(RESPONSI_ROWS.map((row) => row.academicPeriod)).reverse(),
    "All Academic Periods",
  );
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
        : STATUS_META[item.value as ResponsiStatus].label,
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

  return (
    <Container className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-ds-h3 font-bold tracking-tight text-foreground">
            Responsi
          </h2>
          <p className="mt-1 text-ds-body text-muted-foreground">
            Create, edit, and manage Responsi summaries.
          </p>
        </div>
        {/* shortcut: row actions and editor panels arrive with the Responsi workspace. */}
        <Button className="sm:shrink-0">
          <Plus />
          Create Responsi
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[220px] flex-1">
          <label className="sr-only" htmlFor="responsi-search">
            Search Responsi
          </label>
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-[18px] -translate-y-1/2 stroke-[1.75] text-muted-foreground"
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
            className="h-11 pl-10"
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
          <SelectTrigger
            aria-label="Filter by course"
            className="h-11 lg:w-[168px]"
          >
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
            className="h-11 lg:w-[186px]"
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
            className="h-11 lg:w-[170px]"
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
          <SelectTrigger
            aria-label="Filter by status"
            className="h-11 lg:w-[150px]"
          >
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
          className="h-11 lg:w-[88px]"
          onClick={resetFilters}
        >
          Reset
        </Button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left">
            <caption className="sr-only">
              Responsi summaries with course, academic period, exam type, PIC,
              status, last updated, and actions
            </caption>
            <thead className="bg-muted/60">
              <tr className="text-ds-subtle-medium text-muted-foreground">
                <th scope="col" className="px-4 py-3 font-medium">
                  Title
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Course
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Academic Period
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Exam Type
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  PIC
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Last Updated
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
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
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-semantic-info-background text-primary">
                            <FileText aria-hidden="true" className="size-5" />
                          </span>
                          <span className="text-ds-body-medium font-semibold text-foreground">
                            {row.title}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[170px] px-4 py-4 text-ds-body text-muted-foreground">
                        {row.course}
                      </td>
                      <td className="px-4 py-4 text-ds-body text-muted-foreground">
                        {row.academicPeriod}
                      </td>
                      <td className="px-4 py-4 text-ds-body text-muted-foreground">
                        {row.examType}
                      </td>
                      <td className="max-w-[170px] px-4 py-4 text-ds-body leading-6 text-muted-foreground">
                        {row.pic}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-4 text-ds-subtle text-muted-foreground">
                        <span className="block">{updatedAt.date}</span>
                        <span className="block">{updatedAt.time}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <IconButton
                            label={`Preview ${row.title}`}
                            tone="primary"
                            size="sm"
                          >
                            <Eye />
                          </IconButton>
                          <IconButton
                            label={`Edit ${row.title}`}
                            tone="primary"
                            size="sm"
                          >
                            <Pencil />
                          </IconButton>
                          <IconButton
                            label={`More actions for ${row.title}`}
                            size="sm"
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
                    className="px-4 py-10 text-center text-ds-body text-muted-foreground"
                  >
                    No Responsi matches these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-ds-body text-muted-foreground">
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
