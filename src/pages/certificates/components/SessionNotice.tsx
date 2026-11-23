import { Button } from "@/components/ui/button";
import { useCertificateStore } from "../store";
import { formatRemaining } from "../utils/sessionSnapshot";
import ConfirmDialog from "./ConfirmDialog";
import InlineNotice from "./InlineNotice";

/** Shown after a refresh brought back saved work, with a way to start over. */
const SessionNotice = () => {
  const { restoredAt, startOver, dismissRestored } = useCertificateStore();

  if (restoredAt === null) return null;

  return (
    <InlineNotice
      tone="info"
      className="items-center py-1.5"
      action={
        <div className="flex items-center gap-1">
          <ConfirmDialog
            trigger={
              <Button variant="ghost" size="sm" className="h-7 px-2">
                Start over
              </Button>
            }
            title="Start over?"
            description="Your template, names and style settings are removed, including the saved copy in this browser."
            confirmLabel="Start over"
            onConfirm={() => void startOver()}
          />
          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={dismissRestored}>
            Dismiss
          </Button>
        </div>
      }
    >
      Your previous work was restored. It is kept in this browser and deleted in{" "}
      {formatRemaining(restoredAt, Date.now())}.
    </InlineNotice>
  );
};

export default SessionNotice;
