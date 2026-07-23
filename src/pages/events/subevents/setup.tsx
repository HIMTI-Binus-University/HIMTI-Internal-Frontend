import { useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { CalendarClock } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { useCreateSubevent, useGetEvents } from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { ImagePreview } from "@/components/events/ImagePreview";
import { titleCase } from "@/components/events/helpers";
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
import { Switch } from "@/components/ui/switch";
import type { SubeventType, SubeventVisibility } from "@/types/events";
import { normalizeHttpUrlInput } from "@/utils/http-url";
import { combineEventDateTime, normalizeOptionalEventUrl } from "../event-form";

const textarea =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
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
  const [paid, setPaid] = useState(false);
  const [poster, setPoster] = useState("");
  const [error, setError] = useState("");
  if (step !== "details")
    return <Navigate to={`/events/${eventId}/subevents/new/details`} replace />;
  if (!eventsQuery.isLoading && !event)
    return <Navigate to="/events" replace />;
  if (!event) return null;

  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const values = new FormData(formEvent.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    if (!name) return setError("Subevent name is required.");
    try {
      const payload = {
        eventId,
        name,
        publicDescription: String(values.get("publicDescription") ?? "").trim(),
        privateDescription: String(
          values.get("privateDescription") ?? "",
        ).trim(),
        date: combineEventDateTime(values.get("date"), values.get("time")),
        type: String(values.get("type")) as SubeventType,
        locationName: String(values.get("locationName") ?? "").trim(),
        locationUrl: normalizeOptionalEventUrl(
          values.get("locationUrl"),
          "location",
        ),
        posterUrl: normalizeOptionalEventUrl(values.get("posterUrl"), "poster"),
        destinationUrl: normalizeOptionalEventUrl(
          values.get("destinationUrl"),
          "destination",
        ),
        price: Number(values.get("price")) || 0,
        paid,
        maxParticipants: Number(values.get("maxParticipants")) || undefined,
        maxTicketsPerUser: Number(values.get("maxTicketsPerUser")) || undefined,
        visibility: String(values.get("visibility")) as SubeventVisibility,
      };
      createSubevent.mutate(payload, {
        onSuccess: (saved) =>
          navigate(`/events/${eventId}/subevents/${saved.id}/overview`),
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
              <textarea
                name="publicDescription"
                rows={5}
                className={textarea}
              />
            </Field>
            <Field
              label="Private description"
              helper="Only visible to the event management team."
            >
              <textarea
                name="privateDescription"
                rows={5}
                className={textarea}
              />
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
            <Field
              label="Destination URL"
              helper="Optional action link opened from the event hub."
            >
              <Input
                name="destinationUrl"
                type="text"
                inputMode="url"
                placeholder="registration.example.com"
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
            <CardTitle>Required backend settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Price">
              <Input name="price" type="number" min="0" defaultValue="0" />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <span>
                <span className="block text-sm font-semibold">
                  Paid subevent
                </span>
                <span className="text-xs text-muted-foreground">
                  Enables backend payment handling.
                </span>
              </span>
              <Switch
                label="Paid subevent"
                checked={paid}
                onCheckedChange={setPaid}
              />
            </div>
            <Field label="Maximum participants">
              <Input name="maxParticipants" type="number" min="1" />
            </Field>
            <Field label="Maximum tickets per user">
              <Input
                name="maxTicketsPerUser"
                type="number"
                min="1"
                defaultValue="1"
              />
            </Field>
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
