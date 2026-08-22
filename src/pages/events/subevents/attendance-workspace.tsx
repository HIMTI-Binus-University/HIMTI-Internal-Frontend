import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  Camera,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Search,
  Undo2,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import {
  type AttendanceRecord,
  type CheckInResult,
  type ResolveResult,
  type TicketSearchResult,
  useAttendance,
  useCheckInTicket,
  useCorrectAttendance,
  useManualCheckIn,
  useResolveTicket,
  useTicketSearch,
} from "@/api/event-attendance/queries";
import { dateTime } from "@/components/events/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, StatCard } from "../components";
import {
  attendanceError,
  attendanceState,
  eligibilityCopy,
  normalizeCredential,
  resultCopy,
  ticketStatus,
} from "./attendance-utils";

export function AttendanceWorkspace({
  subeventId,
  checkoutEnabled,
}: {
  subeventId: string;
  checkoutEnabled: boolean;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const query = useAttendance(subeventId, page, search.trim());
  const counts = query.data?.counts;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Currently attending" value={counts?.currentlyCheckedIn ?? "-"} icon={Users} tone="success" />
        <StatCard label="Checked out" value={counts?.checkedOut ?? "-"} icon={LogOut} />
        <StatCard label="Cancelled check-ins" value={counts?.voided ?? "-"} icon={XCircle} />
        <StatCard label="All attendance records" value={counts?.totalRecords ?? "-"} icon={CheckCircle2} />
      </div>
      <CheckInPanel subeventId={subeventId} />
      <AttendanceList
        records={query.data?.data ?? []}
        loading={query.isLoading}
        error={query.isError ? attendanceError(query.error) : ""}
        search={search}
        setSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        page={page}
        pages={query.data?.meta.totalPages ?? 1}
        setPage={setPage}
        refresh={() => query.refetch()}
        checkoutEnabled={checkoutEnabled}
        subeventId={subeventId}
      />
    </div>
  );
}

