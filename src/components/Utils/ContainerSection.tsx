import { useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import Container from "./Container";

interface ContainerSectionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Controls shown on the right of the header (buttons, zoom, selectors). */
  actions?: ReactNode;
  /** Pinned to the bottom of the container, outside the scrolling body. */
  footer?: ReactNode;
  bodyClassName?: string;
  /** Tighter header, body and footer spacing, for small panels beside a main one. */
  compact?: boolean;
}

/**
 * A bordered panel with a header that stays put inside the panel while only
 * the body scrolls. On `lg+` the panel fills the height its parent gives it
 * (the parent must be a height-constrained flex/grid item); below `lg` it
 * grows with its content and the page scrolls instead, so phones never get
 * nested scrollbars.
 */
const ContainerSection = ({
  title,
  description,
  icon: Icon,
  actions,
  footer,
  className,
  bodyClassName,
  compact = false,
  children,
  ...props
}: ContainerSectionProps) => {
  const headingId = useId();

  return (
    <Container
      padding="none"
      role="region"
      aria-labelledby={headingId}
      className={cn("flex flex-col lg:h-full lg:min-h-0", className)}
      {...props}
    >
      <header
        className={cn(
          "flex shrink-0 flex-wrap items-center gap-x-4 gap-y-3 border-b border-border",
          compact ? "px-4 py-3" : "px-5 py-4",
        )}
      >
        {Icon && (
          <span
            className={cn(
              "flex shrink-0 items-center justify-center rounded-xl bg-semantic-info-background text-primary",
              compact ? "size-8" : "size-10",
            )}
          >
            <Icon aria-hidden="true" className={compact ? "size-4" : "size-5"} />
          </span>
        )}
        <div className="min-w-0 flex-1 basis-40">
          <h2
            id={headingId}
            className={cn(
              "font-semibold tracking-tight text-foreground",
              compact ? "text-base leading-6" : "text-lg leading-7",
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </header>

      <div
        className={cn(
          compact ? "p-4" : "p-5",
          "lg:min-h-0 lg:flex-1 lg:overflow-y-auto",
          bodyClassName,
        )}
      >
        {children}
      </div>

      {footer && (
        <footer
          className={cn(
            "shrink-0 border-t border-border",
            compact ? "px-4 py-2.5" : "px-5 py-3",
          )}
        >
          {footer}
        </footer>
      )}
    </Container>
  );
};

export default ContainerSection;
