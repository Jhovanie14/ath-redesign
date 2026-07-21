"use client";

import { useMemo, useState } from "react";
import type { AdminReview, ReviewStatus } from "@/lib/reviews";
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
import { RatingStars } from "@/components/rating-stars";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReviewDetailDialog } from "./review-detail-dialog";
import { TablePagination } from "../table-pagination";

const STATUS_BADGE: Record<
  ReviewStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  visible: { label: "Visible", variant: "success" },
  hidden: { label: "Hidden", variant: "error" },
};

const PAGE_SIZE = 10;

export function ReviewsTable({
  initialReviews,
}: {
  initialReviews: AdminReview[];
}) {
  const [statuses, setStatuses] = useState<Record<string, ReviewStatus>>(() =>
    Object.fromEntries(initialReviews.map((r) => [r.id, r.initialStatus])),
  );
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">(
    "all",
  );

  function setStatus(id: string, status: ReviewStatus) {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  }

  const reviewing = initialReviews.find((r) => r.id === reviewingId) ?? null;
  const hiddenCount = Object.values(statuses).filter(
    (s) => s === "hidden",
  ).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialReviews.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.practitionerName.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q) ||
        r.studentInitials.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || statuses[r.id] === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [initialReviews, query, statusFilter, statuses]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  if (initialReviews.length === 0) {
    return (
      <div className="rounded-card border border-linen bg-paper px-6 py-16 text-center">
        <p className="font-display text-title text-ink">No reviews yet</p>
        <p className="mt-1.5 text-small text-ink-soft">
          Student reviews will appear here once bookings start coming in.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="text-body text-ink-soft">
        {initialReviews.length} review{initialReviews.length === 1 ? "" : "s"}
        {hiddenCount > 0 && (
          <>
            {" "}
            ·{" "}
            <span className="text-warning">
              {hiddenCount} hidden
            </span>
          </>
        )}
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by practitioner, course, or reviewer"
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
            setStatusFilter(v as ReviewStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="visible">Visible</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
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
              <TableHead>Reviewer</TableHead>
              <TableHead>Practitioner</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="whitespace-nowrap">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((review) => {
              const status = statuses[review.id];
              const statusBadge = STATUS_BADGE[status];
              return (
                <TableRow key={review.id}>
                  <TableCell>
                    <span className="font-data text-small text-ink">
                      {review.studentInitials}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink">
                    {review.practitionerName}
                  </TableCell>
                  <TableCell className="text-ink-soft">
                    {review.courseTitle}
                  </TableCell>
                  <TableCell>
                    <RatingStars rating={review.rating} size={14} />
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-ink-soft">
                    {formatShortDate(review.date)}
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
                      onClick={() => setReviewingId(review.id)}
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

      <ReviewDetailDialog
        review={reviewing}
        status={reviewing ? statuses[reviewing.id] : "visible"}
        onOpenChange={(open) => {
          if (!open) setReviewingId(null);
        }}
        onStatusChange={setStatus}
      />
    </>
  );
}
