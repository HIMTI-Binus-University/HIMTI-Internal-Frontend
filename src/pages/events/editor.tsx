import { useEffect, useState, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { CalendarDays, ImagePlus } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  useCreateEvent,
  useGetEvents,
  useUpdateEvent,
} from "@/api/events/queries";
import { PageLayout } from "@/components/Utils";
import { ImagePreview } from "@/components/events/ImagePreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeHttpUrlInput } from "@/utils/http-url";
import { normalizeOptionalEventUrl } from "./event-form";

const field =
  "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const apiError = (error: unknown) =>
  (error as AxiosError<{ message?: string; msg?: string }>).response?.data
    ?.message ??
  (error as AxiosError<{ msg?: string }>).response?.data?.msg ??
  "Failed to save event.";

export default function EventEditorPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const eventsQuery = useGetEvents();
  const existing = eventsQuery.data?.data.find((event) => event.id === eventId);
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const [cover, setCover] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => setCover(existing?.coverImageUrl ?? ""),
    [existing?.coverImageUrl],
  );

  if (eventId && !eventsQuery.isLoading && !existing)
    return <Navigate to="/events" replace />;
  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    const values = new FormData(formEvent.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    if (!name) return setError("Event name is required.");
    let coverImageUrl: string | null;
    try {
      coverImageUrl = normalizeOptionalEventUrl(cover, "cover");
    } catch {
      return setError(
        "Enter a valid cover link such as example.com/image.jpg. Only HTTP and HTTPS links are allowed.",
      );
    }
    const payload = {
      name,
      publicDescription: String(values.get("description") ?? "").trim(),
      coverImageUrl,
    };
    const options = {
      onSuccess: (saved: { id: string }) => navigate(`/events/${saved.id}`),
      onError: (failure: unknown) => setError(apiError(failure)),
    };
    if (existing) updateEvent.mutate({ id: existing.id, ...payload }, options);
    else createEvent.mutate(payload, options);
  };
  const pending = createEvent.isPending || updateEvent.isPending;

  return (
    <PageLayout
      icon={ImagePlus}
      title={existing ? "Edit event" : "Create event"}
      breadcrumbs={["Tools", "Events", existing ? existing.name : "Create"]}
      backTo={existing ? `/events/${existing.id}` : "/events"}
    >
      <form
        className="mx-auto max-w-4xl space-y-5"
        onSubmit={submit}
        onChange={() => setError("")}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {existing ? "Edit event" : "Create new event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">
                Event name <span className="text-semantic-danger">*</span>
              </span>
              <Input
                name="name"
                defaultValue={existing?.name}
                placeholder="e.g. TECHNO 2027"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Public description</span>
              <textarea
                name="description"
                defaultValue={existing?.publicDescription ?? ""}
                rows={5}
                className={field}
                placeholder="Explain the event in language participants will understand."
              />
            </label>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImagePlus className="h-5 w-5 text-primary" />
              Cover image
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Cover image URL</span>
              <Input
                name="coverImageUrl"
                type="text"
                inputMode="url"
                value={cover}
                onChange={(event) => setCover(event.target.value)}
                placeholder="images.example.com/event.jpg"
              />
              <span className="block text-xs text-muted-foreground">
                Optional. Schemeless HTTP links are accepted.
              </span>
            </label>
            <ImagePreview
              src={
                cover.trim()
                  ? (() => {
                      try {
                        return normalizeHttpUrlInput(cover);
                      } catch {
                        return null;
                      }
                    })()
                  : null
              }
              alt="Cover preview"
              className="h-28 w-full rounded-xl border border-border"
            />
          </CardContent>
        </Card>
        {error && (
          <p role="alert" className="text-sm text-semantic-danger">
            {error}
          </p>
        )}
        <div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(existing ? `/events/${existing.id}` : "/events")
            }
          >
            Cancel
          </Button>
          <Button disabled={pending}>
            {pending ? "Saving..." : "Save event"}
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
