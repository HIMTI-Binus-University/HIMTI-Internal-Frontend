import * as React from "react";

import { cn } from "@/lib/utils";

interface SwitchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "aria-checked" | "onChange" | "onClick" | "role"
  > {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, disabled, label, onCheckedChange, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="block h-5 w-5 translate-x-0 rounded-full bg-card shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-5"
        data-state={checked ? "checked" : "unchecked"}
      />
    </button>
  ),
);

Switch.displayName = "Switch";

export { Switch };
export type { SwitchProps };
