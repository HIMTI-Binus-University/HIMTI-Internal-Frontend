import { useState } from "react";
import { useOutstandingAnswers } from "@/api/event-registration/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function OutstandingAnswers({ eventId }: { eventId: string }) {
  const [page, setPage] = useState(1);
  const query = useOutstandingAnswers(eventId, page);
  return (
    <Card>
      <CardContent className="grid gap-4 p-5">
        <h2 className="text-lg font-semibold">
          Required additional answers outstanding
        </h2>
        <p className="text-sm text-muted-foreground">
          Contact participants manually. No notifications are sent. These
          answers do not affect registration, payment or tickets.
        </p>
        {query.isLoading ? (
          <p>Loading participants...</p>
        ) : query.isError ? (
          <p role="alert">
            Could not load participants.{" "}
            <Button variant="secondary" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </p>
        ) : !query.data?.length ? (
          <p>No outstanding required answers on this page.</p>
        ) : (
          <ul className="divide-y">
            {query.data.map((member) => (
              <li className="py-3" key={member.id}>
                <p className="font-semibold">{member.user.name}</p>
                <a
                  className="break-all text-primary underline"
                  href={`mailto:${member.user.email}`}
                >
                  {member.user.email}
                </a>
                <p className="text-xs text-muted-foreground">
                  Registration {member.registrationOrderId}
                </p>
                <p className="mt-1 text-sm">
                  {member.supplementalRequests
                    .map((request) => request.question.label)
                    .join("; ")}
                </p>
              </li>
            ))}
          </ul>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            disabled={page === 1 || query.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            variant="secondary"
            disabled={query.data?.length !== 25 || query.isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
