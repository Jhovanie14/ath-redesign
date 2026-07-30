// src/app/student/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  enquiryStatus,
  getEnquiriesForStudent,
  STATUS_BADGE,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Your dashboard",
};

function latestMessageSnippet(body: string): string {
  const trimmed = body.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed;
}

export default async function StudentOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const openCount = enquiries.filter(
    (e) => enquiryStatus(e, now) !== "archived",
  ).length;

  const recent = [...enquiries]
    .sort((a, b) => {
      const aLatest = a.messages[a.messages.length - 1]?.sentAt ?? a.receivedAt;
      const bLatest = b.messages[b.messages.length - 1]?.sentAt ?? b.receivedAt;
      return bLatest.localeCompare(aLatest);
    })
    .slice(0, 3);

  return (
    <StudentShell session={session}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">
            Welcome back, {session.name}
          </h1>
          <p className="mt-1.5 text-body text-ink-soft">
            {openCount > 0
              ? `You have ${openCount} open ${openCount === 1 ? "enquiry" : "enquiries"}.`
              : "You're all caught up."}
          </p>
        </div>
        <Button asChild>
          <Link href="/student/messages">Go to messages</Link>
        </Button>
      </div>

      <h2 className="mt-10 font-display text-title text-ink">
        Recent activity
      </h2>
      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start a conversation with your trainer from the Messages page."
            action={
              <Button asChild>
                <Link href="/student/messages">Send a message</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recent.map((enquiry) => {
              const badge = STATUS_BADGE[enquiryStatus(enquiry, now)];
              const latest = enquiry.messages[enquiry.messages.length - 1];
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
                        {latest && (
                          <p className="mt-0.5 truncate text-small text-ink-soft">
                            {latestMessageSnippet(latest.body)}
                          </p>
                        )}
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
    </StudentShell>
  );
}
