"use client";

import Link from "next/link";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { NewMessageDialog } from "./new-message-dialog";

function latestMessageSnippet(enquiry: Enquiry): string {
  const latest = enquiry.messages[enquiry.messages.length - 1];
  if (!latest) return "";
  const body = latest.body.trim();
  return body.length > 90 ? `${body.slice(0, 90)}…` : body;
}

export function StudentMessagesList({
  enquiries,
  courseTitles,
  now,
}: {
  enquiries: Enquiry[];
  courseTitles: string[];
  now: Date;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Messages</h1>
          <p className="mt-1.5 text-body text-ink-soft">
            Your conversations with your trainer.
          </p>
        </div>
        <NewMessageDialog courseTitles={courseTitles} />
      </div>

      <div className="mt-8">
        {enquiries.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send your first message to get started."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {enquiries.map((enquiry) => {
              const badge = STATUS_BADGE[enquiryStatus(enquiry, now)];
              return (
                <Link key={enquiry.id} href={`/student/messages/${enquiry.id}`}>
                  <Card className="rounded-2xl p-0 transition-colors hover:border-stone/40">
                    <CardContent className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-ink">
                            {enquiry.courseTitle}
                          </p>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-small text-ink-soft">
                          {latestMessageSnippet(enquiry)}
                        </p>
                      </div>
                      <p className="shrink-0 whitespace-nowrap text-micro text-stone">
                        {formatShortDate(enquiry.receivedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
