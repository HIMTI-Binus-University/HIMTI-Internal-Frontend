import { useState, type FormEvent } from "react";
import { CalendarDays, ImagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEventsStore } from "./store";
import type { EventStatus } from "@/types/events";

const field = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
export default function EventEditorPage() {
  const { eventId } = useParams(); const navigate = useNavigate(); const { data, saveEvent } = useEventsStore(); const existing = data.events.find((event) => event.id === eventId); const isNew = !eventId; const locked = false; const [error, setError] = useState("");
  const submit = (formEvent: FormEvent<HTMLFormElement>) => {
    formEvent.preventDefault();
    if (locked) return;
    const values = new FormData(formEvent.currentTarget);
    const name = String(values.get("name") || "").trim();
    if (!name) { setError("Event name is required."); return; }
    const id = existing?.id ?? `event-${Date.now()}`;
    const status = (existing?.status ?? "DRAFT") as EventStatus;
    saveEvent({ id, name, publicDescription: String(values.get("description") || ""), coverImageUrl: String(values.get("coverImageUrl") || "") || undefined, status, createdAt: existing?.createdAt ?? new Date().toISOString(), createdBy: existing?.createdBy ?? "admin-1", updatedAt: new Date().toISOString(), updatedBy: "admin-1" });
    navigate(`/events/${id}`);
  };
  return <PageLayout icon={ImagePlus} title={isNew ? "Create event" : "Edit event"} breadcrumbs={["Tools", "Events", isNew ? "Create" : existing?.name ?? "Edit"]} backTo={existing ? `/events/${existing.id}` : "/events"}><form className="mx-auto max-w-4xl space-y-5" onSubmit={submit}>{locked && <p className="text-sm text-muted-foreground">Archived events are read-only. Change status from the workspace to unarchive.</p>}<Card><CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />{isNew ? "Create new event" : "Edit event"}</CardTitle></CardHeader><CardContent className="space-y-5"><fieldset disabled={locked} className="space-y-5"><label className="block space-y-2"><span className="text-sm font-semibold">Event name <span className="text-semantic-danger">*</span></span><Input name="name" defaultValue={existing?.name} placeholder="e.g. TECHNO 2027" aria-describedby={error ? "event-name-error" : undefined} />{error && <span id="event-name-error" role="alert" className="text-sm text-semantic-danger">{error}</span>}</label><label className="block space-y-2"><span className="text-sm font-semibold">Public description</span><textarea name="description" defaultValue={existing?.publicDescription} rows={5} className={field} placeholder="Explain the event in language participants will understand." /></label></fieldset></CardContent></Card><Card><CardHeader><CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5 text-primary" />Cover image</CardTitle></CardHeader><CardContent className="grid gap-5 "><label className="block space-y-2"><span className="text-sm font-semibold">Cover image URL</span><Input name="coverImageUrl" type="url" defaultValue={existing?.coverImageUrl} placeholder="https://…" disabled={locked} /></label></CardContent></Card><div className="sticky bottom-4 flex flex-col-reverse gap-2 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:justify-end"><Button type="button" variant="secondary" onClick={() => navigate(existing ? `/events/${existing.id}` : "/events")}>Cancel</Button><Button type="submit" name="intent" value="publish">{existing ? "Save changes" : "Create event"}</Button></div></form></PageLayout>;
}
