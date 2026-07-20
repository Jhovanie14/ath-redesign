import Link from "next/link";
import type { Application } from "@/lib/applications";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PendingApplicationsCard({
  applications,
}: {
  applications: Application[];
}) {
  const pending = applications
    .filter((a) => a.status === "pending")
    .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
  const shown = pending.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending applications</CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-small text-ink-soft">No pending applications.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((app) => (
              <li
                key={app.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{app.name}</p>
                  <p className="truncate text-micro text-stone">
                    Submitted {formatShortDate(app.submittedAt)}
                  </p>
                </div>
                <Badge variant={app.tier === "premium" ? "gold" : "neutral"}>
                  {app.tier === "premium" ? "Premium" : "Standard"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/applications"
          className="mt-4 inline-block text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          View all →
        </Link>
      </CardContent>
    </Card>
  );
}
