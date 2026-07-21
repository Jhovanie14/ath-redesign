import type { Application } from "@/lib/applications";
import type { Practitioner } from "@/lib/practitioners";
import { Card, CardContent } from "@/components/ui/card";
import { PendingApplicationsCard } from "./pending-applications-card";
import { RenewalsDueCard } from "./renewals-due-card";

export function NeedsAttentionSection({
  applications,
  practitioners,
}: {
  applications: Application[];
  practitioners: Practitioner[];
}) {
  const pendingCount = applications.filter(
    (a) => a.status === "pending",
  ).length;
  const dueCount = practitioners.filter(
    (p) => p.renewalUrgency !== "current",
  ).length;

  if (pendingCount === 0 && dueCount === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="font-display text-title text-ink">All caught up</p>
          <p className="mt-1.5 text-small text-ink-soft">
            No pending applications and no renewals due soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PendingApplicationsCard applications={applications} />
      <RenewalsDueCard practitioners={practitioners} />
    </div>
  );
}
