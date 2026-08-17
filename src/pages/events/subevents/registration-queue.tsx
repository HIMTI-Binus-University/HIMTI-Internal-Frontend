import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  TicketCheck,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import {
  type BulkReviewAction,
  type RegistrationQueueItem,
  useBulkReviewRegistrations,
  useRegistrationCapacity,
  useRegistrationQueue,
} from "@/api/event-registrations/queries";
import { dateTime, titleCase } from "@/components/events/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { EmptyState, StatCard } from "../components";
import {
  readQueueFilters,
  registrationSorts,
  registrationStatuses,
  responseStatuses,
} from "./registration-queue-filters";

const BULK_LIMIT = 50;

const apiError = (error: unknown) => {
  const response = (error as AxiosError<{ message?: string; msg?: string }>)
    .response;
  if (response?.status === 409)
    return "The queue changed while you were reviewing it. Refresh and select the registrations again.";
  return (
    response?.data?.message ??
    response?.data?.msg ??
    (error as Error).message ??
    "The action could not be completed."
  );
};

export const RegistrationQueue = ({
  eventId,
  subeventId,
}: {
  eventId: string;
  subeventId: string;
}) => {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readQueueFilters(params), [params]);
  const [search, setSearch] = useState(filters.search ?? "");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [bulkAction, setBulkAction] = useState<BulkReviewAction>();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const queue = useRegistrationQueue(subeventId, filters);
  const capacity = useRegistrationCapacity(subeventId);
  const bulk = useBulkReviewRegistrations(subeventId, bulkAction ?? "approve");
  const rows = queue.data?.data ?? [];
  const selectedCount = Object.keys(selected).length;

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

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value === "ALL" ? next.delete(key) : next.set(key, value);
    if (key !== "page") next.set("page", "1");
    setParams(next);
    setSelected({});
  };
  const visibleSelected = rows.filter((row) => selected[row.id] !== undefined);
  const allVisibleSelected =
    Boolean(rows.length) && visibleSelected.length === rows.length;
  const toggleAll = () => {
    if (allVisibleSelected) return setSelected({});
    setSelected(
      Object.fromEntries(
        rows.slice(0, BULK_LIMIT).map((row) => [row.id, row.revision]),
      ),
    );
  };
  const confirmBulk = () => {
    if (!bulkAction) return;
    bulk.mutate(
      {
        items: Object.entries(selected).map(([registrationId, revision]) => ({
          registrationId,
          revision,
        })),
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setSelected({});
          setBulkAction(undefined);
          setReason("");
          setError("");
        },
        onError: (failure) => setError(apiError(failure)),
      },
    );
  };
  const queryString = params.toString();

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Occupied seats"
          value={capacity.data?.occupied ?? "-"}
          detail={
            capacity.data?.maxParticipants
              ? `of ${capacity.data.maxParticipants} seats`
              : "No capacity limit"
          }
          icon={Users}
        />
        <StatCard
          label="Remaining"
          value={capacity.data?.remaining ?? "Unlimited"}
          detail="Available confirmed capacity"
          icon={TicketCheck}
          tone={capacity.data?.remaining === 0 ? "danger" : "success"}
        />
        <StatCard
          label="Pending approval"
          value={capacity.data?.byStatus.PENDING_APPROVAL ?? 0}
          detail="Awaiting a reviewer decision"
          icon={UserCheck}
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={capacity.data?.byStatus.APPROVED ?? 0}
          detail="Seats currently occupied"
          icon={Check}
          tone="success"
        />
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(14rem,1fr)_repeat(4,minmax(10rem,auto))]">
            <label className="relative">
              <span className="sr-only">Search registrations</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
                placeholder="Search name, email, NIM, or order"
              />
            </label>
            <FilterSelect
              label="Registration status"
              value={filters.status ?? "ALL"}
              onChange={(value) => updateFilter("status", value)}
              options={registrationStatuses}
            />
            <FilterSelect
              label="Response status"
              value={filters.responseStatus ?? "ALL"}
              onChange={(value) => updateFilter("responseStatus", value)}
              options={responseStatuses}
            />
            <FilterSelect
              label="Payment status"
              value={filters.paymentStatus ?? "ALL"}
              onChange={(value) => updateFilter("paymentStatus", value)}
              options={["NOT_REQUIRED"]}
            />
            <FilterSelect
              label="Sort registrations"
              value={filters.sort}
              onChange={(value) => updateFilter("sort", value)}
              options={registrationSorts.map((item) => item.value)}
              labels={Object.fromEntries(
                registrationSorts.map((item) => [item.value, item.label]),
              )}
            />
          </div>
        </CardContent>
      </Card>

      {selectedCount > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">
            {selectedCount} selected{" "}
            <span className="font-normal text-muted-foreground">
              (maximum {BULK_LIMIT})
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setBulkAction("approve")}>
              <Check />
              Approve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setBulkAction("reject")}
            >
              <X />
              Reject
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkAction("cancel")}
            >
              Admin cancel
            </Button>
          </div>
        </div>
      )}

      {queue.isError ? (
        <EmptyState
          title="Registration queue unavailable"
          description={apiError(queue.error)}
          action={
            <Button variant="secondary" onClick={() => queue.refetch()}>
              Try again
            </Button>
          }
        />
      ) : !queue.isLoading && !rows.length ? (
        <EmptyState
          icon={Inbox}
          title="No registrations found"
          description="No registrations match the current queue filters."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-12 p-4">
                    <Checkbox
                      aria-label="Select visible registrations"
                      checked={
                        allVisibleSelected
                          ? true
                          : visibleSelected.length
                            ? "indeterminate"
                            : false
                      }
                      onCheckedChange={toggleAll}
                    />
                  </th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">Order</th>
                  <th className="p-4">Registration</th>
                  <th className="p-4">Responses</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Submitted</th>
                  <th className="p-4">
                    <span className="sr-only">Review</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <QueueRow
                    key={row.id}
                    row={row}
                    checked={selected[row.id] !== undefined}
                    disabled={!selected[row.id] && selectedCount >= BULK_LIMIT}
                    toggle={() =>
                      setSelected((current) => {
                        const next = { ...current };
                        next[row.id] === undefined
                          ? (next[row.id] = row.revision)
                          : delete next[row.id];
                        return next;
                      })
                    }
                    detailPath={`/events/${eventId}/subevents/${subeventId}/registrations/${row.id}${queryString ? `?${queryString}` : ""}`}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {queue.data?.meta.totalRecords ?? 0} registrations - page{" "}
              {queue.data?.meta.page ?? filters.page} of{" "}
              {Math.max(1, queue.data?.meta.totalPages ?? 1)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                aria-label="Previous page"
                disabled={filters.page <= 1}
                onClick={() => updateFilter("page", String(filters.page - 1))}
              >
                <ChevronLeft />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                aria-label="Next page"
                disabled={filters.page >= (queue.data?.meta.totalPages ?? 1)}
                onClick={() => updateFilter("page", String(filters.page + 1))}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <BulkDialog
        action={bulkAction}
        count={selectedCount}
        reason={reason}
        setReason={setReason}
        error={error}
        pending={bulk.isPending}
        close={() => {
          setBulkAction(undefined);
          setReason("");
          setError("");
        }}
        confirm={confirmBulk}
      />
    </div>
  );
};

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  labels = {},
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  labels?: Record<string, string>;
}) => (
  <label>
    <span className="sr-only">{label}</span>
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm"
    >
      <option value="ALL">
        All {label.toLowerCase().replace(" registrations", "")}
      </option>
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option] ?? titleCase(option)}
        </option>
      ))}
    </select>
  </label>
);

