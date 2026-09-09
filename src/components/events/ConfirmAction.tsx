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

export function ConfirmAction({
  children,
  label,
  description,
  onConfirm,
  successMessage = `${label} succeeded.`,
  notify = true,
}: {
  children: ReactElement;
  label: string;
  description: string;
  onConfirm: () => unknown | Promise<unknown>;
  successMessage?: string;
  notify?: boolean;
}) {
  const showNotification = useNotification();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const running = useRef(false);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(value) => {
        if (running.current) return;
        setError("");
        setOpen(value);
      }}
    >
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{label}?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
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
