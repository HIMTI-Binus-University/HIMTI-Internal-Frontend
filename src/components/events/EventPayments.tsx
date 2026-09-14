import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/api-client";
import type { components, operations } from "@/generated/openapi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmAction } from "./ConfirmAction";
import { backendMessage } from "@/components/notification";

type Payment = components["schemas"]["EventPayment"];
type Correction = NonNullable<
  operations["requestEventPaymentCorrection"]["requestBody"]
>["content"]["application/json"];

export function PaymentReview({
  payment,
  canViewProofs,
}: {
  payment: Payment;
  canViewProofs: boolean;
}) {
  const client = useQueryClient();
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<{ url: string; mediaType: string }>();
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  const review = useMutation({
    mutationFn: async (action: "approve" | "request-correction" | "reject") => {
      const body: Correction | { expectedRevision: number; reason?: string } =
        action === "request-correction"
          ? {
              expectedRevision: payment.revision,
              memberIds,
              reason: reason.trim(),
            }
          : {
              expectedRevision: payment.revision,
              ...(action === "reject" && { reason: reason.trim() }),
            };
      await apiClient.post(
        `/api/internal/event-payments/${encodeURIComponent(payment.id)}/${action}`,
        body,
      );
    },
    onSettled: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["event-payments"] }),
        client.invalidateQueries({ queryKey: ["event-payment", payment.id] }),
        client.invalidateQueries({ queryKey: ["event-registration-payment"] }),
        client.invalidateQueries({
          queryKey: ["events", payment.eventId, "registrations"],
        }),
      ]);
    },
  });
  const open = ["COLLECTING", "REVIEW"].includes(payment.status);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review one whole-order payment</CardTitle>
        <p className="text-sm text-muted-foreground">
          {payment.packageName} · {payment.status} · {payment.currency}{" "}
          {BigInt(payment.amountMinor).toLocaleString()}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
          <p>
            {payment.acknowledgementCount}/{payment.requiredCount}{" "}
            acknowledgements ready
          </p>
          <p>
            Deadline:{" "}
            {payment.expiresAt
              ? new Date(payment.expiresAt).toLocaleString()
              : "Not set"}
          </p>
          <p>
            {payment.bank?.bankName} · {payment.bank?.accountNumber}
          </p>
          <p>{payment.bank?.accountHolder}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {payment.members.map((member) => (
            <div key={member.id} className="space-y-3 rounded-lg border p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Request correction for ${member.name ?? member.id}`}
                  disabled={payment.status !== "REVIEW" || review.isPending}
                  checked={memberIds.includes(member.id)}
                  onChange={(event) =>
                    setMemberIds(
                      event.target.checked
                        ? [...memberIds, member.id]
                        : memberIds.filter((id) => id !== member.id),
                    )
                  }
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="block font-semibold">
                    {member.name ?? "Participant"}
                  </span>
                  <span className="break-all text-sm text-muted-foreground">
                    {member.email}
                  </span>
                </span>
              </label>
              {member.correction && (
                <p className="whitespace-pre-wrap rounded-md bg-amber-50 p-3 text-sm text-amber-900">
                  {member.correction.reason}
                  <br />
                  Due {new Date(member.correction.deadlineAt).toLocaleString()}
                </p>
              )}
              {!member.proofs.length && (
                <p className="text-sm text-muted-foreground">
                  No acknowledgement yet.
                </p>
              )}
              {member.proofs.map((proof) => (
                <div
                  key={proof.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span>
                    {proof.status === "CURRENT"
                      ? "Current proof"
                      : "Previous proof"}
                    <span className="block text-xs text-muted-foreground">
                      {new Date(proof.submittedAt).toLocaleString()}
                    </span>
                  </span>
                  {canViewProofs && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        setError("");
                        try {
                          const response = await apiClient.get<Blob>(
                            proof.contentUrl,
                            { responseType: "blob" },
                          );
                          if (preview) URL.revokeObjectURL(preview.url);
                          setPreview({
                            url: URL.createObjectURL(response.data),
                            mediaType: proof.mediaType,
                          });
                        } catch (cause) {
                          setError(
                            backendMessage(
                              cause,
                              "Private proof could not be loaded.",
                            ),
                          );
                        }
                      }}
                    >
                      View proof
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {preview && (
          <div className="space-y-3 rounded-lg border p-3">
            {preview.mediaType.startsWith("image/") ? (
              <img
                alt="Selected participant payment proof"
                src={preview.url}
                className="max-h-96 w-full object-contain"
              />
            ) : (
              <iframe
                title="Selected participant payment proof"
                src={preview.url}
                sandbox=""
                className="h-96 w-full"
              />
            )}
            <Button
              variant="outline"
              onClick={() => {
                URL.revokeObjectURL(preview.url);
                setPreview(undefined);
              }}
            >
              Close proof
            </Button>
          </div>
        )}
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        {open && (
          <div className="space-y-4 border-t pt-5">
            <label className="block space-y-2 text-sm font-semibold">
              <span>Reason for correction or final rejection</span>
              <textarea
                value={reason}
                maxLength={2000}
                onChange={(event) => setReason(event.target.value)}
                className="min-h-24 w-full rounded-md border bg-background p-3"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Correction retains other members' proofs. The server sets a
              deadline of at most 24 hours, bounded by existing deadlines.
              Contact participants manually.
            </p>
            <div className="flex flex-wrap gap-3">
              <ConfirmAction
                label="Approve payment"
                description="Confirm the whole-order payment once, consume the capacity hold, and issue every member's ticket."
                onConfirm={() => review.mutateAsync("approve")}
              >
                <Button
                  disabled={
                    review.isPending ||
                    payment.status !== "REVIEW" ||
                    payment.acknowledgementCount !== payment.requiredCount
                  }
                >
                  Approve payment
                </Button>
              </ConfirmAction>
              <ConfirmAction
                label="Request correction"
                description={`Ask ${memberIds.length} selected members to replace their proofs. Non-selected proofs are retained.`}
                onConfirm={() => review.mutateAsync("request-correction")}
              >
                <Button
                  variant="outline"
                  disabled={
                    review.isPending ||
                    payment.status !== "REVIEW" ||
                    !memberIds.length ||
                    !reason.trim()
                  }
                >
                  Request correction
                </Button>
              </ConfirmAction>
              <ConfirmAction
                label="Reject payment"
                description="Permanently reject the entire order and release all held seats. This cannot be undone."
                onConfirm={() => review.mutateAsync("reject")}
              >
                <Button
                  variant="destructive"
                  disabled={review.isPending || !reason.trim()}
                >
                  Final reject
                </Button>
              </ConfirmAction>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
