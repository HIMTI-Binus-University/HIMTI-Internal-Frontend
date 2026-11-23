import { useId, useState } from "react";
import type { ReactNode } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

const clamp = (value: number, min?: number, max?: number) => {
  let next = value;
  if (min !== undefined) next = Math.max(min, next);
  if (max !== undefined) next = Math.min(max, next);
  return next;
};

/**
 * A number input you can actually type in. While typing, the text is kept as
 * typed (so clearing the field does not snap it to 0); valid in-range values
 * apply live, and on blur the value is clamped into range or reverted.
 */
export const NumberField = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  className,
}: NumberFieldProps) => {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);

  const commitDraft = () => {
    if (draft === null) return;
    const parsed = Number(draft);
    if (draft.trim() !== "" && Number.isFinite(parsed)) {
      onChange(clamp(parsed, min, max));
    }
    setDraft(null);
  };

  return (
    <div className={className}>
      <Label htmlFor={id} className="text-xs">
        {label}
        {suffix && <span className="text-muted-foreground"> ({suffix})</span>}
      </Label>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={draft ?? String(value)}
        onChange={(event) => {
          const text = event.target.value;
          setDraft(text);

          const parsed = Number(text);
          const inRange =
            text.trim() !== "" &&
            Number.isFinite(parsed) &&
            (min === undefined || parsed >= min) &&
            (max === undefined || parsed <= max);
          if (inRange) onChange(parsed);
        }}
        onBlur={commitDraft}
        onKeyDown={(event) => {
          if (event.key === "Enter") commitDraft();
        }}
        className="mt-1"
      />
    </div>
  );
};

interface CheckboxRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const CheckboxRow = ({ label, checked, onChange, hint }: CheckboxRowProps) => {
  const id = useId();

  return (
    <div className="flex items-start gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(next) => onChange(next === true)}
        className="mt-0.5"
      />
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-normal leading-5">
          {label}
        </Label>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
};

export const SettingsGroup = ({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn("border-t border-border pt-5 first:border-t-0 first:pt-0", className)}>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    <div className="mt-3 space-y-3">{children}</div>
  </section>
);
