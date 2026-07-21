"use client";

import { useMemo, useState } from "react";
import type { Subscription, SubscriptionStatus } from "@/lib/billing";
import { totalMRR } from "@/lib/billing";
import { formatGBP, formatShortDate } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InitialsAvatar } from "../initials-avatar";
import { SubscriptionReviewDialog } from "./subscription-review-dialog";
import { TablePagination } from "../table-pagination";

const STATUS_BADGE: Record<
  SubscriptionStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  active: { label: "Active", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

const PAGE_SIZE = 10;

export function BillingTable({
  initialSubscriptions,
}: {
  initialSubscriptions: Subscription[];
}) {
  const [statuses, setStatuses] = useState<Record<string, SubscriptionStatus>>(
    () =>
      Object.fromEntries(
        initialSubscriptions.map((s) => [s.slug, s.initialStatus]),
      ),
  );
  const [reviewingSlug, setReviewingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | "all">(
    "all",
  );

  function setStatus(slug: string, status: SubscriptionStatus) {
    setStatuses((prev) => ({ ...prev, [slug]: status }));
  }

  const reviewing =
    initialSubscriptions.find((s) => s.slug === reviewingSlug) ?? null;
  const activeSubscriptions = initialSubscriptions.filter(
    (s) => statuses[s.slug] === "active",
  );
  const mrr = totalMRR(activeSubscriptions);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialSubscriptions.filter((s) => {
      const matchesQuery =
        q === "" ||
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || statuses[s.slug] === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [initialSubscriptions, query, statusFilter, statuses]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  if (initialSubscriptions.length === 0) {
    return (
      <div className="rounded-card border border-linen bg-paper px-6 py-16 text-center">
        <p className="font-display text-title text-ink">No subscriptions yet</p>
        <p className="mt-1.5 text-small text-ink-soft">
          Practitioner subscriptions will appear here once listings go live.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-body text-ink-soft">
        {initialSubscriptions.length} subscription
        {initialSubscriptions.length === 1 ? "" : "s"} · {formatGBP(mrr)} MRR
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or city"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as SubscriptionStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No matches</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Try a different search term or status filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-linen bg-paper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Practitioner</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="whitespace-nowrap">Renews on</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((s) => {
              const status = statuses[s.slug];
              const statusBadge = STATUS_BADGE[status];
              return (
                <TableRow key={s.slug}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={s.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {s.name}
                        </p>
                        <p className="truncate text-micro text-stone">
                          {s.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {s.tier === "premium" ? (
                      <Badge variant="gold">Premium</Badge>
                    ) : (
                      <span className="text-ink-soft">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {s.cycle === "annual" ? "Annual" : "Monthly"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink">
                    {formatGBP(s.priceGBP)}
                    <span className="text-ink-soft">
                      /{s.cycle === "annual" ? "yr" : "mo"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {formatShortDate(s.renewsOn)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewingSlug(s.slug)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      )}

      <TablePagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <SubscriptionReviewDialog
        subscription={reviewing}
        status={reviewing ? statuses[reviewing.slug] : "active"}
        onOpenChange={(open) => {
          if (!open) setReviewingSlug(null);
        }}
        onStatusChange={setStatus}
      />
    </>
  );
}
