import { Badge } from "@/components/ui/badge";
import type { EventGroupStatus, EventStatus } from "@/types/events";

type Status = EventStatus | EventGroupStatus | "ACTIVE" | "INACTIVE";
const variants: Record<
  Status,
  "neutral" | "info" | "success" | "warning" | "danger"
> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  CLOSED: "warning",
  ARCHIVED: "neutral",
  CANCELLED: "danger",
  ACTIVE: "success",
  INACTIVE: "neutral",
};
export const StatusBadge = ({ status }: { status: Status }) => (
  <Badge variant={variants[status]} className="w-fit">
    {status.replace(/_/g, " ")}
  </Badge>
);
