import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toSubscriptions, totalMRR } from "@/lib/billing";
import { toPractitioners } from "@/lib/practitioners";
import { toAdminReviews } from "@/lib/reviews";
import { DEMO_APPLICATIONS } from "@/lib/applications";
import { DEMO_ADMIN_STATS } from "@/lib/dashboard-stats";
import {
  getCategoryMix,
  getRatingDistribution,
  getRevenueTrend,
  getTierBillingMix,
} from "@/lib/dashboard-charts";
import { formatGBP } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { NeedsAttentionSection } from "@/components/dashboard/overview/needs-attention-section";
import { RevenueTrendChart } from "@/components/dashboard/overview/revenue-trend-chart";
import { CategoryMixChart } from "@/components/dashboard/overview/category-mix-chart";
import { TierBillingChart } from "@/components/dashboard/overview/tier-billing-chart";
import { RatingDistributionChart } from "@/components/dashboard/overview/rating-distribution-chart";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const now = new Date();
  const stats = DEMO_ADMIN_STATS;
  const trainers = await getRepository().getAll();

  const subscriptions = toSubscriptions(trainers, now);
  const activeSubscriptions = subscriptions.filter(
    (s) => s.initialStatus === "active",
  );
  const activeSubscribers = activeSubscriptions.length;
  const mrrGBP = totalMRR(activeSubscriptions);

  const practitioners = toPractitioners(trainers, now);
  const insuranceExpiring = practitioners.filter(
    (p) => p.renewalUrgency !== "current",
  ).length;

  const pendingApplications = DEMO_APPLICATIONS.filter(
    (a) => a.status === "pending",
  ).length;

  const reviews = toAdminReviews(trainers);

  const trend = getRevenueTrend(trainers, now);
  const categoryMix = getCategoryMix(trainers);
  const tierBillingMix = getTierBillingMix(subscriptions);
  const ratingDistribution = getRatingDistribution(reviews);

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Overview</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        The state of the marketplace at a glance.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Pending applications"
          value={pendingApplications}
          caption="Awaiting review"
        />
        <StatCard
          label="Active subscribers"
          value={activeSubscribers}
          caption="Live, paying practitioners"
        />
        <StatCard
          label="Monthly recurring revenue"
          value={formatGBP(mrrGBP)}
          caption={stats.mrrNote}
        />
        <StatCard
          label="Insurance expiring"
          value={insuranceExpiring}
          caption="Within 45 days (or lapsed)"
        />
        <StatCard
          label="Churn this month"
          value={stats.churnThisMonth}
          caption="Subscriptions cancelled"
        />
      </div>

      <h2 className="mt-10 font-display text-title text-ink">
        Needs attention
      </h2>
      <div className="mt-4">
        <NeedsAttentionSection
          applications={DEMO_APPLICATIONS}
          practitioners={practitioners}
        />
      </div>

      <h2 className="mt-10 font-display text-title text-ink">Insights</h2>
      <div className="mt-4 flex flex-col gap-5">
        <RevenueTrendChart data={trend} />
        <div className="grid gap-5 xl:grid-cols-3">
          <CategoryMixChart data={categoryMix} />
          <TierBillingChart data={tierBillingMix} />
          <RatingDistributionChart
            counts={ratingDistribution.counts}
            average={ratingDistribution.average}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
