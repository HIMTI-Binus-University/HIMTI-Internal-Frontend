import { useState, useMemo } from "react";
import { Plus, Trash2, UserCheck, UsersRound } from "lucide-react";
import {
  useAddHimtiKitAttendees,
  useDeleteHimtiKitAttendee,
  useGetHimtiKitAttendees,
} from "@/api/himti-kit/queries";
import { Container, EmptyState, SearchField } from "@/components/Utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CreateHimtiKitAttendeeInput, HimtiKitAttendee } from "@/types/himti-kit";
import { AttendeeImportDialog } from "./attendee-import-dialog";

export function AttendeesTab() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HimtiKitAttendee | null>(null);

  const { data: attendees = [], isLoading, isError } = useGetHimtiKitAttendees();
  const addMutation = useAddHimtiKitAttendees();
  const deleteMutation = useDeleteHimtiKitAttendee();

  const filteredAttendees = useMemo(() => {
    if (!search.trim()) return attendees;
    const q = search.toLowerCase().trim();
    return attendees.filter(
      (item) => item.name.toLowerCase().includes(q) || item.nim.toLowerCase().includes(q)
    );
  }, [attendees, search]);

  const handleImportSubmit = async (payload: CreateHimtiKitAttendeeInput[]) => {
    await addMutation.mutateAsync(payload);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <SearchField
            id="attendee-search"
            label="Search attendees"
            placeholder="Search by student name or NIM..."
            value={search}
            onChange={setSearch}
            className="relative w-full"
          />
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Badge variant="secondary" className="px-3 py-1.5 text-xs font-semibold gap-1.5">
            <UsersRound className="h-3.5 w-3.5 text-primary" />
            <span>{attendees.length} Authorized Students</span>
          </Badge>

          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add / Import Attendees</span>
          </Button>
        </div>
      </div>

      {/* Main Table Content */}
      <Container className="overflow-hidden p-0">
        {isLoading ? (
          <div className="space-y-2 p-6">
            {[1, 2, 3, 4, 5].map((idx) => (
              <Skeleton key={idx} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-6 text-center text-sm text-semantic-danger">
            Failed to load attendee records. Please verify backend connection.
          </div>
        ) : filteredAttendees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={UserCheck}
              title="No eligible attendees found"
              description={
                search
                  ? "No student matches your search query."
                  : "No students have been authorized yet. Click 'Add / Import Attendees' to upload NIMs."
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">NIM (Student Identifier)</th>
                  <th className="px-6 py-3.5">Student Name</th>
                  <th className="px-6 py-3.5">Authorized Status</th>
                  <th className="px-6 py-3.5">Date Added</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredAttendees.map((student) => (
                  <tr
                    key={student.id}
                    className="transition-colors hover:bg-muted/20"
                  >
                    <td className="whitespace-nowrap px-6 py-4 font-mono font-medium text-foreground">
                      {student.nim}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-foreground">
                      {student.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-semantic-success-background px-2.5 py-0.5 text-xs font-medium text-semantic-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-semantic-success" />
                        Eligible
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                      {student.createdAt
                        ? new Date(student.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "Initial Setup"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setDeleteTarget(student)}
                        aria-label="Remove attendee access"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Container>

      {/* Import / Add Modal */}
      <AttendeeImportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleImportSubmit}
        isLoading={addMutation.isPending}
      />

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke attendee access?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove &quot;{deleteTarget?.name}&quot; ({deleteTarget?.nim})?
              This student will no longer be able to pass through the public HIMTI-KIT gate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removing..." : "Remove Access"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