function CheckInPanel({ subeventId }: { subeventId: string }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [credential, setCredential] = useState("");
  const [resolvedCredential, setResolvedCredential] = useState("");
  const [resolved, setResolved] = useState<ResolveResult | null>(null);
  const [selected, setSelected] = useState<TicketSearchResult | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [cameraError, setCameraError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls>();
  const resolving = useRef(false);
  const resolve = useResolveTicket(subeventId);
  const checkIn = useCheckInTicket(subeventId);
  const manualCheckIn = useManualCheckIn(subeventId);
  const tickets = useTicketSearch(subeventId, search.trim());

  const stopCamera = () => {
    controls.current?.stop();
    controls.current = undefined;
    if (video.current?.srcObject) {
      (video.current.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
    }
    setCameraOn(false);
  };

  const inspect = (raw: string) => {
    const value = normalizeCredential(raw);
    if (!value || resolving.current) return;
    resolving.current = true;
    setMessage("");
    setResolved(null);
    resolve.mutate(value, {
      onSuccess: (data) => {
        setResolved(data);
        setResolvedCredential(value);
        setCredential("");
        stopCamera();
      },
      onError: (error) => setMessage(attendanceError(error)),
      onSettled: () => {
        resolving.current = false;
      },
    });
  };

  const completed = (result: CheckInResult) => {
    setMessage(resultCopy(result));
    setResolved(null);
    setResolvedCredential("");
    setSelected(null);
  };

  useEffect(() => {
    if (!cameraOn || !video.current) return;
    let disposed = false;
    const reader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: 300,
    });
    reader
      .decodeFromVideoDevice(undefined, video.current, (scan) => {
        if (scan) inspect(scan.getText());
      })
      .then((value) => {
        if (disposed) value.stop();
        else controls.current = value;
      })
      .catch(() => {
        setCameraError(
          "The camera could not start. Allow camera access, or use the ticket code field instead.",
        );
        setCameraOn(false);
      });
    return () => {
      disposed = true;
      controls.current?.stop();
      controls.current = undefined;
    };
    // inspect uses refs to prevent repeated scans while a request is active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn]);

  useEffect(
    () => () => {
      controls.current?.stop();
      if (video.current?.srcObject) {
        (video.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    },
    [],
  );

  const submit = (event: FormEvent) => {
    event.preventDefault();
    inspect(credential);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Scan a ticket</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scanning only shows the participant and whether the ticket can be used. You must confirm Check in afterward.
          </p>
          {cameraOn ? (
            <div className="overflow-hidden rounded-xl border bg-black">
              <video ref={video} className="aspect-video w-full object-cover" muted playsInline aria-label="Ticket scanner camera" />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/30">
              <Camera className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <Button
            type="button"
            variant={cameraOn ? "secondary" : "default"}
            onClick={() => {
              if (cameraOn) stopCamera();
              else {
                setCameraError("");
                setCameraOn(true);
              }
            }}
          >
            <Camera />{cameraOn ? "Stop camera" : "Start camera"}
          </Button>
          {cameraError && <p role="alert" className="text-sm text-semantic-danger">{cameraError}</p>}
          <form onSubmit={submit} className="space-y-2 border-t pt-4">
            <label htmlFor="ticket-code" className="text-sm font-semibold">Ticket code fallback</label>
            <div className="flex gap-2">
              <Input id="ticket-code" value={credential} onChange={(event) => setCredential(event.target.value)} placeholder="Paste or type the ticket code" minLength={32} required />
              <Button disabled={resolve.isPending}>Review ticket</Button>
            </div>
          </form>
          {resolved && (
            <TicketReview ticket={resolved}>
              <Button
                disabled={!resolved.eligibility.eligible || checkIn.isPending}
                onClick={() =>
                  checkIn.mutate(resolvedCredential, {
                    onSuccess: completed,
                    onError: (error) => setMessage(attendanceError(error)),
                  })
                }
              >
                <CheckCircle2 />Check in
              </Button>
            </TicketReview>
          )}
          {message && <p role="status" className="rounded-lg border bg-muted/30 p-3 text-sm font-medium">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Find and check in manually</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Search by participant name, email, or order number, select the correct participant, then confirm Check in.</p>
          <label className="relative block">
            <span className="sr-only">Find a ticket</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" value={search} onChange={(event) => { setSearch(event.target.value); setSelected(null); }} placeholder="Enter at least 2 characters" />
          </label>
          {tickets.isFetching && <p className="text-sm text-muted-foreground">Searching...</p>}
          {tickets.isError && <p role="alert" className="text-sm text-semantic-danger">{attendanceError(tickets.error)}</p>}
          {search.trim().length >= 2 && !tickets.isFetching && tickets.data?.data.length === 0 && <p className="text-sm text-muted-foreground">No matching tickets found.</p>}
          <div className="space-y-2">
            {tickets.data?.data.map((ticket) => (
              <button
                type="button"
                key={ticket.ticketId}
                onClick={() => setSelected(ticket)}
                className="w-full rounded-lg border p-3 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div><p className="font-semibold">{ticket.participant.name}</p><p className="text-sm text-muted-foreground">{ticket.participant.email}</p><p className="text-xs text-muted-foreground">Order {ticket.orderNumber}</p></div>
                  <Badge variant={ticket.eligibility.eligible ? "success" : "secondary"}>{ticket.attendance ? attendanceState(ticket.attendance) : ticketStatus(ticket.status)}</Badge>
                </div>
              </button>
            ))}
          </div>
          {selected && (
            <TicketReview ticket={selected}>
              <Button
                disabled={!selected.eligibility.eligible || manualCheckIn.isPending}
                onClick={() =>
                  manualCheckIn.mutate(selected.ticketId, {
                    onSuccess: completed,
                    onError: (error) => setMessage(attendanceError(error)),
                  })
                }
              >
                <CheckCircle2 />Check in
              </Button>
            </TicketReview>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TicketReview({ ticket, children }: { ticket: ResolveResult | TicketSearchResult; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div><p className="font-semibold">{ticket.participant.name}</p><p className="text-sm text-muted-foreground">{ticket.participant.email}</p><p className="text-xs text-muted-foreground">Order {ticket.orderNumber}</p></div>
      <p className={ticket.eligibility.eligible ? "text-sm font-medium text-emerald-700" : "text-sm font-medium text-semantic-danger"}>{eligibilityCopy(ticket.eligibility)}</p>
      {ticket.eligibility.eligible && children}
    </div>
  );
}

function AttendanceList({ records, loading, error, search, setSearch, page, pages, setPage, refresh, checkoutEnabled, subeventId }: {
  records: AttendanceRecord[];
  loading: boolean;
  error: string;
  search: string;
  setSearch: (value: string) => void;
  page: number;
  pages: number;
  setPage: (page: number) => void;
  refresh: () => void;
  checkoutEnabled: boolean;
  subeventId: string;
}) {
  const correction = useCorrectAttendance(subeventId);
  const [actionError, setActionError] = useState("");
  const correct = (record: AttendanceRecord, action: "checkout" | "void") => {
    const reason = window.prompt(action === "checkout" ? "Why is this participant being checked out?" : "Why should this check-in be cancelled?");
    if (!reason) return;
    setActionError("");
    correction.mutate(
      { attendanceId: record.id, action, revision: record.revision, reason },
      { onError: (failure) => setActionError(attendanceError(failure)) },
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle>Attendance list</CardTitle><Button variant="secondary" size="sm" onClick={refresh}><RefreshCw />Refresh</Button></div></CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="px-4 sm:px-5"><Input aria-label="Search attendance" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search participant name or email" /></div>
        {(error || actionError) && <p role="alert" className="px-5 text-sm text-semantic-danger">{error || actionError}</p>}
        {loading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading attendance...</p>
        ) : records.length ? (
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-5 py-3">Checked in</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b"><td className="px-5 py-3">{dateTime(record.checkedInAt)}</td><td className="px-5 py-3">{attendanceState(record)}</td><td className="px-5 py-3"><div className="flex justify-end gap-2">{checkoutEnabled && !record.checkedOutAt && !record.voidedAt && <Button size="sm" variant="secondary" onClick={() => correct(record, "checkout")}><LogOut />Check out</Button>}{!record.voidedAt && <Button size="sm" variant="destructive" onClick={() => correct(record, "void")}><Undo2 />Cancel check-in</Button>}</div></td></tr>)}</tbody></table></div>
        ) : (
          <EmptyState title="No attendance records" description={search ? "No attendance records match this search." : "Checked-in participants will appear here."} />
        )}
        <div className="flex items-center justify-between px-5 pb-5 text-sm"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button><span>Page {page} of {Math.max(1, pages)}</span><Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button></div>
      </CardContent>
    </Card>
  );
}
