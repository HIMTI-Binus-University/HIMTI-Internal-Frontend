import { BriefcaseBusiness, Plus, UserRound } from "lucide-react";

import { useCreateWorkspace } from "@/api/link-workspaces/queries";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { LinkWorkspace } from "@/types/link-workspace";
import { useState } from "react";

export function WorkspaceSwitcher({
  value,
  workspaces,
  isLoading,
  onChange,
}: {
  value: string;
  workspaces: LinkWorkspace[];
  isLoading: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createWorkspace = useCreateWorkspace();

  const submit = () => {
    if (!name.trim()) return;
    createWorkspace.mutate(
      { name: name.trim(), description: description.trim() || null },
      {
        onSuccess: (workspace) => {
          onChange(workspace.id);
          setName("");
          setDescription("");
          setOpen(false);
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select value={value} onValueChange={(next) => next && onChange(next)}>
          <SelectTrigger
            aria-label="Select link workspace"
            className="h-9 w-[min(15rem,45vw)] bg-card"
          >
            <SelectValue>
              {value === "personal"
                ? "Personal"
                : (workspaces.find((workspace) => workspace.id === value)
                    ?.name ?? "Workspace")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="personal">
              <span className="flex items-center gap-2">
                <UserRound className="h-4 w-4" /> Personal
              </span>
            </SelectItem>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                <span className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4" /> {workspace.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Create workspace"
          disabled={isLoading}
          onClick={() => setOpen(true)}
        >
          <Plus />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>Create workspace</DialogTitle>
            <DialogDescription>
              Group links and collaborate with owners, editors, and viewers.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div>
              <Label htmlFor="workspace-name" className="mb-2">
                Name
              </Label>
              <Input
                id="workspace-name"
                autoFocus
                required
                maxLength={255}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Marketing links"
              />
            </div>
            <div>
              <Label htmlFor="workspace-description" className="mb-2">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="workspace-description"
                maxLength={5000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Links shared by the marketing team"
              />
            </div>
            {createWorkspace.isError && (
              <p role="alert" className="text-sm text-semantic-danger">
                Could not create the workspace. Try again.
              </p>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || createWorkspace.isPending}
              >
                {createWorkspace.isPending ? "Creating..." : "Create workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
