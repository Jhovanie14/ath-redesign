import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { enquiryStatus, listEnquiries } from "@/lib/enquiries";
import { getRepository } from "@/lib/repository";
import { toSubscriptions } from "@/lib/billing";
import { getRatingDistribution } from "@/lib/dashboard-charts";
import {
  getAwaitingReply,
  getCourseLineup,
  getEnquiryActivity,
  getEnquiryFunnel,
  getUpcomingBookings,
  getVerificationSnapshot,
} from "@/lib/trainer-insights";
import { formatGBP } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { ReviewRatingsChart } from "@/components/dashboard/trainer-overview/review-ratings-chart";
import { AwaitingReplyCard } from "@/components/dashboard/trainer-overview/awaiting-reply-card";
import { UpcomingBookingsCard } from "@/components/dashboard/trainer-overview/upcoming-bookings-card";
import { VerificationStatusCard } from "@/components/dashboard/trainer-overview/verification-status-card";
import { EnquiryActivityChart } from "@/components/dashboard/trainer-overview/enquiry-activity-chart";
import { CourseLineupChart } from "@/components/dashboard/trainer-overview/course-lineup-chart";
import { SubscriptionCard } from "@/components/dashboard/trainer-overview/subscription-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { logoutTrainer } from "./actions";

export const metadata: Metadata = {
  title: "Trainer dashboard",
};

const DEMO_TRAINER_SLUG = "dr-amara-okafor";

export default async function TrainerDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const stats = DEMO_TRAINER_STATS;
  const now = new Date();

  const trainer = await getRepository().getBySlug(DEMO_TRAINER_SLUG);
  const trainers = await getRepository().getAll();

  // Enquiry-derived — same source the Enquiries page reads.
  const newEnquiryCount = listEnquiries().filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;
  const awaitingReply = getAwaitingReply(listEnquiries());
  const upcomingBookings = getUpcomingBookings(listEnquiries(), now);
  const enquiryActivity = getEnquiryActivity(listEnquiries(), now);
  const enquiryFunnel = getEnquiryFunnel(listEnquiries(), now);

  // Course-derived — same source the Courses page reads.
  const courseLineup = getCourseLineup(trainer?.courses ?? []);
  const cheapestActivePrice =
    courseLineup.length > 0
      ? Math.min(...courseLineup.map((c) => c.priceGBP))
      : null;

  // Review-derived — same histogram the admin Overview uses.
  const ratingDistribution = getRatingDistribution(trainer?.reviews ?? []);

  const verification = trainer
    ? getVerificationSnapshot(trainer.verification, now)
    : null;

  const subscription = toSubscriptions(trainers, now).find(
    (s) => s.slug === DEMO_TRAINER_SLUG,
  );

  return (
    <DashboardShell
      session={session}
      publicProfileHref={`/trainer/${DEMO_TRAINER_SLUG}`}
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
        <div className="flex flex-wrap items-center gap-3">
          {stats.liveInSearch && <Badge variant="success">Live in search</Badge>}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/trainer/${DEMO_TRAINER_SLUG}`}>
              View public profile
            </Link>
          </Button>
        </div>
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
          value={courseLineup.length}
          caption={
            cheapestActivePrice !== null
              ? `From ${formatGBP(cheapestActivePrice)}`
              : "None listed yet"
          }
        />
        <StatCard
          label="Profile views (30 days)"
          value={stats.profileViews30d}
          caption={
            trainer
              ? `Rated ${trainer.rating.toFixed(1)} · ${trainer.reviewCount} verified reviews`
              : "No reviews yet"
          }
        />
      </div>

      <h2 className="mt-10 font-display text-title text-ink">
        Needs attention
      </h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        <AwaitingReplyCard enquiries={awaitingReply} />
        <UpcomingBookingsCard
          bookings={upcomingBookings}
          footerHref="/trainer/availability"
        />
        {verification && <VerificationStatusCard snapshot={verification} />}
      </div>

      <h2 className="mt-10 font-display text-title text-ink">Insights</h2>
      <div className="mt-4 flex flex-col gap-5">
        <EnquiryActivityChart
          data={enquiryActivity}
          funnel={enquiryFunnel}
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <CourseLineupChart data={courseLineup} />
          <ReviewRatingsChart
            rating={trainer?.rating ?? 0}
            reviewCount={trainer?.reviewCount ?? 0}
            distribution={ratingDistribution}
          />
        </div>
      </div>

      {subscription && (
        <>
          <h2 className="mt-10 font-display text-title text-ink">Your plan</h2>
          <div className="mt-4">
            <SubscriptionCard subscription={subscription} />
          </div>
        </>
      )}
    </DashboardShell>
  );
}
