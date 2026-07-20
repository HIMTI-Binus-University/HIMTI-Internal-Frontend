import { Badge } from "@/components/ui/badge";
import type { BundleStatus, EventStatus, FormStatus, FormSubmissionStatus, PaymentStatus, RegistrationStatus, SubeventStatus, TicketStatus } from "@/types/events";

type Status = EventStatus | SubeventStatus | TicketStatus | FormStatus | FormSubmissionStatus | PaymentStatus | RegistrationStatus | BundleStatus;
const variants: Record<Status, "neutral" | "info" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral", UPCOMING: "info", OPEN: "success", CLOSED: "warning", ARCHIVED: "neutral",
  SUBMITTED: "info", PENDING_REVIEW: "warning", REQUIRES_CORRECTION: "danger", CONFIRMED: "success", REJECTED: "danger", CANCELLED: "danger", NOT_REQUIRED: "neutral", AWAITING_UPLOAD: "warning", APPROVED: "success", WAITING_FOR_MEMBERS: "warning", PENDING_VALIDATION: "warning",
};
export const StatusBadge = ({ status }: { status: Status }) => <Badge variant={variants[status]} className="w-fit">{status.replace(/_/g, " ")}</Badge>;
