import { Search } from "lucide-react";
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
  onPrevious: () => void;
  onNext: () => void;
};

const PaginationFooter = ({
  label,
  page,
  totalPages,
  onPrevious,
  onNext,
}: PaginationFooterProps) => (
  <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
    <p className="text-sm text-muted-foreground">{label}</p>
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={onPrevious}>
        Previous
      </Button>
      <span className="px-2 text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  </div>
);

export { EmptyState, PaginationFooter, SearchField };
