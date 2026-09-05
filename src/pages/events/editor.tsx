import { useState, type FormEvent } from "react";
import { CalendarDays } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  useCreateEvent,
  useGetEvent,
  useUpdateEvent,
} from "@/api/events/queries";
import { useEventGroups } from "@/api/event-groups/queries";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownTextarea } from "@/components/markdown-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventEditorPage() {
  const { eventId = "" } = useParams();
  const navigate = useNavigate();
  const detail = useGetEvent(eventId);
  const groups = useEventGroups();
  const create = useCreateEvent();
  const update = useUpdateEvent();
  const [groupId, setGroupId] = useState<string | null>();
  const [error, setError] = useState("");
  const existing = detail.data;
  const selectedGroupId = groupId ?? existing?.eventGroupId ?? "none";
  const selectedGroupName =
    selectedGroupId === "none"
      ? "No group"
      : (groups.data?.find((group) => group.id === selectedGroupId)?.name ??
        "Loading event group...");
  if (eventId && !detail.isLoading && !existing)
    return <Navigate to="/events" replace />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    if (name.length < 3)
      return setError("Event name must be at least 3 characters.");
    const startsAt = String(f.get("startsAt") || "");
    const endsAt = String(f.get("endsAt") || "");
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))
      return setError("End time must be after start time.");
    const body = {
      name,
      eventGroupId:
        groupId === "none" ? null : (groupId ?? existing?.eventGroupId),
      publicDescription: String(f.get("publicDescription") || "") || null,
      internalDescription: String(f.get("internalDescription") || "") || null,
      startsAt: startsAt ? new Date(startsAt).toISOString() : null,
      endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      locationName: String(f.get("locationName") || "") || null,
      locationAddress: String(f.get("locationAddress") || "") || null,
      coverImageUrl: String(f.get("coverImageUrl") || "") || null,
    };
    const options = {
      onSuccess: (saved: { id: string }) => navigate(`/events/${saved.id}`),
      onError: () => setError("Failed to save event."),
    };
    existing
      ? update.mutate({ id: existing.id, ...body }, options)
      : create.mutate(body, options);
  };
  if (eventId && detail.isLoading)
    return (
      <PageLayout icon={CalendarDays} title="Event">
        <p className="py-12 text-center">Loading...</p>
      </PageLayout>
    );
  const local = (value: string | null | undefined) =>
    value ? new Date(value).toISOString().slice(0, 16) : "";
  return (
    <PageLayout
      icon={CalendarDays}
      title={existing ? "Edit event" : "Create event"}
      backTo={existing ? `/events/${existing.id}` : "/events"}
    >
      <form className="mx-auto max-w-4xl space-y-5" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>Event details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Name *</span>
              <Input
                name="name"
                defaultValue={existing?.name}
                required
                minLength={3}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Event group</span>
              <Select value={selectedGroupId} onValueChange={setGroupId}>
                <SelectTrigger>
                  <SelectValue>{selectedGroupName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.data?.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Starts</span>
              <Input
                name="startsAt"
                type="datetime-local"
                defaultValue={local(existing?.startsAt)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Ends</span>
              <Input
                name="endsAt"
                type="datetime-local"
                defaultValue={local(existing?.endsAt)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Location</span>
              <Input
                name="locationName"
                defaultValue={existing?.locationName ?? ""}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Address</span>
              <Input
                name="locationAddress"
                defaultValue={existing?.locationAddress ?? ""}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Cover image URL</span>
              <Input
                name="coverImageUrl"
                type="url"
                defaultValue={existing?.coverImageUrl ?? ""}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Public description</span>
              <MarkdownTextarea
                name="publicDescription"
                defaultValue={existing?.publicDescription ?? ""}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Internal notes</span>
              <MarkdownTextarea
                name="internalDescription"
                defaultValue={existing?.internalDescription ?? ""}
              />
            </label>
          </CardContent>
        </Card>
        {error && (
          <p role="alert" className="text-sm text-semantic-danger">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button disabled={create.isPending || update.isPending}>
            Save event
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
