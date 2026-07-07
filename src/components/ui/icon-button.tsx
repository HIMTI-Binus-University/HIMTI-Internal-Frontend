import * as React from "react";

import { cn } from "@/lib/utils";

type IconButtonTone = "neutral" | "primary" | "danger";
type IconButtonSize = "sm" | "default";

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string;
  tone?: IconButtonTone;
  size?: IconButtonSize;
}

const toneClasses: Record<IconButtonTone, string> = {
  neutral:
    "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80",
  primary:
    "text-primary hover:bg-primary/10 hover:text-primary active:bg-primary/15",
  danger:
    "text-danger hover:bg-danger-background hover:text-danger active:bg-danger-background/80",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  default: "h-9 w-9",
};

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      children,
      className,
      label,
      tone = "neutral",
      size = "default",
      title,
      type = "button",
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:stroke-[1.75]",
        toneClasses[tone],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);

IconButton.displayName = "IconButton";

export { IconButton };
export type { IconButtonProps };
