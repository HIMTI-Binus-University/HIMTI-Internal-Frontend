import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, CalendarClock, Check, Plus, Send, Ticket } from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/Utils";
import { dateTime, titleCase } from "@/components/events/helpers";
import { formatCurrency } from "@/data/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SetupStepper, Warning } from "../components";
import { canPublishSubevent, subeventPublishBlockers } from "../lifecycle";
import { useEventsStore } from "../store";
import type { PaymentSetting, Subevent, SubeventType, TicketOption, TicketType } from "@/types/events";

const steps = ["details", "registration", "payment", "review"] as const;
type Step = typeof steps[number];

const textarea = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const types: SubeventType[] = ["MAIN_EVENT", "WORKSHOP", "SEMINAR", "COMPETITION", "WELCOMING_PARTY", "DOMESTIC_STUDY_TOUR", "INTERNATIONAL_STUDY_TOUR", "COMPANY_VISIT", "OTHER"];
const defaults = (eventId: string): Subevent => ({ id: `subevent-${Date.now()}`, eventId, name: "", publicDescription: "", privateDescription: "", type: "OTHER", startsAt: "", endsAt: "", locationName: "", locationAddress: "", locationUrl: "", capacity: 100, maxTicketsPerUser: 1, registrationOpensAt: "", registrationClosesAt: "", editLockAt: "", autoConfirmWhenComplete: false, status: "DRAFT", createdAt: new Date().toISOString(), createdBy: "admin-1" });

