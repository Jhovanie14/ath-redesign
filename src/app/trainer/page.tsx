import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { DEMO_ENQUIRIES, enquiryStatus } from "@/lib/enquiries";
import { getRepository } from "@/lib/repository";
import { toSubscriptions } from "@/lib/billing";
import { formatGBP, formatShortDate } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { logoutTrainer } from "./actions";

export const metadata: Metadata = {
  title: "Trainer dashboard",
};

export default async function TrainerDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const stats = DEMO_TRAINER_STATS;
  const now = new Date();
  const newEnquiryCount = DEMO_ENQUIRIES.filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  const activeCourses = (trainer?.courses ?? []).filter((c) => !c.archived);
  const activeCourseCount = activeCourses.length;
  const cheapestActivePrice =
    activeCourses.length > 0
      ? Math.min(...activeCourses.map((c) => c.priceGBP))
      : null;

  const trainers = await getRepository().getAll();
  const subscription = toSubscriptions(trainers, now).find(
    (s) => s.slug === "dr-amara-okafor",
  );

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">
            Welcome back, {session.name}
          </h1>
          <p className="mt-1.5 text-body text-ink-soft">
            Here&rsquo;s how your listing is doing.
          </p>
        </div>
        {stats.liveInSearch && <Badge variant="neutral">Live in search</Badge>}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New enquiries"
          value={newEnquiryCount}
          caption={newEnquiryCount > 0 ? "Awaiting your reply" : "All read"}
        />
        <StatCard
          label="Bookings"
          value={stats.bookings}
          caption={stats.bookingsNote}
        />
        <StatCard
          label="Active courses"
          value={activeCourseCount}
          caption={
            cheapestActivePrice !== null
              ? `From ${formatGBP(cheapestActivePrice)}`
              : "None listed yet"
          }
        />
        <StatCard
          label="Profile views (30 days)"
          value={stats.profileViews30d}
          caption={stats.profileViewsNote}
        />
      </div>

      {subscription && (
        <Card className="mt-5">
          <CardContent>
            <h2 className="font-display text-title text-ink">
              Your subscription
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-ink-soft">
              {subscription.tier === "premium" ? (
                <Badge variant="gold">Premium</Badge>
              ) : (
                <span className="text-ink-soft">Standard</span>
              )}
              <span className="font-data text-ink">
                {formatGBP(subscription.priceGBP)}/
                {subscription.cycle === "annual" ? "year" : "month"}
              </span>
              <span>
                Status:{" "}
                {subscription.initialStatus === "active"
                  ? "Active"
                  : "Cancelled"}
              </span>
              <span>Renews {formatShortDate(subscription.renewsOn)}</span>
              <Link
                href="/trainer/billing"
                className="text-ink underline-offset-4 hover:underline"
              >
                Manage billing
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
