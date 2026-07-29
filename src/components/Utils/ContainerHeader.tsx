import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

const ContainerHeader = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn("mb-4 text-lg font-semibold leading-7 tracking-tight text-foreground", className)}
    {...props}
  />
);

export default ContainerHeader;
