import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WizardFooterProps {
  onBack?: () => void;
  backDisabled?: boolean;
  nextLabel?: string;
  onNext?: () => void;
  nextDisabled?: boolean;
  /** Why the next button is disabled, or any other hint for this step. */
  hint?: ReactNode;
}

/**
 * Bottom action row shared by every step. It is a normal row at the end of
 * the page layout (not pinned to the window): on large screens the page does
 * not scroll, so it is always in view; on phones it follows the content.
 */
const WizardFooter = ({
  onBack,
  backDisabled,
  nextLabel,
  onNext,
  nextDisabled,
  hint,
}: WizardFooterProps) => (
  <div className="flex shrink-0 flex-col gap-3 rounded-xl border border-border bg-card px-5 py-3 sm:flex-row sm:items-center">
    {onBack && (
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        onClick={onBack}
        disabled={backDisabled}
      >
        <ArrowLeft aria-hidden="true" />
        Back
      </Button>
    )}

    <p className="min-w-0 flex-1 text-sm text-muted-foreground sm:text-right">
      {hint}
    </p>

    {onNext && nextLabel && (
      <Button
        className="w-full sm:w-auto"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel}
        <ArrowRight aria-hidden="true" />
      </Button>
    )}
  </div>
);

export default WizardFooter;
