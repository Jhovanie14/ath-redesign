"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { TablePagination } from "@/components/dashboard/table-pagination";

const PAGE_SIZE = 10;

function latestMessageSnippet(enquiry: Enquiry): string {
  const latest = enquiry.messages[enquiry.messages.length - 1];
  if (!latest) return "";
  const body = latest.body.trim();
  return body.length > 90 ? `${body.slice(0, 90)}…` : body;
}

export function EnquiriesList({
  enquiries,
  now,
}: {
  enquiries: Enquiry[];
  now: Date;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">(
    "all",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      const matchesQuery =
        q === "" ||
        e.studentName.toLowerCase().includes(q) ||
        e.courseTitle.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || enquiryStatus(e, now) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [enquiries, query, statusFilter, now]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  if (enquiries.length === 0) {
    return (
      <div className="rounded-card border border-linen bg-paper px-6 py-16 text-center">
        <p className="font-display text-title text-ink">No enquiries yet</p>
        <p className="mt-1.5 text-small text-ink-soft">
          Student enquiries will appear here once they start coming in.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by student or course"
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
            setStatusFilter(v as EnquiryStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
        <div className="mt-6 flex flex-col gap-3">
          {pageItems.map((enquiry) => {
            const status = enquiryStatus(enquiry, now);
            const badge = STATUS_BADGE[status];
            return (
              <Link
                key={enquiry.id}
                href={`/trainer/enquiries/${enquiry.id}`}
                className="flex items-center gap-4 rounded-card border border-linen bg-paper px-5 py-4 transition-colors hover:border-stone"
              >
                <InitialsAvatar name={enquiry.studentName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">
                      {enquiry.studentName}
                    </p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-small text-ink-soft">
                    {latestMessageSnippet(enquiry)}
                  </p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-small text-ink-soft">
                  {formatShortDate(enquiry.receivedAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <TablePagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </>
  );
}
