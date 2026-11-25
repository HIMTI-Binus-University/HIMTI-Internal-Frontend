import { forwardRef, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";

export function EducationTable({
  caption,
  columns,
  children,
  state,
}: {
  caption: string;
  columns: readonly string[];
  children?: ReactNode;
  state?: ReactNode;
}) {
  return (
    <div
      role="region"
      aria-label={caption}
      tabIndex={0}
      className="min-h-0 min-w-0 max-h-[55dvh] overflow-auto rounded-xl border border-border bg-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
    >
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-card">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap border-b border-border px-4 py-3 text-xs font-semibold text-foreground"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border [&>tr]:hover:bg-muted/30 [&>tr>td]:px-4 [&>tr>td]:py-3">
          {children}
        </tbody>
      </table>
      {state && (
        <div className="sticky left-0 space-y-3 px-4 py-8 text-center text-sm text-muted-foreground">
          {state}
        </div>
      )}
    </div>
  );
}

export const EducationTableAction = forwardRef<HTMLButtonElement, ButtonProps>(
  function EducationTableAction(props, ref) {
    return (
      <Button
        {...props}
        ref={ref}
        type="button"
        variant="outline"
        size="sm"
        className="min-h-11 min-w-11 whitespace-nowrap"
      />
    );
  },
);
