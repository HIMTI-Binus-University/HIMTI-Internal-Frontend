import type { ResponsiStatus } from "@/types/education";

export const RESPONSI_STATUS_META: Record<
  ResponsiStatus,
  {
    label: string;
    variant: "success" | "warning" | "neutral" | "danger";
  }
> = {
  PUBLISHED: { label: "Published", variant: "success" },
  UNDER_REVIEW: { label: "Under Review", variant: "warning" },
  DRAFT: { label: "Draft", variant: "neutral" },
  ARCHIVED: { label: "Archived", variant: "danger" },
};
