"use client";

import { useMemo, useState } from "react";
import type { Application, ApplicationStatus } from "@/lib/applications";
import { formatShortDate } from "@/lib/utils";
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
import { ApplicationReviewDialog } from "./application-review-dialog";
import { TablePagination } from "../table-pagination";

const STATUS_BADGE: Record<
  ApplicationStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  pending: { label: "Pending", variant: "neutral" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Declined", variant: "error" },
};

const PAGE_SIZE = 10;

export function ApplicationsTable({
  initialApplications,
}: {
  initialApplications: Application[];
}) {
  const [applications, setApplications] = useState(initialApplications);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">(
    "all",
  );

  function setStatus(id: string, status: ApplicationStatus) {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  }

  const reviewing = applications.find((a) => a.id === reviewingId) ?? null;
  const pendingCount = applications.filter((a) => a.status === "pending").length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return applications.filter((a) => {
      const matchesQuery =
        q === "" ||
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [applications, query, statusFilter]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  if (applications.length === 0) {
    return (
      <div className="rounded-card border border-linen bg-paper px-6 py-16 text-center">
        <p className="font-display text-title text-ink">No applications yet</p>
        <p className="mt-1.5 text-small text-ink-soft">
          New trainer applications will appear here as they come in.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-body text-ink-soft">
        {pendingCount} application{pendingCount === 1 ? "" : "s"} in the
        queue, oldest first.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by name or email"
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
            setStatusFilter(v as ApplicationStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Declined</SelectItem>
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
              <TableHead>Applicant</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="whitespace-nowrap">Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((app) => {
              const status = STATUS_BADGE[app.status];
              return (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={app.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink">
                          {app.name}
                        </p>
                        <p className="truncate text-micro text-stone">
                          {app.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {app.tier === "premium" ? (
                      <Badge variant="gold">Premium</Badge>
                    ) : (
                      <span className="text-ink-soft">Standard</span>
                    )}
                    <span className="ml-1.5 capitalize text-stone">
                      · {app.billingCycle}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {formatShortDate(app.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewingId(app.id)}
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

      <ApplicationReviewDialog
        application={reviewing}
        onOpenChange={(open) => {
          if (!open) setReviewingId(null);
        }}
        onDecide={setStatus}
      />
    </>
  );
}
