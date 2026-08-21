import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Banknote,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Search,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  getPaymentProofBlob,
  type PaymentDetail,
  type PaymentSettingsPayload,
  usePaymentDetail,
  usePaymentQueue,
  usePaymentSettings,
  useReviewPayment,
  useUpdatePaymentSettings,
} from "@/api/event-payments/queries";
import { dateTime, titleCase } from "@/components/events/helpers";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState } from "../components";
import {
  formatMinor,
  majorIdrToMinor,
  paymentApiError,
  paymentSorts,
  paymentStatuses,
  readPaymentFilters,
} from "./payment-utils";

const proofTypes = [
  ["image/jpeg", "JPEG"],
  ["image/png", "PNG"],
  ["image/webp", "WebP"],
  ["application/pdf", "PDF"],
] as const;

export const PaymentWorkspace = ({ subeventId }: { subeventId: string }) => (
  <div className="space-y-6">
    <PaymentSettings subeventId={subeventId} />
    <PaymentQueue subeventId={subeventId} />
  </div>
);

const PaymentSettings = ({ subeventId }: { subeventId: string }) => {
  const query = usePaymentSettings(subeventId);
  const update = useUpdatePaymentSettings(subeventId);
  const [error, setError] = useState("");
  const [amountInput, setAmountInput] = useState("");
  useEffect(() => {
    if (query.data) setAmountInput(query.data.amountMinor);
  }, [query.data]);
  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const values = new FormData(event.currentTarget);
    try {
      const amountMinor = majorIdrToMinor(amountInput);
      const isFree = BigInt(amountMinor) === 0n;
      const selectedProofTypes = proofTypes
        .map(([type]) => type)
        .filter((type) => values.getAll("acceptedProofTypes").includes(type));
      const sizeMb = isFree
        ? (query.data?.maxProofBytes ?? 1) / 1024 / 1024
        : Number(values.get("maxProofMb"));
      const payload: PaymentSettingsPayload = {
        amountMinor,
        currency: String(values.get("currency") ?? "IDR")
          .trim()
          .toUpperCase(),
        bankName: isFree ? null : String(values.get("bankName") ?? "").trim(),
        accountHolder: isFree
          ? null
          : String(values.get("accountHolder") ?? "").trim(),
        accountNumber: isFree
          ? null
          : String(values.get("accountNumber") ?? "").trim(),
        instructions: isFree
          ? null
          : String(values.get("instructions") ?? "").trim() || null,
        paymentDeadlineHours: isFree
          ? (query.data?.paymentDeadlineHours ?? 24)
          : Number(values.get("paymentDeadlineHours")),
        acceptedProofTypes: isFree ? [] : selectedProofTypes,
        maxProofBytes: Math.round(sizeMb * 1024 * 1024),
      };
      if (
        !isFree &&
        (!payload.bankName || !payload.accountHolder || !payload.accountNumber)
      )
        throw new Error(
          "Bank, account holder, and account number are required.",
        );
      if (!isFree && !selectedProofTypes.length)
        throw new Error("Select at least one allowed proof type.");
      if (
        !isFree &&
        (!Number.isInteger(payload.paymentDeadlineHours) ||
          payload.paymentDeadlineHours < 1 ||
          payload.paymentDeadlineHours > 720)
      )
        throw new Error("Deadline must be a whole number from 1 to 720 hours.");
      if (!isFree && (!Number.isFinite(sizeMb) || sizeMb <= 0 || sizeMb > 10))
        throw new Error("Maximum proof size must be between 0 and 10 MiB.");
      update.mutate(payload, {
        onError: (failure) => setError(paymentApiError(failure)),
      });
    } catch (failure) {
      setError((failure as Error).message);
    }
  };
  if (query.isLoading)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Loading payment settings...
      </p>
    );
  if (query.isError || !query.data)
    return (
      <EmptyState
        icon={Banknote}
        title="Payment settings unavailable"
        description={paymentApiError(query.error)}
        action={
          <Button variant="secondary" onClick={() => query.refetch()}>
            Try again
          </Button>
        }
      />
    );
  const settings = query.data;
  let isFree = false;
  try {
    isFree = BigInt(majorIdrToMinor(amountInput)) === 0n;
  } catch {
    isFree = false;
  }
  const displayAmount = (() => {
    try {
      return amountInput
        ? formatMinor(majorIdrToMinor(amountInput), settings.currency)
        : "Enter an amount";
    } catch {
      return "Enter a valid whole-rupiah amount";
    }
  })();
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Production payment settings</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Saving also updates the default one-seat package price and
              currency.
            </p>
          </div>
          <Badge variant={isFree ? "success" : "warning"}>
            {isFree ? "Free - no payment required" : displayAmount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form
          key={JSON.stringify(settings)}
          onSubmit={save}
          onChange={() => setError("")}
          className="grid gap-4 sm:grid-cols-2"
        >
          <Field
            label="Amount (IDR)"
            helper="Whole rupiah. Enter 0 explicitly for a free package."
          >
            <Input
              name="amountMajor"
              inputMode="numeric"
              value={amountInput}
              onChange={(event) => {
                setAmountInput(event.target.value);
                setError("");
              }}
              required
            />
          </Field>
          <Field
            label="Currency"
            helper="Three-letter ISO currency; IDR uses whole rupiah minor units."
          >
            <Input
              name="currency"
              defaultValue={settings.currency}
              minLength={3}
              maxLength={3}
              readOnly
              required
            />
          </Field>
          <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {isFree
              ? "Free package: bank details and payment-proof requirements are disabled and will be cleared when saved."
              : "Paid package: bank details and at least one payment-proof type are required."}
          </div>
          <Field label={`Bank${isFree ? " (not required for free)" : ""}`}>
            <Input
              name="bankName"
              defaultValue={settings.bankName ?? ""}
              maxLength={100}
              required={!isFree}
              disabled={isFree}
            />
          </Field>
          <Field
            label={`Account holder${isFree ? " (not required for free)" : ""}`}
          >
            <Input
              name="accountHolder"
              defaultValue={settings.accountHolder ?? ""}
              maxLength={150}
              required={!isFree}
              disabled={isFree}
            />
          </Field>
          <Field
            label="Account number"
            helper="Stored as text, preserving leading zeroes."
          >
            <Input
              name="accountNumber"
              defaultValue={settings.accountNumber ?? ""}
              maxLength={100}
              required={!isFree}
              disabled={isFree}
            />
          </Field>
          <Field label="Payment deadline (hours)">
            <Input
              name="paymentDeadlineHours"
              type="number"
              min={1}
              max={720}
              defaultValue={settings.paymentDeadlineHours}
              required={!isFree}
              disabled={isFree}
            />
          </Field>
          <Field label="Maximum proof size (MiB)">
            <Input
              name="maxProofMb"
              type="number"
              min={0.01}
              max={10}
              step={0.01}
              defaultValue={settings.maxProofBytes / 1024 / 1024}
              required={!isFree}
              disabled={isFree}
            />
          </Field>
          <fieldset className="space-y-2" disabled={isFree}>
            <legend className="text-sm font-semibold">
              Allowed proof types
            </legend>
            <div className="flex flex-wrap gap-3">
              {proofTypes.map(([type, label]) => (
                <label key={type} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    name="acceptedProofTypes"
                    value={type}
                    defaultChecked={settings.acceptedProofTypes.includes(type)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <Field
            label={`Payment instructions${isFree ? " (not required for free)" : ""}`}
            className="sm:col-span-2"
          >
            <textarea
              name="instructions"
              rows={4}
              maxLength={5000}
              defaultValue={settings.instructions ?? ""}
              disabled={isFree}
              className="w-full rounded-lg border bg-background p-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            />
          </Field>
          <div className="sm:col-span-2 rounded-lg border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
            Package implication: an amount above zero marks the subevent paid
            and uses these details for new payment snapshots. Zero makes the
            default package free; existing payment records retain their
            snapshots.
          </div>
          {error && (
            <p
              role="alert"
              className="sm:col-span-2 text-sm text-semantic-danger"
            >
              {error}
            </p>
          )}
          {update.isSuccess && !error && (
            <p role="status" className="sm:col-span-2 text-sm text-emerald-700">
              Payment settings saved.
            </p>
          )}
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Saving..." : "Save payment settings"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentQueue = ({ subeventId }: { subeventId: string }) => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readPaymentFilters(params), [params]);
  const [search, setSearch] = useState(filters.search ?? "");
  const [selectedId, setSelectedId] = useState("");
  const query = usePaymentQueue(subeventId, filters);
  useEffect(() => setSearch(filters.search ?? ""), [filters.search]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search.trim() === (filters.search ?? "")) return;
      const next = new URLSearchParams(params);
      search.trim() ? next.set("search", search.trim()) : next.delete("search");
      next.set("page", "1");
      setParams(next, { replace: true });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [filters.search, params, search, setParams]);
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value === "ALL" ? next.delete(key) : next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setParams(next);
  };
  const rows = query.data?.data ?? [];
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Payment review queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-0">
        <div className="grid gap-3 px-4 sm:px-5 lg:grid-cols-[1fr_13rem_14rem]">
          <label className="relative">
            <span className="sr-only">Search payments</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search identity or order"
            />
          </label>
          <select
            aria-label="Payment status"
            className="h-10 rounded-lg border bg-card px-3 text-sm"
            value={filters.status ?? "ALL"}
            onChange={(event) => setFilter("status", event.target.value)}
          >
            <option value="ALL">All statuses</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {titleCase(status)}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort payments"
            className="h-10 rounded-lg border bg-card px-3 text-sm"
            value={filters.sort}
            onChange={(event) => setFilter("sort", event.target.value)}
          >
            {paymentSorts.map((sort) => (
              <option key={sort} value={sort}>
                {titleCase(sort.replace(":", " "))}
              </option>
            ))}
          </select>
        </div>
        {query.isError ? (
          <div className="p-5">
            <EmptyState
              title="Payment queue unavailable"
              description={paymentApiError(query.error)}
              action={
                <Button variant="secondary" onClick={() => query.refetch()}>
                  Try again
                </Button>
              }
            />
          </div>
        ) : !query.isLoading && !rows.length ? (
          <div className="p-5">
            <EmptyState
              title="No payments found"
              description="No payment records match the current filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto border-t">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">
                    <span className="sr-only">Review</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    <td className="p-4">
                      <p className="font-semibold">{row.order.buyer.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.order.buyer.nim ?? row.order.buyer.email}
                      </p>
                    </td>
                    <td className="p-4 font-mono text-xs">
                      {row.order.orderNumber}
                    </td>
                    <td className="p-4 font-semibold">
                      {formatMinor(row.amountMinor, row.currency)}
                    </td>
                    <td className="p-4 text-xs">
                      {row.expiresAt ? dateTime(row.expiresAt) : "No deadline"}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {row.submittedAt
                        ? dateTime(row.submittedAt)
                        : "Not submitted"}
                    </td>
                    <td className="p-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedId(row.id)}
                      >
                        <Eye />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t p-4">
          <p className="text-sm text-muted-foreground">
            {query.data?.meta.totalRecords ?? 0} payments - page{" "}
            {query.data?.meta.page ?? filters.page} of{" "}
            {Math.max(1, query.data?.meta.totalPages ?? 1)}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              aria-label="Previous payment page"
              disabled={filters.page <= 1}
              onClick={() => setFilter("page", String(filters.page - 1))}
            >
              <ChevronLeft />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              aria-label="Next payment page"
              disabled={filters.page >= (query.data?.meta.totalPages ?? 1)}
              onClick={() => setFilter("page", String(filters.page + 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      </CardContent>
      <PaymentDetailDialog
        paymentId={selectedId}
        close={() => setSelectedId("")}
      />
    </Card>
  );
};

const PaymentDetailDialog = ({
  paymentId,
  close,
}: {
  paymentId: string;
  close: () => void;
}) => {
  const query = usePaymentDetail(paymentId);
  const verify = useReviewPayment("verify");
  const reject = useReviewPayment("reject");
  const [action, setAction] = useState<"verify" | "reject">();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const review = () => {
    if (!query.data || !action) return;
    if (action === "reject" && !reason.trim())
      return setError("A rejection reason is required.");
    const mutation = action === "verify" ? verify : reject;
    mutation.mutate(
      {
        paymentId,
        revision: query.data.revision,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setAction(undefined);
          setReason("");
          setError("");
        },
        onError: (failure) => {
          setError(paymentApiError(failure));
          query.refetch();
        },
      },
    );
  };
  const detail = query.data;
  if (!paymentId) return null;
  return (
    <>
      <Dialog
        open={Boolean(paymentId)}
        onOpenChange={(open) => !open && close()}
      >
        <DialogContent className="flex max-h-[calc(100vh-2rem)] max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Payment review</DialogTitle>
            <DialogDescription>
              Backend authorization remains authoritative for detail, proof
              content, and decisions.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto pr-1">
            {query.isLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Loading payment...
              </p>
            ) : query.isError || !detail ? (
              <EmptyState
                title="Payment unavailable"
                description={paymentApiError(query.error)}
              />
            ) : (
              <PaymentDetailBody detail={detail} setAction={setAction} />
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) {
            setAction(undefined);
            setReason("");
            setError("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {action === "verify"
                ? "Verify this payment?"
                : "Reject this proof?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {action === "verify"
                ? "This confirms the submitted proof and advances the registration order."
                : "The participant will see the reason and can follow the resulting correction flow."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <label className="space-y-2">
            <span className="text-sm font-semibold">
              {action === "reject"
                ? "Rejection reason (required)"
                : "Reviewer note (optional)"}
            </span>
            <textarea
              rows={4}
              value={reason}
              maxLength={2000}
              onChange={(event) => {
                setReason(event.target.value);
                setError("");
              }}
              className="w-full rounded-lg border bg-background p-3 text-sm"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-semantic-danger">
              {error}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={action === "verify" ? "default" : "delete"}
              disabled={verify.isPending || reject.isPending}
              onClick={(event) => {
                event.preventDefault();
                review();
              }}
            >
              {action === "verify" ? "Verify payment" : "Reject proof"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const PaymentDetailBody = ({
  detail,
  setAction,
}: {
  detail: PaymentDetail;
  setAction: (action: "verify" | "reject") => void;
}) => (
  <div className="space-y-5">
    <div className="grid gap-3 rounded-xl border bg-muted/20 p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Info label="Participant" value={detail.order.buyer.name} />
      <Info label="Order" value={detail.order.orderNumber} />
      <Info
        label="Amount"
        value={formatMinor(detail.amountMinor, detail.currency)}
      />
      <Info
        label="Deadline"
        value={detail.expiresAt ? dateTime(detail.expiresAt) : "No deadline"}
      />
    </div>
    <section>
      <h3 className="font-semibold">Proof history</h3>
      <div className="mt-3 space-y-3">
        {detail.proofs.length ? (
          detail.proofs.map((proof) => (
            <ProofCard key={proof.id} proof={proof} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No proof has been submitted.
          </p>
        )}
      </div>
    </section>
    <section>
      <h3 className="font-semibold">Status history</h3>
      <div className="mt-3 divide-y rounded-xl border">
        {detail.history.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap justify-between gap-2 p-3 text-sm"
          >
            <span>
              {item.fromStatus ? `${titleCase(item.fromStatus)} to ` : ""}
              {titleCase(item.toStatus)}
              {item.reason ? ` - ${item.reason}` : ""}
            </span>
            <span className="text-xs text-muted-foreground">
              {dateTime(item.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
    {detail.status === "PROOF_SUBMITTED" && (
      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card py-4">
        <Button variant="secondary" onClick={() => setAction("reject")}>
          <X />
          Reject
        </Button>
        <Button onClick={() => setAction("verify")}>
          <Check />
          Verify
        </Button>
      </div>
    )}
  </div>
);

const ProofCard = ({ proof }: { proof: PaymentDetail["proofs"][number] }) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url],
  );
  const load = async () => {
    try {
      setError("");
      const blob = await getPaymentProofBlob(proof.contentPath);
      setUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return URL.createObjectURL(blob);
      });
    } catch (failure) {
      setError(paymentApiError(failure));
    }
  };
  return (
    <div className="rounded-xl border p-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">{proof.upload.originalFilename}</p>
          <p className="text-xs text-muted-foreground">
            {proof.upload.mediaType} -{" "}
            {(proof.upload.sizeBytes / 1024).toFixed(1)} KiB -{" "}
            {dateTime(proof.submittedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={proof.status} />
          {!url ? (
            <Button size="sm" variant="secondary" onClick={load}>
              <Eye />
              Load proof
            </Button>
          ) : (
            <Button size="sm" variant="secondary" asChild>
              <a href={url} download={proof.upload.originalFilename}>
                <Download />
                Download
              </a>
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-semantic-danger">
          {error}
        </p>
      )}
      {url && proof.upload.mediaType.startsWith("image/") && (
        <img
          src={url}
          alt={`Payment proof ${proof.upload.originalFilename}`}
          className="mt-3 max-h-[32rem] w-full rounded-lg border object-contain"
        />
      )}
      {url && proof.upload.mediaType === "application/pdf" && (
        <p className="mt-3 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
          PDF preview is download-only to avoid embedding active document
          content.
        </p>
      )}
      {proof.reviewReason && (
        <p className="mt-2 text-sm text-muted-foreground">
          Review: {proof.reviewReason}
        </p>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge
    variant={
      status === "VERIFIED" || status === "ACCEPTED"
        ? "success"
        : status === "REJECTED" ||
            status === "EXPIRED" ||
            status === "CANCELLED"
          ? "danger"
          : "warning"
    }
  >
    {titleCase(status)}
  </Badge>
);
const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
    <p className="mt-1 text-sm font-semibold">{value}</p>
  </div>
);
const Field = ({
  label,
  helper,
  className,
  children,
}: {
  label: string;
  helper?: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <label className={`space-y-2 ${className ?? ""}`}>
    <span className="block text-sm font-semibold">{label}</span>
    {helper && (
      <span className="block text-xs text-muted-foreground">{helper}</span>
    )}
    {children}
  </label>
);
