import { useState } from "react";
import {
  useAssignResponsiEditors,
  useGetResponsiEditorCandidates,
} from "@/api/education/queries";
import { backendMessage, useNotification } from "@/components/notification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ResponsiEditorCandidate } from "@/types/education";

export default function ResponsiEditors({
  id,
  editors,
  onClose,
}: {
  id: string;
  editors: ResponsiEditorCandidate[];
  onClose: () => void;
}) {
  const [selected, setSelected] = useState(editors);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const candidates = useGetResponsiEditorCandidates(search);
  const assign = useAssignResponsiEditors();
  const notify = useNotification();
  const [error, setError] = useState("");

  const save = async () => {
    setError("");
    try {
      await assign.mutateAsync({ id, editorIds: selected.map((person) => person.id) });
      notify("Editor assignments saved.", "success");
      onClose();
    } catch (cause) {
      setError(backendMessage(cause, "Failed to save editor assignments."));
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && !assign.isPending && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Assign editors</SheetTitle>
          <SheetDescription>Choose who can edit this summary.</SheetDescription>
        </SheetHeader>
        <ul className="mt-4 space-y-2" aria-label="Assigned editors">
          {selected.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="break-words">{person.name}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={assign.isPending}
                aria-label={`Remove ${person.name}`}
                onClick={() => setSelected(selected.filter(({ id }) => id !== person.id))}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(input.trim());
          }}
        >
          <Input
            aria-label="Find editors by name"
            placeholder="Find by name"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={100}
          />
          <Button type="submit" variant="outline" disabled={input.trim().length < 2}>
            Search
          </Button>
        </form>
        {candidates.isFetching && <p role="status" className="mt-2 text-sm">Searching…</p>}
        {candidates.isError && <p role="alert" className="mt-2 text-sm text-destructive">Search failed. Try again.</p>}
        {candidates.data?.length === 0 && <p className="mt-2 text-sm">No editors found.</p>}
        <ul className="mt-3 space-y-2" aria-label="Editor search results">
          {candidates.data?.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="break-words">{person.name}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={assign.isPending || selected.some(({ id }) => id === person.id)}
                aria-label={`Add ${person.name}`}
                onClick={() => setSelected([...selected, person])}
              >
                Add
              </Button>
            </li>
          ))}
        </ul>
        {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
        <Button className="mt-5" disabled={assign.isPending} onClick={save}>
          {assign.isPending ? "Saving..." : "Save assignments"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}
