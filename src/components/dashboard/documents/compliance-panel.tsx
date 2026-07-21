import type { VerificationSnapshot } from "@/lib/trainer-insights";
import { VERIFICATION_URGENCY_BADGE } from "@/lib/trainer-insights";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BEFORE_UPLOADING = [
  "Use clear, complete documents",
  "Make sure expiry dates are visible",
  "Avoid cropped or blurry files",
  "Accepted formats: PDF, JPG, PNG",
];

export function CompliancePanel({
  snapshot,
  verifiedCount,
  totalCount,
}: {
  snapshot: VerificationSnapshot;
  verifiedCount: number;
  totalCount: number;
}) {
  const badge = VERIFICATION_URGENCY_BADGE[snapshot.urgency];
  const percent = Math.round((verifiedCount / totalCount) * 100);

  return (
    <div className="flex flex-col gap-5 lg:sticky lg:top-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2.5">
            Compliance overview
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-small text-ink-soft">
            {verifiedCount} of {totalCount} documents verified
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-linen">
            <div
              className="h-full rounded-full bg-success transition-[width] duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>

          <div className="mt-5 border-t border-linen pt-4">
            {snapshot.urgency === "overdue" ? (
              <p className="text-small text-ink-soft">
                Cover lapsed on{" "}
                <span className="font-medium text-error">
                  {formatShortDate(snapshot.renewalDue)}
                </span>
                . Your listing is paused until it&rsquo;s renewed.
              </p>
            ) : (
              <>
                <p className="text-body font-medium text-ink">
                  Next renewal {formatShortDate(snapshot.renewalDue)}
                </p>
                <p className="mt-1 text-small text-stone">
                  {snapshot.daysUntilRenewal} days remaining
                </p>
              </>
            )}
          </div>

          <p className="mt-4 text-small leading-relaxed text-ink-soft">
            Your listings remain active while all required documents are
            valid.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-card border border-linen bg-linen/30 p-5">
        <p className="text-small font-semibold text-ink">Before uploading</p>
        <ul className="mt-3 flex flex-col gap-1.5 text-small text-ink-soft">
          {BEFORE_UPLOADING.map((line) => (
            <li key={line} className="flex items-baseline gap-2">
              <span aria-hidden="true" className="text-stone">
                &middot;
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
