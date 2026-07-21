"use client";

import { useMemo, useState } from "react";
import {
  URGENCY_LABEL,
  type Practitioner,
  type PractitionerStatus,
} from "@/lib/practitioners";
import { formatShortDate } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
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
import { PractitionerReviewDialog } from "./practitioner-review-dialog";
import { TablePagination } from "../table-pagination";

const STATUS_BADGE: Record<
  PractitionerStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  active: { label: "Active", variant: "success" },
  paused: { label: "Paused", variant: "error" },
};

const PAGE_SIZE = 10;

export function PractitionersTable({
  initialPractitioners,
}: {
  initialPractitioners: Practitioner[];
}) {
  const [statuses, setStatuses] = useState<Record<string, PractitionerStatus>>(
    () =>
      Object.fromEntries(
        initialPractitioners.map((p) => [p.slug, p.initialStatus]),
      ),
  );
  const [reviewingSlug, setReviewingSlug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PractitionerStatus | "all">(
    "all",
  );

  function setStatus(slug: string, status: PractitionerStatus) {
    setStatuses((prev) => ({ ...prev, [slug]: status }));
  }

  const reviewing =
    initialPractitioners.find((p) => p.slug === reviewingSlug) ?? null;
  const needingAttention = initialPractitioners.filter(
    (p) => p.renewalUrgency !== "current",
  ).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialPractitioners.filter((p) => {
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || statuses[p.slug] === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [initialPractitioners, query, statusFilter, statuses]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  return (
    <>
      <p className="text-body text-ink-soft">
        {initialPractitioners.length} live practitioner
        {initialPractitioners.length === 1 ? "" : "s"}
        {needingAttention > 0 && (
          <>
            {" "}
            ·{" "}
            <span className="text-warning">
              {needingAttention} need{needingAttention === 1 ? "s" : ""}{" "}
              attention
            </span>
          </>
        )}
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
            setStatusFilter(v as PractitionerStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-6"
          title="No matches"
          description="Try a different search term or status filter."
        />
      ) : (
        <div className="mt-6 overflow-hidden rounded-card border border-linen bg-paper">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Practitioner</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead className="whitespace-nowrap">
                Insurance renewal
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((p) => {
              const status = statuses[p.slug];
              const statusBadge = STATUS_BADGE[status];
              return (
                <TableRow key={p.slug}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={p.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {p.name}
                        </p>
                        <p className="truncate text-micro text-stone">
                          {p.city}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {p.tier === "premium" ? (
                      <Badge variant="gold">Premium</Badge>
                    ) : (
                      <span className="text-ink-soft">Standard</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {p.regBody ? `${p.regBody} ${p.regNumber}` : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          p.renewalUrgency === "overdue"
                            ? "text-error"
                            : "text-ink-soft"
                        }
                      >
                        {formatShortDate(p.renewalDue)}
                      </span>
                      {p.renewalUrgency !== "current" && (
                        <Badge
                          variant={
                            p.renewalUrgency === "overdue"
                              ? "error"
                              : "warning"
                          }
                        >
                          {URGENCY_LABEL[p.renewalUrgency]}
                        </Badge>
                      )}
                    </div>
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
                      onClick={() => setReviewingSlug(p.slug)}
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

      <PractitionerReviewDialog
        practitioner={reviewing}
        status={reviewing ? statuses[reviewing.slug] : "active"}
        onOpenChange={(open) => {
          if (!open) setReviewingSlug(null);
        }}
        onStatusChange={setStatus}
      />
    </>
  );
}
