import type { CourseCategory } from "./types";

// Placeholder application queue — the /apply wizard has no backend yet (see
// its own "no backend" note), so there's nowhere for real submissions to
// land. Same seam as dashboard-stats.ts: swap for a real query once /apply
// actually persists submissions.

export type ApplicationStatus = "pending" | "approved" | "rejected";
export type ApplicationTier = "standard" | "premium";
export type BillingCycle = "monthly" | "annual";

export interface ApplicationCourseDraft {
  title: string;
  category: CourseCategory;
  priceGBP: number;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  city: string;
  headline: string;
  yearsExperience: number;
  bio: string;
  categories: CourseCategory[];
  courses: ApplicationCourseDraft[];
  regBody: "GMC" | "NMC" | "GDC";
  regNumber: string;
  insuranceRenewal: string; // ISO date
  tier: ApplicationTier;
  billingCycle: BillingCycle;
  submittedAt: string; // ISO date
  status: ApplicationStatus;
}

export const DEMO_APPLICATIONS: Application[] = [
  {
    id: "app-1",
    name: "Dr Test Trainer",
    email: "test-trainer@example.com",
    city: "Leeds",
    headline: "Aesthetic Doctor & Injectables Trainer",
    yearsExperience: 6,
    bio: "Cosmetic doctor running small-group injectables training since 2021, focused on safe technique over volume.",
    categories: ["anti-wrinkle", "dermal-filler"],
    courses: [
      { title: "Foundation: Anti-Wrinkle & Dermal Filler", category: "foundation", priceGBP: 895 },
    ],
    regBody: "GMC",
    regNumber: "7654321",
    insuranceRenewal: "2027-02-01",
    tier: "premium",
    billingCycle: "monthly",
    submittedAt: "2026-07-06",
    status: "pending",
  },
  {
    id: "app-2",
    name: "Dr Test Trainer-Jhov",
    email: "testjhov@gmail.com",
    city: "Manchester",
    headline: "Aesthetic Nurse Prescriber & Trainer",
    yearsExperience: 9,
    bio: "Nurse prescriber teaching foundation and advanced injectables, with a focus on complication management.",
    categories: ["lip-filler", "advanced-injectables"],
    courses: [
      { title: "Advanced Injectables: Complication Management", category: "advanced-injectables", priceGBP: 1250 },
      { title: "Lip Filler Foundation", category: "lip-filler", priceGBP: 650 },
    ],
    regBody: "NMC",
    regNumber: "19N0442E",
    insuranceRenewal: "2026-11-15",
    tier: "premium",
    billingCycle: "annual",
    submittedAt: "2026-07-10",
    status: "pending",
  },
];
