import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type NoticeTone = "error" | "warning" | "success" | "info";

const toneStyles: Record<NoticeTone, { box: string; Icon: typeof Info }> = {
  error: {
    box: "border-semantic-danger-border bg-semantic-danger-background text-semantic-danger",
    Icon: AlertCircle,
  },
  warning: {
    box: "border-semantic-warning-border bg-semantic-warning-background text-semantic-warning",
    Icon: TriangleAlert,
  },
  success: {
    box: "border-semantic-success-border bg-semantic-success-background text-semantic-success",
    Icon: CheckCircle2,
  },
  info: {
    box: "border-semantic-info-border bg-semantic-info-background text-semantic-info",
    Icon: Info,
  },
};

interface InlineNoticeProps {
  tone: NoticeTone;
  children: ReactNode;
  /** Optional controls on the right (a button, a link). */
  action?: ReactNode;
  className?: string;
}

/** Inline status message. Errors are announced immediately, the rest politely. */
const InlineNotice = ({ tone, children, action, className }: InlineNoticeProps) => {
  const { box, Icon } = toneStyles[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm",
        box,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default InlineNotice;
