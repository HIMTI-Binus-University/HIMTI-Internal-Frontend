import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventStatus, SubeventStatus } from "@/types/events";

const statusStyles: Record<EventStatus | SubeventStatus, string> = {
  PUBLISHED: "border-blue-200 bg-blue-50 text-blue-700",
  OPEN: "border-green-200 bg-green-50 text-green-700",
  DRAFT: "border-slate-200 bg-slate-100 text-slate-700",
  CLOSED: "border-amber-200 bg-amber-50 text-amber-800",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
};

interface StatusBadgeProps {
  status: EventStatus | SubeventStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn("w-fit rounded-md font-semibold", statusStyles[status])}
  >
    {status}
  </Badge>
);
