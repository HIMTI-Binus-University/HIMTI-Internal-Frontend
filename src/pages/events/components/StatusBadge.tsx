import { Badge } from "@/components/ui/badge";
import type { EventStatus, SubeventStatus } from "@/types/events";

const statusVariants = {
  PUBLISHED: "info",
  OPEN: "success",
  DRAFT: "neutral",
  CLOSED: "warning",
  CANCELLED: "danger",
} as const satisfies Record<
  EventStatus | SubeventStatus,
  "info" | "success" | "neutral" | "warning" | "danger"
>;

interface StatusBadgeProps {
  status: EventStatus | SubeventStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge variant={statusVariants[status]} className="w-fit">
    {status}
  </Badge>
);