const statusTone = (status: string) =>
  status === "APPROVED" || status === "LOCKED"
    ? "success"
    : status === "REJECTED" ||
        status === "CANCELLED" ||
        status === "NEEDS_CORRECTION"
      ? "danger"
      : status.includes("PENDING") || status === "SUBMITTED"
        ? "warning"
        : "neutral";
const QueueBadge = ({ status }: { status: string | null }) =>
  status ? (
    <Badge variant={statusTone(status)}>{titleCase(status)}</Badge>
  ) : (
    <span className="text-muted-foreground">-</span>
  );

const QueueRow = ({
  row,
  checked,
  disabled,
  toggle,
  detailPath,
}: {
  row: RegistrationQueueItem;
  checked: boolean;
  disabled: boolean;
  toggle: () => void;
  detailPath: string;
}) => (
  <tr className="transition-colors hover:bg-muted/20">
    <td className="p-4">
      <Checkbox
        aria-label={`Select ${row.participant.name}`}
        checked={checked}
        disabled={disabled}
        onCheckedChange={toggle}
      />
    </td>
    <td className="p-4">
      <p className="font-semibold">{row.participant.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {row.participant.nim ?? row.participant.email}
      </p>
    </td>
    <td className="p-4 font-mono text-xs">{row.orderNumber}</td>
    <td className="p-4">
      <QueueBadge status={row.status} />
    </td>
    <td className="p-4">
      <QueueBadge status={row.responseStatus} />
    </td>
    <td className="p-4">
      <QueueBadge status={row.paymentStatus} />
    </td>
    <td className="p-4 text-xs text-muted-foreground">
      {dateTime(row.submittedAt ?? row.createdAt)}
    </td>
    <td className="p-4 text-right">
      <Button size="sm" variant="secondary" asChild>
        <Link to={detailPath}>Review</Link>
      </Button>
    </td>
  </tr>
);

const BulkDialog = ({
  action,
  count,
  reason,
  setReason,
  error,
  pending,
  close,
  confirm,
}: {
  action?: BulkReviewAction;
  count: number;
  reason: string;
  setReason: (value: string) => void;
  error: string;
  pending: boolean;
  close: () => void;
  confirm: () => void;
}) => {
  const requiresReason = action === "reject" || action === "cancel";
  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {action
              ? `${titleCase(action)} ${count} registrations?`
              : "Bulk action"}
          </DialogTitle>
          <DialogDescription>
            This atomic action uses each selected registration's current
            revision. If one changed, none will be updated.
          </DialogDescription>
        </DialogHeader>
        <label className="space-y-2">
          <span className="text-sm font-semibold">
            Reason {requiresReason ? "*" : "(optional)"}
          </span>
          <textarea
            aria-label="Reason"
            rows={4}
            maxLength={1000}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="w-full rounded-lg border border-input bg-card p-3 text-sm"
            placeholder="Add clear context for this decision"
          />
        </label>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-semantic-danger-background p-3 text-sm text-semantic-danger"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={close}>
            Keep reviewing
          </Button>
          <Button
            variant={action === "cancel" ? "destructive" : "default"}
            disabled={pending || (requiresReason && !reason.trim())}
            onClick={confirm}
          >
            {pending ? "Applying..." : "Confirm action"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
