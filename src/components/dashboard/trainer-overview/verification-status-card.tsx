import Link from "next/link";
import { Check } from "lucide-react";
import type { VerificationSnapshot } from "@/lib/trainer-insights";
import { VERIFICATION_URGENCY_BADGE } from "@/lib/trainer-insights";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VerificationStatusCard({
  snapshot,
}: {
  snapshot: VerificationSnapshot;
}) {
  const badge = VERIFICATION_URGENCY_BADGE[snapshot.urgency];

  const checks = [
    { label: "Insurance", checkedAt: snapshot.insuranceCheckedAt },
    { label: "Qualifications", checkedAt: snapshot.qualificationCheckedAt },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          Verification
          {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {checks.map((check) => (
            <li key={check.label} className="flex items-center gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                aria-hidden="true"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-small text-ink">{check.label}</span>
              <span className="ml-auto whitespace-nowrap font-data text-micro text-stone">
                {formatShortDate(check.checkedAt)}
              </span>
            </li>
          ))}

          {snapshot.regBody && (
            <li className="flex items-center gap-2.5">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success"
                aria-hidden="true"
              >
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              <span className="text-small text-ink">{snapshot.regBody}</span>
              <span className="ml-auto whitespace-nowrap font-data text-micro text-stone">
                {snapshot.regNumber}
              </span>
            </li>
          )}
        </ul>

        <p className="mt-4 border-t border-linen pt-4 text-small text-ink-soft">
          {snapshot.urgency === "overdue" ? (
            <>
              Cover lapsed on{" "}
              <span className="font-medium text-error">
                {formatShortDate(snapshot.renewalDue)}
              </span>
              . Your listing is paused until it&rsquo;s renewed.
            </>
          ) : (
            <>
              Next renewal{" "}
              <span className="font-medium text-ink">
                {formatShortDate(snapshot.renewalDue)}
              </span>{" "}
              &middot; {snapshot.daysUntilRenewal} days away
            </>
          )}
        </p>

        <Link
          href="/trainer/documents"
          className="mt-4 inline-block text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          Manage documents &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
