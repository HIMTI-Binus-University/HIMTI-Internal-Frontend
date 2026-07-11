import type { ReactNode } from "react";
import { ChevronRight, FileText, MapPin, Pencil, Trash2, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import type { Event, Subevent } from "@/types/events";
import { formatEventDate, formatSubeventType } from "@/utils/events";

import { StatusBadge } from "./StatusBadge";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (value: string | null) => (value ? formatEventDate(value) : "Not updated");

const Detail = ({ label, value }: { label: string; value: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </dt>
    <dd className="mt-1 text-sm leading-5 text-foreground">{value}</dd>
  </div>
);

interface SubeventDetailsDialogProps {
  event: Event;
  subevent: Subevent;
}

export const SubeventDetailsDialog = ({ event, subevent }: SubeventDetailsDialogProps) => {
  const navigate = useNavigate();
  const registrationForm = subevent.registrationForms[0];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <IconButton label={`View details for ${subevent.name}`}>
          <ChevronRight />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] max-w-3xl overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="sticky top-0 z-10 border-b border-border bg-muted/95 px-5 py-5 backdrop-blur-sm sm:px-6">
          <DialogTitle>{subevent.name}</DialogTitle>
          <DialogDescription className="pt-2">Part of {event.name}</DialogDescription>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={subevent.status} />
            <span className="rounded-md border border-border bg-card px-2 py-0.5 text-xs font-semibold text-foreground">
              {subevent.visibility.replace("_", " ")}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 pt-3">
            <Button type="button" variant="secondary" size="sm">
              <FileText />
              Registration
            </Button>
            <Button type="button" variant="secondary" size="sm">
              <UsersRound />
              Participants
            </Button>
            <Button
              type="button"
              variant="edit"
              size="sm"
              onClick={() => navigate(`/events/${event.id}/subevents/${subevent.id}/edit`)}
            >
              <Pencil />
              Edit
            </Button>
            <Button type="button" variant="delete" size="sm">
              <Trash2 />
              Delete
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-5 py-5 sm:px-6">
          <section aria-labelledby="subevent-overview-heading">
            <h3 id="subevent-overview-heading" className="text-sm font-semibold text-foreground">
              Overview
            </h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-3">
              <Detail label="Type" value={formatSubeventType(subevent.type)} />
              <Detail label="Date and time" value={formatEventDate(subevent.date)} />
              <Detail
                label="Parent event"
                value={<span className="font-medium">{event.name}</span>}
              />
            </dl>
          </section>

          <section aria-labelledby="subevent-description-heading" className="border-t border-border pt-5">
            <h3 id="subevent-description-heading" className="text-sm font-semibold text-foreground">
              Participant information
            </h3>
            <div className="mt-3 grid gap-5 sm:grid-cols-2">
              <Detail label="Public description" value={subevent.publicDescription ?? "Not provided"} />
              <Detail label="Private description" value={subevent.privateDescription ?? "Not provided"} />
            </div>
          </section>

          <section aria-labelledby="subevent-location-heading" className="border-t border-border pt-5">
            <h3 id="subevent-location-heading" className="text-sm font-semibold text-foreground">
              Location
            </h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              <Detail
                label="Address"
                value={
                  subevent.locationName ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
                      {subevent.locationName}
                    </span>
                  ) : (
                    "Not provided"
                  )
                }
              />
              <Detail
                label="Directions"
                value={
                  subevent.locationUrl ? (
                    <a
                      href={subevent.locationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Open map
                    </a>
                  ) : (
                    "Not provided"
                  )
                }
              />
            </dl>
          </section>

          <section aria-labelledby="subevent-registration-heading" className="border-t border-border pt-5">
            <h3 id="subevent-registration-heading" className="text-sm font-semibold text-foreground">
              Registration
            </h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-3">
              <Detail label="Registration" value={subevent.isRegistrationOpen ? "Open" : "Closed"} />
              <Detail
                label="Approval"
                value={subevent.autoAcceptRegistration ? "Automatic" : "Manual"}
              />
              <Detail
                label="Capacity"
                value={subevent.maxParticipants ? `${subevent.participantCount} / ${subevent.maxParticipants}` : `${subevent.participantCount} registered`}
              />
              <Detail
                label="Tickets per user"
                value={subevent.maxTicketsPerUser ?? "No limit"}
              />
              <Detail label="Submitted responses" value={subevent.submittedResponseCount} />
            </dl>
          </section>

          <section aria-labelledby="subevent-payment-heading" className="border-t border-border pt-5">
            <h3 id="subevent-payment-heading" className="text-sm font-semibold text-foreground">
              Payment
            </h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-3">
              <Detail label="Price" value={formatCurrency(subevent.price)} />
              <Detail label="Payment required" value={subevent.paid ? "Yes" : "No"} />
              {subevent.paid && (
                <>
                  <Detail label="Bank" value={subevent.paymentAccountBank || "Not provided"} />
                  <Detail label="Account name" value={subevent.paymentAccountName ?? "Not provided"} />
                  <Detail label="Account number" value={subevent.paymentAccountNumber ?? "Not provided"} />
                  <Detail label="Price modifier" value={subevent.priceModifier ?? "None"} />
                  <Detail label="Payment instructions" value={subevent.paymentDesc || "Not provided"} />
                </>
              )}
            </dl>
          </section>

          <section aria-labelledby="subevent-registration-form-heading" className="border-t border-border pt-5">
            <h3 id="subevent-registration-form-heading" className="text-sm font-semibold text-foreground">
              Registration form
            </h3>
            {registrationForm ? (
              <dl className="mt-3 grid gap-5 sm:grid-cols-2">
                <Detail label="Status" value={registrationForm.status.toLowerCase()} />
                <Detail label="Questions" value={registrationForm.questionCount} />
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No registration form has been configured.</p>
            )}
          </section>

          <section aria-labelledby="subevent-audit-heading" className="border-t border-border pt-5">
            <h3 id="subevent-audit-heading" className="text-sm font-semibold text-foreground">
              Record details
            </h3>
            <dl className="mt-3 grid gap-5 sm:grid-cols-2">
              <Detail label="Created" value={`${formatDate(subevent.createdAt)} by ${subevent.createdBy}`} />
              <Detail
                label="Last updated"
                value={`${formatDate(subevent.updatedAt)}${subevent.updatedBy ? ` by ${subevent.updatedBy}` : ""}`}
              />
            </dl>
          </section>
        </div>

      </DialogContent>
    </Dialog>
  );
};
