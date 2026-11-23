import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS, type WizardStep } from "./steps";

interface StepperProps {
  current: WizardStep;
  /** Highest step the user may jump to right now. */
  maxReachable: WizardStep;
  onSelect: (step: WizardStep) => void;
}

/** Three-segment step bar, styled like the Education tab bar. */
const Stepper = ({ current, maxReachable, onSelect }: StepperProps) => (
  <nav aria-label="Certificate generator steps">
    <ol className="grid grid-cols-3 gap-0 rounded-xl border border-border bg-card p-1">
      {WIZARD_STEPS.map(({ step, label }) => {
        const isCurrent = step === current;
        const isDone = step < current;
        const isLocked = step > maxReachable;

        return (
          <li key={step} className="min-w-0">
            <button
              type="button"
              aria-current={isCurrent ? "step" : undefined}
              disabled={isLocked}
              onClick={() => onSelect(step)}
              className={cn(
                "flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-4",
                isCurrent
                  ? "bg-semantic-info-background font-semibold text-primary"
                  : "text-foreground hover:bg-muted/60",
                isLocked && "cursor-not-allowed text-muted-foreground opacity-60 hover:bg-transparent",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isDone
                      ? "border-semantic-success-border bg-semantic-success-background text-semantic-success"
                      : "border-border text-muted-foreground",
                )}
              >
                {isDone ? <Check className="size-3.5" /> : step}
              </span>
              <span className="truncate">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Stepper;
