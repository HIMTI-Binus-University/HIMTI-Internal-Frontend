/* eslint-disable react-refresh/only-export-components -- provider and hook form one small notification API. */
import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Notification = {
  id: number;
  message: string;
  variant: "success" | "error";
};
type Notify = (message: string, variant?: Notification["variant"]) => void;

const NotificationContext = createContext<Notify>(() => undefined);

export function backendMessage(cause: unknown, fallback: string) {
  if (!axios.isAxiosError(cause)) return fallback;
  const data: unknown = cause.response?.data;
  if (!data || typeof data !== "object" || !("message" in data))
    return fallback;
  const message = data.message;
  return typeof message === "string" && message.trim()
    ? message.trim().slice(0, 300)
    : fallback;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);
  useEffect(() => {
    if (!notification) return;
    const timer = window.setTimeout(() => setNotification(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notification]);
  const notify: Notify = (message, variant = "success") =>
    setNotification({ id: Date.now(), message, variant });
  return (
    <NotificationContext.Provider value={notify}>
      {children}
      {notification && (
        <div
          key={notification.id}
          role={notification.variant === "error" ? "alert" : "status"}
          aria-live={notification.variant === "error" ? "assertive" : "polite"}
          className={`fixed right-4 top-4 z-[100] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border px-4 py-3 shadow-lg sm:max-w-md ${notification.variant === "success" ? "border-semantic-success-border bg-semantic-success-background text-semantic-success" : "border-semantic-danger-border bg-semantic-danger-background text-semantic-danger"}`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="-mr-2 -mt-2 h-8 w-8 shrink-0"
            aria-label="Dismiss notification"
            onClick={() => setNotification(null)}
          >
            <X />
          </Button>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
