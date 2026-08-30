import { useEffect, type FormEvent } from "react";
import type { AxiosError } from "axios";
import { CalendarCheck } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import {
  useCreateElection,
  useGetElection,
  useUpdateElection,
} from "@/api/elections/queries";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const localDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("sv-SE").slice(0, 16) : "";
const nullable = (value: FormDataEntryValue | null) =>
  String(value ?? "").trim() || null;
const apiError = (error: unknown) =>
  (error as AxiosError<{ msg?: string; message?: string }>).response?.data
    .msg ??
  (error as AxiosError<{ message?: string }>).response?.data.message ??
  "Failed to save election.";

export default function ElectionEditorPage() {
  const { electionId = "" } = useParams();
  const navigate = useNavigate();
  const query = useGetElection(electionId);
  const create = useCreateElection();
  const update = useUpdateElection(electionId);
  const [error, setError] = useState("");
  const existing = query.data;
  useEffect(() => {
    if (existing && existing.status !== "DRAFT")
      navigate(`/elections/${existing.id}`, { replace: true });
  }, [existing, navigate]);
  if (electionId && query.isError) return <Navigate to="/elections" replace />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const starts = String(data.get("startsAt"));
    const ends = String(data.get("endsAt"));
    if (!starts || !ends || new Date(starts) >= new Date(ends))
      return setError("End time must be after start time.");
    const payload = {
      slug: String(data.get("slug") ?? "").trim(),
      title: String(data.get("title") ?? "").trim(),
      description: nullable(data.get("description")),
      startsAt: new Date(starts).toISOString(),
      endsAt: new Date(ends).toISOString(),
      debateAt: data.get("debateAt")
        ? new Date(String(data.get("debateAt"))).toISOString()
        : null,
    };
    if (payload.slug.length < 3 || payload.title.length < 3)
      return setError("Title and slug must contain at least 3 characters.");
    const options = {
      onSuccess: (saved: unknown) =>
        navigate(`/elections/${(saved as { id: string }).id}`),
      onError: (failure: unknown) => setError(apiError(failure)),
    };
    existing
      ? update.mutate(payload, options)
      : create.mutate(payload, options);
  };
  return (
    <PageLayout
      icon={CalendarCheck}
      title={existing ? "Edit election" : "Create election"}
      backTo={existing ? `/elections/${existing.id}` : "/elections"}
    >
      <form
        className="mx-auto max-w-3xl"
        onSubmit={submit}
        onChange={() => setError("")}
      >
        <Card>
          <CardHeader>
            <CardTitle>Election details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Title *</span>
              <Input
                name="title"
                required
                minLength={3}
                defaultValue={existing?.title}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Slug *</span>
              <Input
                name="slug"
                required
                minLength={3}
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                defaultValue={existing?.slug}
                placeholder="president-election-2027"
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Description</span>
              <textarea
                name="description"
                defaultValue={existing?.description ?? ""}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Starts at *</span>
              <Input
                name="startsAt"
                type="datetime-local"
                required
                defaultValue={localDate(existing?.startsAt)}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Ends at *</span>
              <Input
                name="endsAt"
                type="datetime-local"
                required
                defaultValue={localDate(existing?.endsAt)}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Debate at</span>
              <Input
                name="debateAt"
                type="datetime-local"
                defaultValue={localDate(existing?.debateAt)}
              />
            </label>
          </CardContent>
        </Card>
        {error && (
          <p role="alert" className="mt-4 text-sm text-semantic-danger">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              navigate(existing ? `/elections/${existing.id}` : "/elections")
            }
          >
            Cancel
          </Button>
          <Button disabled={create.isPending || update.isPending}>
            Save draft
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
