// Placeholder dashboard metrics — there is no backend yet (same "mock now,
// wire up later" seam as getRepository() in ./repository.ts). Swap these for
// real queries once bookings/billing exist.
//
// newEnquiries is derived live from DEMO_ENQUIRIES/enquiryStatus() in
// src/lib/enquiries.ts, and activeCourses is derived live from
// trainer.courses (see src/app/trainer/page.tsx) — no separate stubs for
// either, so Overview can't silently drift from the Enquiries or Courses
// pages it summarizes.

export interface TrainerStats {
  liveInSearch: boolean;
  bookings: number;
  bookingsNote: string;
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
  bookings: 14,
  bookingsNote: "Confirmed on the Hub",
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
  mrrNote: string;
  churnThisMonth: number;
}

// activeSubscribers, mrrGBP, insuranceExpiring, and pendingApplications are
// all derived live — the first two from toSubscriptions()/totalMRR() in
// src/lib/billing.ts, the third from toPractitioners()'s renewalUrgency in
// src/lib/practitioners.ts, and the fourth from filtering DEMO_APPLICATIONS
// in src/lib/applications.ts (see src/app/admin/page.tsx) — so Overview
// always agrees with Billing, Practitioners, and the applications queue. No
// separate stub for any of the four.
export const DEMO_ADMIN_STATS: AdminStats = {
  mrrNote: "Annual plans counted at 1/12",
  churnThisMonth: 0,
};
