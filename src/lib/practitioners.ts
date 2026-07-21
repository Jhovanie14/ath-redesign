import type { Trainer } from "./types";

export type RenewalUrgency = "overdue" | "due-soon" | "current";
export type PractitionerStatus = "active" | "paused";

const DUE_SOON_WINDOW_DAYS = 45;

export interface Practitioner {
  slug: string;
  name: string;
  city: string;
  headline: string;
  tier: Trainer["tier"];
  rating: number;
  reviewCount: number;
  regBody?: string;
  regNumber?: string;
  renewalDue: string; // ISO date
  renewalUrgency: RenewalUrgency;
  daysUntilRenewal: number;
  /** Auto-paused when cover has already lapsed — matches the public promise
   * ("Listings pause automatically if cover lapses") in verification-panel.tsx. */
  initialStatus: PractitionerStatus;
}

/** Shared so the trainer-side Overview grades its own renewal against the
 * same thresholds the admin Practitioners table uses (see trainer-insights.ts). */
export function renewalUrgency(days: number): RenewalUrgency {
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_WINDOW_DAYS) return "due-soon";
  return "current";
}

export const URGENCY_LABEL: Record<RenewalUrgency, string> = {
  overdue: "Overdue",
  "due-soon": "Due soon",
  current: "",
};

export function toPractitioners(trainers: Trainer[], now: Date): Practitioner[] {
  const msPerDay = 1000 * 60 * 60 * 24;
  return trainers
    .map((t) => {
      const daysUntilRenewal = Math.round(
        (new Date(t.verification.nextRenewalDue).getTime() - now.getTime()) /
          msPerDay,
      );
      const urgency = renewalUrgency(daysUntilRenewal);
      return {
        slug: t.slug,
        name: t.name,
        city: t.city,
        headline: t.headline,
        tier: t.tier,
        rating: t.rating,
        reviewCount: t.reviewCount,
        regBody: t.verification.professionalRegistration?.body,
        regNumber: t.verification.professionalRegistration?.number,
        renewalDue: t.verification.nextRenewalDue,
        renewalUrgency: urgency,
        daysUntilRenewal,
        initialStatus: urgency === "overdue" ? "paused" : "active",
      } satisfies Practitioner;
    })
    .sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);
}