export default function SubeventSetupPage() {
  const { eventId = "", step } = useParams();
  const navigate = useNavigate();
  const { data, saveSubevent, saveTicket, savePayment } = useEventsStore();
  const event = data.events.find((item) => item.id === eventId);
  const currentStep = steps.includes(step as Step) ? step as Step : "details";
  const index = steps.indexOf(currentStep);
  const [draft, setDraft] = useState(() => defaults(eventId));
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [payment, setPayment] = useState<PaymentSetting>({ id: `payment-${draft.id}`, subeventId: draft.id, isPaymentRequired: false, acceptedMimeTypes: ["image/jpeg", "image/png"], maximumFileSizeBytes: 5_000_000 });
  const ready = useMemo(() => {
    const values: number[] = [];
    if (draft.name && draft.startsAt && draft.endsAt && draft.capacity) values.push(0);
    if (draft.registrationOpensAt && draft.registrationClosesAt && tickets.length) values.push(1);
    if (!payment.isPaymentRequired || (payment.bankName && payment.accountName && payment.accountNumber && payment.proofDeadline)) values.push(2);
    return values;
  }, [draft, payment, tickets.length]);

  if (!event) return <Navigate to="/events" replace />;
  const path = (next: Step) => `/events/${event.id}/subevents/new/${next}`;
  if (!steps.includes(step as Step)) return <Navigate to={path("details")} replace />;

  const update = <K extends keyof Subevent>(key: K, value: Subevent[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateTicket = (ticketIndex: number, patch: Partial<TicketOption>) => setTickets((items) => items.map((item, itemIndex) => itemIndex === ticketIndex ? { ...item, ...patch } : item));
  const warnings = [!ready.includes(0) && "Complete the subevent details.", !ready.includes(1) && "Add registration dates and at least one ticket.", !ready.includes(2) && "Complete or disable payment setup."].filter(Boolean) as string[];
  const addTicket = () => setTickets((items) => [...items, { id: `ticket-${Date.now()}`, subeventId: draft.id, name: `Ticket ${items.length + 1}`, description: "", type: "INDIVIDUAL", price: 0, currency: "IDR", capacity: draft.capacity, status: "DRAFT" }]);
  const formCtx = { assignments: data.subeventForms.filter((item) => item.subeventId === draft.id), versions: data.formVersions, forms: data.forms };
  const save = (status: "DRAFT" | "PUBLISHED") => {
    const next = status === "PUBLISHED" && !canPublishSubevent(event, draft, formCtx) ? "DRAFT" : status;
    saveSubevent({ ...draft, status: next, updatedAt: new Date().toISOString(), updatedBy: "admin-1" });
    tickets.forEach((ticket) => saveTicket({ ...ticket, status: next === "PUBLISHED" ? "ACTIVE" : ticket.status }));
    savePayment(payment);
    navigate(`/events/${event.id}/subevents/${draft.id}/overview`);
  };
  const publishBlockers = subeventPublishBlockers(event, draft, formCtx);
  const canPublishNow = canPublishSubevent(event, draft, formCtx);
  const continueSetup = () => {
    setCompleted((items) => items.includes(index) ? items : [...items, index]);
    navigate(path(steps[index + 1]));
  };

  return (
    <PageLayout icon={CalendarClock} title="New subevent" breadcrumbs={["Tools", "Events", event.name, "New subevent"]}>
      <div className="mx-auto w-full max-w-5xl pb-28">
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight">New Subevent</h2>
              <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-semibold">Step {index + 1} of 4</span>
            </div>
            <SetupStepper active={index} completed={completed} />
          </CardContent>
        </Card>

        {currentStep === "details" && (
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Identity and descriptions</CardTitle></CardHeader>
              <CardContent className="space-y-5">
                <Field label="Subevent name *"><Input value={draft.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. TECHNO Greater Jakarta" /></Field>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Public description" helper="Shown to people before they are accepted."><textarea className={textarea} rows={5} value={draft.publicDescription} onChange={(event) => update("publicDescription", event.target.value)} /></Field>
                  <Field label="Private description" helper="Shown to participants after they are accepted."><textarea className={textarea} rows={5} value={draft.privateDescription} onChange={(event) => update("privateDescription", event.target.value)} /></Field>
                </div>
                <Field label="Subevent type"><Select items={types.map((type) => ({ value: type, label: titleCase(type) }))} value={draft.type} onValueChange={(value) => update("type", value as SubeventType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type} value={type}>{titleCase(type)}</SelectItem>)}</SelectContent></Select></Field>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Schedule, location, and participant limits</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <Field label="Starts at *"><Input type="datetime-local" value={draft.startsAt} onChange={(event) => update("startsAt", event.target.value)} /></Field>
                <Field label="Ends at *"><Input type="datetime-local" value={draft.endsAt} onChange={(event) => update("endsAt", event.target.value)} /></Field>
                <Field label="Venue or platform"><Input value={draft.locationName} onChange={(event) => update("locationName", event.target.value)} /></Field>
                <Field label="Physical address"><Input value={draft.locationAddress} onChange={(event) => update("locationAddress", event.target.value)} /></Field>
                <Field label="Map or meeting URL" className="md:col-span-2"><Input type="url" value={draft.locationUrl} onChange={(event) => update("locationUrl", event.target.value)} /></Field>
                <Field label="Capacity *"><Input type="number" min="1" value={draft.capacity} onChange={(event) => update("capacity", Number(event.target.value) || undefined)} /></Field>
                <Field label="Maximum tickets per participant"><Input type="number" min="1" value={draft.maxTicketsPerUser} onChange={(event) => update("maxTicketsPerUser", Number(event.target.value) || 1)} /></Field>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "registration" && (
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle>Registration rules</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <Field label="Registration opens *"><Input type="datetime-local" value={draft.registrationOpensAt} onChange={(event) => update("registrationOpensAt", event.target.value)} /></Field>
                <Field label="Registration closes *"><Input type="datetime-local" value={draft.registrationClosesAt} onChange={(event) => update("registrationClosesAt", event.target.value)} /></Field>
                <Field label="Answer editing locks"><Input type="datetime-local" value={draft.editLockAt} onChange={(event) => update("editLockAt", event.target.value)} /></Field>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4"><span><span className="block text-sm font-semibold">Automatic confirmation</span><span className="text-xs text-muted-foreground">Confirm only when all blocking requirements are complete.</span></span><Switch label="Automatic confirmation" checked={draft.autoConfirmWhenComplete} onCheckedChange={(checked) => update("autoConfirmWhenComplete", checked)} /></div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><CardTitle>Ticket options</CardTitle><p className="mt-1 text-sm text-muted-foreground">Ticket prices determine payment amounts.</p></div><Button size="sm" onClick={addTicket}><Plus />Add ticket</Button></div></CardHeader>
              <CardContent className="space-y-4">
                {tickets.length ? tickets.map((ticket, ticketIndex) => (
                  <section key={ticket.id} className="rounded-xl border border-border bg-muted/15 p-4 sm:p-5" aria-label={`Ticket ${ticketIndex + 1}`}>
                    <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4"><div><p className="text-sm font-semibold">{ticket.name || `Ticket ${ticketIndex + 1}`}</p><p className="mt-1 text-xs font-medium text-primary">{formatCurrency(ticket.price)}</p></div><Button variant="secondary" size="sm" onClick={() => setTickets((items) => items.filter((item) => item.id !== ticket.id))}>Remove</Button></div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Ticket name"><Input value={ticket.name} onChange={(event) => updateTicket(ticketIndex, { name: event.target.value })} /></Field>
                      <Field label="Type"><Select items={{ INDIVIDUAL: "Individual", BUNDLE: "Bundle" }} value={ticket.type} onValueChange={(value) => updateTicket(ticketIndex, { type: value as TicketType, bundleSize: value === "BUNDLE" ? 3 : undefined })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="INDIVIDUAL">Individual</SelectItem><SelectItem value="BUNDLE">Bundle</SelectItem></SelectContent></Select></Field>
                      <Field label="Price (IDR)"><Input type="number" min="0" value={ticket.price} onChange={(event) => updateTicket(ticketIndex, { price: Number(event.target.value) || 0 })} /></Field>
                      <Field label="Ticket capacity"><Input type="number" min="1" value={ticket.capacity} onChange={(event) => updateTicket(ticketIndex, { capacity: Number(event.target.value) || undefined })} /></Field>
                      {ticket.type === "BUNDLE" && <Field label="Required members"><Input type="number" min="2" value={ticket.bundleSize} onChange={(event) => updateTicket(ticketIndex, { bundleSize: Number(event.target.value) || 2 })} /></Field>}
                    </div>
                  </section>
                )) : <div className="rounded-xl border border-dashed p-8 text-center"><Ticket className="mx-auto text-muted-foreground" /><p className="mt-3 text-sm font-semibold">No tickets configured</p><p className="mt-1 text-xs text-muted-foreground">Add at least one ticket before publishing.</p></div>}
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === "payment" && (
          <Card>
            <CardHeader><CardTitle>Payment setup</CardTitle><p className="text-sm text-muted-foreground">Where and how participants pay. Ticket configuration controls the amount.</p></CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-4"><span><span className="block font-semibold">Payment required</span><span className="text-sm text-muted-foreground">Disable this for free subevents.</span></span><Switch label="Payment required" checked={payment.isPaymentRequired} onCheckedChange={(checked) => setPayment((current) => ({ ...current, isPaymentRequired: checked }))} /></div>
              {payment.isPaymentRequired && <div className="grid gap-5 md:grid-cols-2">
                <Field label="Bank or destination"><Input value={payment.bankName} onChange={(event) => setPayment((current) => ({ ...current, bankName: event.target.value }))} /></Field>
                <Field label="Account name"><Input value={payment.accountName} onChange={(event) => setPayment((current) => ({ ...current, accountName: event.target.value }))} /></Field>
                <Field label="Account number"><Input value={payment.accountNumber} onChange={(event) => setPayment((current) => ({ ...current, accountNumber: event.target.value }))} /></Field>
                <Field label="Proof deadline"><Input type="datetime-local" value={payment.proofDeadline} onChange={(event) => setPayment((current) => ({ ...current, proofDeadline: event.target.value }))} /></Field>
                <Field label="Payment instructions" className="md:col-span-2"><textarea className={textarea} rows={4} value={payment.paymentInstructions} onChange={(event) => setPayment((current) => ({ ...current, paymentInstructions: event.target.value }))} /></Field>
              </div>}
            </CardContent>
          </Card>
        )}

        {currentStep === "review" && (
          <Card>
            <CardHeader>
              <CardTitle>Review summary</CardTitle>
              <p className="text-sm text-muted-foreground">Check every setting before publishing this subevent.</p>
            </CardHeader>
            <CardContent className="space-y-0">
              <section className="border-b border-border pb-5">
                <h3 className="mb-3 text-sm font-semibold">Publication readiness</h3>
                <div className="space-y-2">
                  {warnings.length ? warnings.map((warning) => <Warning key={warning}>{warning}</Warning>) : <div className="flex gap-2 rounded-lg border border-semantic-success-border bg-semantic-success-background p-3 text-sm text-semantic-success"><Check className="h-4 w-4" />Ready to publish</div>}
                </div>
              </section>

              <ReviewSection title="Details and descriptions" editTo={path("details")}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Summary label="Name"><p className="text-sm font-semibold">{draft.name || "Not set"}</p></Summary>
                  <Summary label="Type"><p className="text-sm">{titleCase(draft.type)}</p></Summary>
                  <Summary label="Public description"><p className="text-sm leading-6">{draft.publicDescription || "Not provided"}</p></Summary>
                  <Summary label="Private description"><p className="text-sm leading-6">{draft.privateDescription || "Not provided"}</p></Summary>
                </div>
              </ReviewSection>

              <ReviewSection title="Schedule, location, and limits" editTo={path("details")}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Summary label="Schedule"><p className="text-sm">{dateTime(draft.startsAt)} → {dateTime(draft.endsAt)}</p></Summary>
                  <Summary label="Venue"><p className="text-sm">{draft.locationName || "Not provided"}</p><p className="text-xs text-muted-foreground">{draft.locationAddress || "No address"}</p></Summary>
                  <Summary label="Map or meeting URL"><p className="break-all text-sm">{draft.locationUrl || "Not provided"}</p></Summary>
                  <Summary label="Capacity"><p className="text-sm">{draft.capacity ?? "Not set"}</p></Summary>
                  <Summary label="Tickets per participant"><p className="text-sm">{draft.maxTicketsPerUser}</p></Summary>
                </div>
              </ReviewSection>

              <ReviewSection title="Registration rules" editTo={path("registration")}>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Summary label="Registration period"><p className="text-sm">{dateTime(draft.registrationOpensAt)} → {dateTime(draft.registrationClosesAt)}</p></Summary>
                  <Summary label="Answer editing locks"><p className="text-sm">{dateTime(draft.editLockAt)}</p></Summary>
                  <Summary label="Automatic confirmation"><p className="text-sm">{draft.autoConfirmWhenComplete ? "Enabled" : "Disabled"}</p></Summary>
                </div>
              </ReviewSection>

              <ReviewSection title={`Tickets (${tickets.length})`} editTo={path("registration")}>
                {tickets.length ? <div className="grid gap-3 sm:grid-cols-2">{tickets.map((ticket) => <div key={ticket.id} className="rounded-lg border border-border bg-muted/20 p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{ticket.name || "Untitled ticket"}</p><p className="text-sm font-semibold text-primary">{formatCurrency(ticket.price)}</p></div><p className="mt-1 text-xs text-muted-foreground">{titleCase(ticket.type)} · capacity {ticket.capacity ?? "unlimited"}{ticket.type === "BUNDLE" ? ` · ${ticket.bundleSize ?? 2} members` : ""}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No tickets configured.</p>}
              </ReviewSection>

              <ReviewSection title="Payment" editTo={path("payment")} last>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Summary label="Requirement"><p className="text-sm">{payment.isPaymentRequired ? "Payment required" : "No payment required"}</p></Summary>
                  {payment.isPaymentRequired && <><Summary label="Destination"><p className="text-sm">{payment.bankName || "Not provided"}</p><p className="text-xs text-muted-foreground">{payment.accountName || "No account name"} · {payment.accountNumber || "No account number"}</p></Summary><Summary label="Proof deadline"><p className="text-sm">{dateTime(payment.proofDeadline)}</p></Summary><Summary label="Instructions"><p className="text-sm leading-6">{payment.paymentInstructions || "Not provided"}</p></Summary></>}
                </div>
              </ReviewSection>
            </CardContent>
          </Card>
        )}

      </div>

      {createPortal(
        <div className="fixed inset-x-0 bottom-4 z-30 px-4 sm:px-6 lg:left-[272px]">
          <div className="mx-auto w-full max-w-5xl">
            <div data-testid="subevent-setup-actions" className="flex w-full flex-col-reverse gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <Button variant="secondary" asChild><Link to={index === 0 ? `/events/${event.id}` : path(steps[index - 1])}><ArrowLeft />{index === 0 ? "Cancel" : "Previous"}</Link></Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => save("DRAFT")}>Save as draft</Button>
                {index < steps.length - 1 ? <Button onClick={continueSetup}>Continue<ArrowRight /></Button> : <Button disabled={warnings.length > 0 || !canPublishNow} title={publishBlockers.join(". ") || undefined} onClick={() => save("PUBLISHED")}><Send />Publish subevent</Button>}
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </PageLayout>
  );
}

const Field = ({ label, helper, className, children }: { label: string; helper?: string; className?: string; children: React.ReactNode }) => <label className={`block space-y-2 ${className ?? ""}`}><span className="block text-sm font-semibold">{label}</span>{helper && <span className="block text-xs leading-5 text-muted-foreground">{helper}</span>}{children}</label>;
const Summary = ({ label, children }: { label: string; children: React.ReactNode }) => <div><p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>{children}</div>;
const ReviewSection = ({ title, editTo, last = false, children }: { title: string; editTo: string; last?: boolean; children: React.ReactNode }) => <section className={last ? "pt-5" : "border-b border-border py-5"}><div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-base font-semibold">{title}</h3><Button variant="ghost" size="sm" asChild><Link to={editTo}>Edit</Link></Button></div>{children}</section>;
