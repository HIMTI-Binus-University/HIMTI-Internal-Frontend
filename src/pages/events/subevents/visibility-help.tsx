import { CircleAlert } from "lucide-react";

export const VisibilityLabel = () => (
  <span className="inline-flex items-center gap-1.5">
    Visibility
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label="Explain visibility options"
        className="rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CircleAlert className="h-4 w-4" />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 hidden w-72 space-y-2 rounded-lg border bg-popover p-3 text-left text-xs font-normal text-popover-foreground shadow-lg group-hover:block group-focus-within:block"
      >
        <span className="block">
          <strong>Public</strong> appears in public listings. Registration
          requires a verified Google account.
        </span>
        <span className="block">
          <strong>HIMTI members only</strong> appears to signed-in users with
          current HIMTI membership. Registration requires an active membership
          record for the current period.
        </span>
        <span className="block">
          <strong>Invite only</strong> is hidden from event listings.
          Registration requires an invitation.
        </span>
      </span>
    </span>
  </span>
);
