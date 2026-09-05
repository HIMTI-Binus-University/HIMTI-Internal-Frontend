import { useState, type FormEvent } from "react";
import { Layers3 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  useCreateEventGroup,
  useEventGroup,
  useUpdateEventGroup,
} from "@/api/event-groups/queries";
import { PageLayout } from "@/components/Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MarkdownTextarea } from "@/components/markdown-textarea";
export default function EventGroupEditorPage() {
  const { eventGroupId = "" } = useParams();
  const detail = useEventGroup(eventGroupId);
  const create = useCreateEventGroup();
  const update = useUpdateEventGroup();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const isEditing = Boolean(eventGroupId);
  const group = isEditing ? detail.data : undefined;
  if (isEditing && !detail.isLoading && !group)
    return <Navigate to="/events" replace />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    if (name.length < 3)
      return setError("Group name must be at least 3 characters.");
    const body = {
      name,
      publicDescription: String(f.get("publicDescription") || "") || null,
      internalDescription: String(f.get("internalDescription") || "") || null,
      coverImageUrl: String(f.get("coverImageUrl") || "") || null,
      primaryColor: String(f.get("primaryColor") || "") || null,
      secondaryColor: String(f.get("secondaryColor") || "") || null,
    };
    const options = {
      onSuccess: (saved: { id: string }) =>
        navigate(`/event-groups/${saved.id}`),
      onError: () => setError("Failed to save event group."),
    };
    isEditing && group
      ? update.mutate({ id: group.id, ...body }, options)
      : create.mutate(body, options);
  };
  return (
    <PageLayout
      icon={Layers3}
      title={isEditing ? "Edit event group" : "Create event group"}
      backTo={isEditing && group ? `/event-groups/${group.id}` : "/events"}
    >
      <form className="mx-auto max-w-4xl space-y-5" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>Group identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Name *</span>
              <Input
                name="name"
                required
                minLength={3}
                defaultValue={group?.name}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Cover image URL</span>
              <Input
                type="url"
                name="coverImageUrl"
                defaultValue={group?.coverImageUrl ?? ""}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Primary color</span>
              <Input
                name="primaryColor"
                placeholder="#123456"
                defaultValue={group?.primaryColor ?? ""}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-semibold">Secondary color</span>
              <Input
                name="secondaryColor"
                placeholder="#abcdef"
                defaultValue={group?.secondaryColor ?? ""}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Public description</span>
              <MarkdownTextarea
                name="publicDescription"
                defaultValue={group?.publicDescription ?? ""}
              />
            </label>
            <label className="space-y-2 sm:col-span-2">
              <span className="text-sm font-semibold">Internal notes</span>
              <MarkdownTextarea
                name="internalDescription"
                defaultValue={group?.internalDescription ?? ""}
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
            Save group
          </Button>
        </div>
      </form>
    </PageLayout>
  );
}
