import { CalendarCheck, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { useGetElections } from "@/api/elections/queries";
import { Container, PageLayout } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const date = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function ElectionsPage() {
  const query = useGetElections();
  return (
    <PageLayout
      icon={CalendarCheck}
      title="Elections"
      actions={
        <Button asChild>
          <Link to="/elections/new">
            <Plus />
            Create election
          </Link>
        </Button>
      }
    >
      <Container>
        <h2 className="text-lg font-semibold">Elections</h2>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          Configure ballots and control the election lifecycle.
        </p>
        {query.isLoading ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Loading elections...
          </p>
        ) : query.isError ? (
          <div className="py-10 text-center">
            <p role="alert" className="text-sm text-semantic-danger">
              Elections could not be loaded.
            </p>
            <Button
              className="mt-3"
              variant="secondary"
              onClick={() => query.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : query.data?.length ? (
          <div className="grid gap-3">
            {query.data.map((election) => (
              <Link
                key={election.id}
                to={`/elections/${election.id}`}
                className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:border-primary/50 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{election.title}</h3>
                    <Badge variant="secondary">{election.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {date(election.startsAt)} - {date(election.endsAt)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {election.candidates.length} candidate
                    {election.candidates.length === 1 ? "" : "s"}
                  </p>
                </div>
                <ChevronRight
                  aria-hidden="true"
                  className="hidden text-muted-foreground sm:block"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <CalendarCheck className="mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold">Create your first election</h3>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              New elections begin as drafts.
            </p>
            <Button asChild>
              <Link to="/elections/new">Create election</Link>
            </Button>
          </div>
        )}
      </Container>
    </PageLayout>
  );
}
