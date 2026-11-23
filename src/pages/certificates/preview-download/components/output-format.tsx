import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { ContainerSection } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import InlineNotice from "../../components/InlineNotice";

export interface OutputOption {
  id: string;
  label: string;
  /** Short name used on the selector. */
  shortLabel: string;
  description?: string;
}

interface OutputFormatProps {
  options: OutputOption[];
  onDownload: (optionId: string) => void;
  isGenerating: boolean;
  totalCertificates: number;
  progress: { current: number; total: number };
  /** Outcome of the last export, shown under the button. */
  result: { tone: "success" | "error"; message: string } | null;
  /** Number of names flagged for review, shown as a heads-up before exporting. */
  reviewCount: number;
}

const OutputFormat = ({
  options,
  onDownload,
  isGenerating,
  totalCertificates,
  progress,
  result,
  reviewCount,
}: OutputFormatProps) => {
  const [selected, setSelected] = useState(options[0]?.id ?? "png-zip");
  const selectedOption = options.find((option) => option.id === selected);
  const percent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <ContainerSection
      icon={Download}
      title="Output format"
      compact
      className="lg:h-auto lg:shrink-0"
      footer={
        <div className="flex flex-col gap-2.5">
          {isGenerating && (
            <div>
              <div className="mb-1.5 flex justify-between text-sm text-muted-foreground">
                <span>Generating certificates…</span>
                <span className="tabular-nums">
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label="Generating certificates"
                aria-valuemin={0}
                aria-valuemax={progress.total}
                aria-valuenow={progress.current}
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          )}

          {result && <InlineNotice tone={result.tone}>{result.message}</InlineNotice>}

          {!isGenerating && !result && reviewCount > 0 && (
            <p className="text-xs text-semantic-warning">
              {reviewCount} {reviewCount === 1 ? "name needs" : "names need"} review (smallest size used).
            </p>
          )}

          <Button
            className="w-full"
            disabled={isGenerating || totalCertificates === 0}
            onClick={() => onDownload(selected)}
          >
            {isGenerating ? (
              <Loader2 aria-hidden="true" className="animate-spin" />
            ) : (
              <Download aria-hidden="true" />
            )}
            {isGenerating
              ? "Generating…"
              : `Generate ${totalCertificates} certificate${totalCertificates === 1 ? "" : "s"}`}
          </Button>
        </div>
      }
    >
      <fieldset disabled={isGenerating} className="min-w-0">
        <legend className="sr-only">Output format</legend>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {options.map((option) => {
            const isSelected = selected === option.id;

            return (
              <label
                key={option.id}
                className={cn(
                  "flex min-h-9 cursor-pointer items-center justify-center rounded-md px-2 text-center text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-ring",
                  isSelected
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                  isGenerating && "cursor-not-allowed opacity-60",
                )}
              >
                <input
                  type="radio"
                  name="output-format"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setSelected(option.id)}
                  className="sr-only"
                />
                {option.shortLabel}
              </label>
            );
          })}
        </div>

        {selectedOption && (
          <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
            {selectedOption.description ?? selectedOption.label}
          </p>
        )}
      </fieldset>
    </ContainerSection>
  );
};

export default OutputFormat;
