export type CourseCategory =
  | "lip-filler"
  | "anti-wrinkle"
  | "dermal-filler"
  | "skin-boosters"
  | "microneedling"
  | "chemical-peels"
  | "advanced-injectables"
  | "foundation"
  | "advanced";

export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  priceGBP: number;
  durationDays: number;
  cpdAccredited: boolean;
  maxDelegates: number;
  summary: string;
  archived?: boolean; // undefined/false = active. Optional so existing seed
                      // data across all trainers in trainers.json doesn't
                      // need to be touched.
}

export interface Review {
  id: string;
  studentInitials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  courseTitle: string;
  date: string; // ISO
  body: string;
  bookingVerified: true; // always true by design
}

export interface Verification {
  insuranceCheckedAt: string;
  qualificationCheckedAt: string;
  professionalRegistration?: {
    body: "GMC" | "NMC" | "GDC";
    number: string;
  };
  humanReviewedAt: string;
  nextRenewalDue: string;
}

export interface Trainer {
  slug: string;
  name: string;
  headline: string; // e.g. "Aesthetic Medical Practitioner & Trainer"
  city: string;
  lat: number;
  lng: number;
  tier: "premium" | "standard";
  rating: number;
  reviewCount: number;
  yearsExperience: number;
  studentsTrained: number;
  fromPriceGBP: number;
  bio: string;
  categories: CourseCategory[];
  courses: Course[];
  reviews: Review[];
  verification: Verification;
  availabilityNote: string; // e.g. "Next cohort: March 2026"
}

/** Human-readable labels for the nine course categories. */
export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  "lip-filler": "Lip filler",
  "anti-wrinkle": "Anti-wrinkle",
  "dermal-filler": "Dermal filler",
  "skin-boosters": "Skin boosters",
  microneedling: "Microneedling",
  "chemical-peels": "Chemical peels",
  "advanced-injectables": "Advanced injectables",
  foundation: "Foundation",
  advanced: "Advanced",
};

export const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as CourseCategory[];
