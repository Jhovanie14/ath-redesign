// Placeholder dashboard metrics — there is no backend yet (same "mock now,
// wire up later" seam as getRepository() in ./repository.ts). Swap these for
// real queries once applications/bookings/billing exist.

export interface TrainerStats {
  liveInSearch: boolean;
  newEnquiries: number;
  enquiriesNote: string;
  bookings: number;
  bookingsNote: string;
  activeCourses: number;
  activeCoursesNote: string;
  profileViews30d: number;
  profileViewsNote: string;
  subscription: {
    tier: "Premium" | "Standard";
    priceGBP: number;
    status: "Active" | "Past due" | "Cancelled";
    renewsOn: string;
  };
}

export const DEMO_TRAINER_STATS: TrainerStats = {
  liveInSearch: true,
  newEnquiries: 1,
  enquiriesNote: "All read",
  bookings: 14,
  bookingsNote: "Confirmed on the Hub",
  activeCourses: 2,
  activeCoursesNote: "From £550",
  profileViews30d: 86,
  profileViewsNote: "Rated 4.7 · 9 verified reviews",
  subscription: {
    tier: "Premium",
    priceGBP: 249,
    status: "Active",
    renewsOn: "21 July 2026",
  },
};

export interface AdminStats {
  pendingApplications: number;
  mrrNote: string;
  churnThisMonth: number;
}

// activeSubscribers, mrrGBP, and insuranceExpiring are all derived live — the
// first two from toSubscriptions()/totalMRR() in src/lib/billing.ts, the last
// from toPractitioners()'s renewalUrgency in src/lib/practitioners.ts (see
// src/app/admin/page.tsx) — so Overview always agrees with Billing and
// Practitioners. No separate stub for any of the three.
export const DEMO_ADMIN_STATS: AdminStats = {
  pendingApplications: 2,
  mrrNote: "Annual plans counted at 1/12",
  churnThisMonth: 0,
};
