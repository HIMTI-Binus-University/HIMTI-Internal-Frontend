import { useEffect, useRef, useState, type FormEvent } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CheckCircle2, LogOut, Search, ScanLine } from "lucide-react";
import {
  useCheckInEventTicket,
  useCheckoutEventAttendance,
  useEventAttendance,
} from "@/api/event-registration/queries";
import { backendMessage, useNotification } from "@/components/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const time = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat("en-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not recorded";

export function EventAttendance({
  eventId,
  checkoutEnabled,
  canCheckIn,
  canView,
}: {
  eventId: string;
  checkoutEnabled: boolean;
  canCheckIn: boolean;
  canView: boolean;
}) {
  const [credential, setCredential] = useState("");
  const [search, setSearch] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls>();
  const roster = useEventAttendance(eventId, search, canView);
  const checkIn = useCheckInEventTicket(eventId);
  const checkout = useCheckoutEventAttendance(eventId);
  const notify = useNotification();
  useEffect(() => () => controls.current?.stop(), []);
  const toggleScanner = async () => {
    if (scanning) {
      controls.current?.stop();
      controls.current = undefined;
      setScanning(false);
      return;
    }
    setCameraError("");
    setScanning(true);
    try {
      controls.current = await new BrowserQRCodeReader().decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        video.current!,
        (result) => {
          if (!result) return;
          setCredential(result.getText());
          controls.current?.stop();
          controls.current = undefined;
          setScanning(false);
        },
      );
    } catch {
      setScanning(false);
      setCameraError(
        "Camera scanning is unavailable. Enter the ticket code manually.",
      );
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!credential.trim()) return;
    checkIn.mutate(
      { credential: credential.trim() },
      {
        onSuccess: () => {
          setCredential("");
          notify("Participant checked in.");
        },
        onError: (cause) =>
          notify(
            backendMessage(cause, "Ticket is invalid or already checked in."),
            "error",
          ),
      },
    );
  };
  return (
    <div className="grid gap-5">
      {canCheckIn && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScanLine className="h-5 w-5" /> Scan or enter ticket code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
              <label className="sr-only" htmlFor="ticket-credential">
                Ticket code
              </label>
              <Input
                id="ticket-credential"
                autoComplete="off"
                autoCapitalize="characters"
                value={credential}
                onChange={(event) => setCredential(event.target.value)}
                placeholder="Scan QR or enter secure code"
                className="min-h-11 font-mono uppercase"
              />
              <Button disabled={checkIn.isPending || !credential.trim()}>
                {checkIn.isPending ? "Checking..." : "Check in"}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              className="mt-3"
              onClick={() => void toggleScanner()}
            >
              <Camera /> {scanning ? "Stop camera" : "Scan with camera"}
            </Button>
            <video
              ref={video}
              aria-label="Ticket QR camera preview"
              className={`mt-3 aspect-video w-full max-w-lg rounded-xl bg-black object-cover ${scanning ? "block" : "hidden"}`}
              muted
              playsInline
            />
            {cameraError && (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {cameraError}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              USB and mobile scanners can type directly into this field. The
              credential is sent only in the request body.
            </p>
          </CardContent>
        </Card>
      )}
      {canView && (
        <Card>
          <CardHeader>
            <CardTitle>Participant attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="relative block">
              <span className="sr-only">Search participants</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, email, NIM, or order"
                className="min-h-11 pl-9"
              />
            </label>
            {roster.isLoading && (
              <p role="status" className="py-8 text-center text-sm">
                Loading participants...
              </p>
            )}
            {roster.isError && (
              <p
                role="alert"
                className="py-8 text-center text-sm text-destructive"
              >
                Attendance could not be loaded.
              </p>
            )}
            <ul
              className="mt-4 divide-y"
              aria-label="Confirmed participant attendance"
            >
              {roster.data?.data.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">
                      {item.name || "Confirmed participant"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.email || item.nim || item.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      In: {time(item.attendance?.checkedInAt)}
                      {item.attendance?.checkedOutAt
                        ? ` | Out: ${time(item.attendance.checkedOutAt)}`
                        : ""}
                    </p>
                  </div>
                  {!item.attendance && canCheckIn ? (
                    <Button
                      variant="outline"
                      disabled={checkIn.isPending}
                      onClick={() =>
                        checkIn.mutate(
                          { ticketId: item.id },
                          {
                            onSuccess: () => notify("Participant checked in."),
                            onError: (cause) =>
                              notify(
                                backendMessage(
                                  cause,
                                  "Could not check in participant.",
                                ),
                                "error",
                              ),
                          },
                        )
                      }
                    >
                      <CheckCircle2 /> Manual check-in
                    </Button>
                  ) : item.attendance &&
                    checkoutEnabled &&
                    !item.attendance.checkedOutAt ? (
                    <Button
                      variant="outline"
                      disabled={checkout.isPending}
                      onClick={() =>
                        checkout.mutate(
                          {
                            attendanceId: item.attendance!.id,
                            expectedRevision: item.attendance!.revision,
                          },
                          {
                            onSuccess: () => notify("Participant checked out."),
                            onError: (cause) =>
                              notify(
                                backendMessage(
                                  cause,
                                  "Could not check out participant.",
                                ),
                                "error",
                              ),
                          },
                        )
                      }
                    >
                      <LogOut /> Check out
                    </Button>
                  ) : (
                    <span className="text-sm font-semibold text-emerald-700">
                      {item.attendance?.checkedOutAt
                        ? "Checked out"
                        : item.attendance
                          ? "Checked in"
                          : "Not checked in"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {roster.data && !roster.data.data.length && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No confirmed participants match this search.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
