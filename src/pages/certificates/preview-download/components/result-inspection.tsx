import { ClipboardCheck } from "lucide-react";

import { ContainerSection } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FitSummary } from "../../utils/fitName";

interface ResultInspectionProps {
  summary: FitSummary;
  /** Names that do not fit even at the smallest size. */
  reviewCount: number;
  onReviewNext: () => void;
}

type Tone = "neutral" | "warning" | "danger";

const toneClass: Record<Tone, string> = {
  neutral: "text-foreground",
  warning: "text-semantic-warning",
  danger: "text-semantic-danger",
};

const Row = ({
  label,
  hint,
  value,
  tone = "neutral",
}: {
  label: string;
  hint?: string;
  value: number;
  tone?: Tone;
}) => (
  <div className="flex items-baseline justify-between gap-3 py-2 text-sm" title={hint}>
    <dt className="text-foreground">{label}</dt>
    <dd
      className={cn(
        "shrink-0 font-semibold tabular-nums",
        // Only highlight a row when it has something to look at.
        value > 0 ? toneClass[tone] : "text-muted-foreground",
      )}
    >
      {value}
    </dd>
  </div>
);

const ResultInspection = ({ summary, reviewCount, onReviewNext }: ResultInspectionProps) => (
  <ContainerSection
    icon={ClipboardCheck}
    title="Result inspection"
    description={`${summary.total} ready to export`}
    compact
    className="lg:h-auto lg:min-h-[10rem] lg:flex-1"
    bodyClassName="py-1"
    actions={
      reviewCount > 0 ? (
        <Button variant="outline" size="sm" onClick={onReviewNext}>
          Review next
        </Button>
      ) : undefined
    }
  >
    {/* Rows that need attention come first, so they stay visible when space is tight. */}
    <dl className="divide-y divide-border">
      <Row
        label="Needs review"
        hint="Does not fit even at the smallest size."
        value={reviewCount}
        tone="danger"
      />
      <Row
        label="Using abbreviated name"
        hint="Shortened because shrinking was not enough."
        value={summary.abbreviated}
        tone="warning"
      />
      <Row
        label="Reached minimum size"
        hint="Fits, but only at the smallest allowed font."
        value={summary.atMinimum}
        tone="warning"
      />
      <Row label="Using smaller size" value={summary.smaller} />
      <Row label="Using full name" value={summary.full} />
    </dl>
  </ContainerSection>
);

export default ResultInspection;
