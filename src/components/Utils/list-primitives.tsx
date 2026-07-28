import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const SearchField = ({
  id,
  label,
  placeholder,
  value,
  onChange,
  className,
}: SearchFieldProps) => (
  <div className={className ?? "relative mb-5 w-full"}>
    <label className="sr-only" htmlFor={id}>
      {label}
    </label>
    <Search
      aria-hidden="true"
      className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 stroke-[1.75] text-muted-foreground"
    />
    <Input
      id={id}
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="pl-10"
    />
  </div>
);

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

const EmptyState = ({ icon: Icon, title, description }: EmptyStateProps) => (
  <div className="rounded-xl border border-dashed border-border bg-muted/20 px-5 py-10 text-center">
    <Icon
      aria-hidden="true"
      className="mx-auto h-9 w-9 stroke-[1.5] text-muted-foreground"
    />
    <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
    {description && (
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
    )}
  </div>
);

type PaginationFooterProps = {
  label: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

const PaginationFooter = ({
  label,
  page,
  totalPages,
  onPageChange,
}: PaginationFooterProps) => {
  const pages = Array.from(
    new Set([
      1,
      ...Array.from({ length: 5 }, (_, index) => page - 2 + index),
      totalPages,
    ]),
  ).filter((value) => value >= 1 && value <= totalPages);

  return (
    <nav aria-label="Pagination" className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5" aria-label={`Page ${page} of ${totalPages}`}>
        <Button
          aria-label="First page"
          variant="secondary"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Previous page"
          variant="secondary"
          size="icon"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </Button>
        {pages.map((pageNumber, index) => (
          <span key={pageNumber} className="flex items-center">
            {index > 0 && pages[index - 1] !== pageNumber - 1 && (
              <span aria-hidden="true" className="px-1 text-muted-foreground">…</span>
            )}
            <Button
              aria-current={pageNumber === page ? "page" : undefined}
              aria-label={`Page ${pageNumber}`}
              variant={pageNumber === page ? "default" : "secondary"}
              size="icon"
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </Button>
          </span>
        ))}
        <Button
          aria-label="Next page"
          variant="secondary"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Last page"
          variant="secondary"
          size="icon"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export { EmptyState, PaginationFooter, SearchField };
