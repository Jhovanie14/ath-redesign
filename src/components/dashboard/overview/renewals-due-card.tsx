import Link from "next/link";
import { URGENCY_LABEL, type Practitioner } from "@/lib/practitioners";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RenewalsDueCard({
  practitioners,
}: {
  practitioners: Practitioner[];
}) {
  const due = practitioners.filter((p) => p.renewalUrgency !== "current");
  const shown = due.slice(0, 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Renewals due</CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-small text-ink-soft">No renewals due soon.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((p) => (
              <li
                key={p.slug}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="truncate text-micro text-stone">{p.city}</p>
                </div>
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
                  <Badge
                    variant={
                      p.renewalUrgency === "overdue" ? "error" : "warning"
                    }
                  >
                    {URGENCY_LABEL[p.renewalUrgency]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/admin/practitioners"
          className="mt-4 inline-block text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          View all →
        </Link>
      </CardContent>
    </Card>
  );
}
