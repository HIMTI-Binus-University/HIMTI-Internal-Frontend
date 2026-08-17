import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { CalendarClock } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useCreateSubevent, useGetEvents } from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { ImagePreview } from "@/components/events/ImagePreview";
import { titleCase } from "@/components/events/helpers";
import { MarkdownTextarea } from "@/components/markdown-textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  RegistrationMode,
  SubeventType,
  SubeventVisibility,
} from "@/types/events";
import { normalizeHttpUrlInput } from "@/utils/http-url";
import { buildSubeventCreatePayload } from "./setup-payload";

const types: SubeventType[] = [
  "MAIN_EVENT",
  "WORKSHOP",
  "SEMINAR",
  "COMPETITION",
  "WELCOMING_PARTY",
  "DOMESTIC_STUDY_TOUR",
  "INTERNATIONAL_STUDY_TOUR",
  "COMPANY_VISIT",
  "OTHER",
];
const visibilities: SubeventVisibility[] = [
  "PUBLIC",
  "INTERNAL",
  "INVITE_ONLY",
];
const apiError = (error: unknown) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  "Failed to create subevent.";

export default function SubeventSetupPage() {
  const { eventId = "", step } = useParams();
  const navigate = useNavigate();
  const eventsQuery = useGetEvents();
  const event = eventsQuery.data?.data.find((item) => item.id === eventId);
  const createSubevent = useCreateSubevent(eventId);
  const [poster, setPoster] = useState("");
  const [error, setError] = useState("");
  const [registrationMode, setRegistrationMode] =
    useState<RegistrationMode>("INTERNAL");
  if (step !== "details")
    return <Navigate to={`/events/${eventId}/subevents/new/details`} replace />;
  if (!eventsQuery.isLoading && !event)
    return <Navigate to="/events" replace />;
  if (!event) return null;

  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const values = new FormData(formEvent.currentTarget);
    try {
      const payload = buildSubeventCreatePayload(values, eventId);
      createSubevent.mutate(payload, {
        onSuccess: (saved) =>
          navigate(
            `/events/${eventId}/subevents/${saved.id}/registration-setup`,
          ),
        onError: (failure) => setError(apiError(failure)),
      });
    } catch (failure) {
      setError((failure as Error).message);
    }
  };

  return (
    <PageLayout
      icon={CalendarClock}
      title="New subevent"
      breadcrumbs={["Tools", "Events", event.name, "New subevent"]}
      backTo={`/events/${eventId}`}
    >
      <form
        className="mx-auto max-w-5xl space-y-5"
        onSubmit={submit}
        onChange={() => setError("")}
      >
        <Card>
          <CardHeader>
            <CardTitle>Identity and member content</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Subevent name *" className="md:col-span-2">
              <Input name="name" placeholder="e.g. TECHNO Greater Jakarta" />
            </Field>
            <Field
              label="Public description"
              helper="Shown on the member-facing event card."
            >
              <MarkdownTextarea name="publicDescription" rows={5} />
            </Field>
            <Field
              label="Private description"
              helper="Only visible to the event management team."
            >
              <MarkdownTextarea name="privateDescription" rows={5} />
            </Field>
            <Field label="Type">
              <Select name="type" defaultValue="OTHER">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {titleCase(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Visibility">
              <Select name="visibility" defaultValue="PUBLIC">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilities.map((visibility) => (
                    <SelectItem key={visibility} value={visibility}>
                      {titleCase(visibility)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule and destination</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date *">
                <Input name="date" type="date" />
              </Field>
              <Field label="Time *">
                <Input name="time" type="time" />
              </Field>
            </div>
            <Field label="Venue or platform">
              <Input name="locationName" />
            </Field>
            <Field label="Map or meeting URL">
              <Input
                name="locationUrl"
                type="text"
                inputMode="url"
                placeholder="maps.google.com/..."
              />
            </Field>
            <Field label="Poster URL" className="md:col-span-2">
              <Input
                name="posterUrl"
                type="text"
                inputMode="url"
                value={poster}
                onChange={(change) => setPoster(change.target.value)}
                placeholder="images.example.com/poster.jpg"
              />
            </Field>
            <ImagePreview
              src={
                poster
                  ? (() => {
                      try {
                        return normalizeHttpUrlInput(poster);
                      } catch {
                        return null;
                      }
                    })()
                  : null
              }
              alt="Poster preview"
              className="h-44 w-full rounded-xl border md:col-span-2"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field
              label="Registration mode"
              helper="Visibility controls eligibility; mode controls where registration happens."
            >
              <Select
                name="registrationMode"
                value={registrationMode}
                onValueChange={(value) =>
                  setRegistrationMode(value as RegistrationMode)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTERNAL">
                    Internal - register on this site
                  </SelectItem>
                  <SelectItem value="EXTERNAL">
                    External - leave this site
                  </SelectItem>
                  <SelectItem value="DISABLED">
                    Disabled - no registration
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {registrationMode === "INTERNAL" && (
              <Field
                label="Approval mode"
                helper="Phase 5 provisions a free, one-seat native package."
              >
                <Select name="approvalMode" defaultValue="AUTO_APPROVE">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AUTO_APPROVE">Auto approve</SelectItem>
                    <SelectItem value="MANUAL_REVIEW">Manual review</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            {registrationMode === "EXTERNAL" && (
              <Field
                label="External destination *"
                helper="Participants leave this site to complete registration."
              >
                <Input
                  name="destinationUrl"
                  type="text"
                  inputMode="url"
                  placeholder="https://registration.example.com"
                  required
                />
              </Field>
            )}
            <Field label="Maximum participants">
              <Input name="maxParticipants" type="number" min="1" />
            </Field>
            <p className="text-sm text-muted-foreground md:col-span-2">
              The subevent is created as DRAFT with registration closed. Next,
              Registration Setup lets you change status to OPEN and enable
              registration.
            </p>
          </CardContent>
        </Card>
        {error && (
          <p role="alert" className="text-sm text-semantic-danger">
            {error}
          </p>
        )}
        <div className="sticky bottom-4 flex justify-end gap-2 rounded-xl border bg-card/95 p-3 shadow-lg backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(`/events/${eventId}`)}
          >
            Cancel
          </Button>
          <Button disabled={createSubevent.isPending}>
            {createSubevent.isPending ? "Creating..." : "Create draft"}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}

const Field = ({
  label,
  helper,
  className,
  children,
}: {
  label: string;
  helper?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`block space-y-2 ${className ?? ""}`}>
    <span className="block text-sm font-semibold">{label}</span>
    {helper && (
      <span className="block text-xs text-muted-foreground">{helper}</span>
    )}
    {children}
  </label>
);
