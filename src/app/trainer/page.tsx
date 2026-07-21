import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { DEMO_ENQUIRIES, enquiryStatus } from "@/lib/enquiries";
import { formatGBP } from "@/lib/utils";
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
          value={stats.activeCourses}
          caption={stats.activeCoursesNote}
        />
        <StatCard
          label="Profile views (30 days)"
          value={stats.profileViews30d}
          caption={stats.profileViewsNote}
        />
      </div>

      <Card className="mt-5">
        <CardContent>
          <h2 className="font-display text-title text-ink">
            Your subscription
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-ink-soft">
            <Badge variant="gold">{stats.subscription.tier}</Badge>
            <span className="font-data text-ink">
              {formatGBP(stats.subscription.priceGBP)}/month
            </span>
            <span>Status: {stats.subscription.status}</span>
            <span>Renews {stats.subscription.renewsOn}</span>
            <span className="text-stone">
              Plan changes &amp; billing history arrive here soon.
            </span>
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
