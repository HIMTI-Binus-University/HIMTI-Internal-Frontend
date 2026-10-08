import { useRef, useState, type ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { backendMessage, useNotification } from "@/components/notification";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ConfirmAction({
  children,
  label,
  description,
  onConfirm,
  successMessage = `${label} succeeded.`,
  notify = true,
  confirmationText,
}: {
  children: ReactElement;
  label: string;
  description: string;
  onConfirm: () => unknown | Promise<unknown>;
  successMessage?: string;
  notify?: boolean;
  confirmationText?: string;
}) {
  const showNotification = useNotification();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const running = useRef(false);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (running.current) return;
        setError("");
        setConfirmation("");
        setOpen(value);
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmationText && (
          <div className="space-y-2">
            <Label htmlFor="confirm-action-text">
              Type <strong>{confirmationText}</strong> to confirm
            </Label>
            <Input
              id="confirm-action-text"
              autoComplete="off"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={
              pending ||
              Boolean(confirmationText && confirmation !== confirmationText)
            }
            onClick={async (event) => {
              event.preventDefault();
              if (running.current) return;
              running.current = true;
              setPending(true);
              setError("");
              try {
                await onConfirm();
                setOpen(false);
                if (notify) showNotification(successMessage);
              } catch (cause) {
                const message = backendMessage(
                  cause,
                  "Action failed. Please try again; refresh if the problem persists.",
                );
                setError(message);
                if (notify) showNotification(message, "error");
              } finally {
                running.current = false;
                setPending(false);
              }
            }}
          >
            {pending ? "Working..." : label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
