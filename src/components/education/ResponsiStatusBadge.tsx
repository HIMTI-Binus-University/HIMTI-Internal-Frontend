import { RESPONSI_STATUS_META } from "@/components/education/responsi-status";
import { Badge } from "@/components/ui/badge";
import type { ResponsiStatus } from "@/types/education";

export const ResponsiStatusBadge = ({
  status,
}: {
  status: ResponsiStatus;
}) => {
  const meta = RESPONSI_STATUS_META[status];

  return (
    <Badge
      variant={meta.variant}
      className="w-fit gap-1.5 rounded-md px-2.5 py-0.5 font-medium"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  );
};
