import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ContainerPadding = "default" | "compact" | "none";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  padding?: ContainerPadding;
}

const paddingClasses: Record<ContainerPadding, string> = {
  default: "p-5",
  compact: "p-4",
  none: "p-0",
};

const Container = ({
  children,
  className,
  padding = "default",
  ...props
}: ContainerProps) => (
  <div
    className={cn(
      "motion-enter rounded-xl border border-border bg-card text-card-foreground",
      paddingClasses[padding],
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

export default Container;
