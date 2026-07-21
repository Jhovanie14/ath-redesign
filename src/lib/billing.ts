import type { Trainer } from "./types";

export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "active" | "cancelled";

export interface Subscription {
  slug: string;
  name: string;
  city: string;
  tier: Trainer["tier"];
  cycle: BillingCycle;
  priceGBP: number; // price for the cycle (monthly or annual amount, not normalized)
  renewsOn: string; // ISO date
  /** Always "active" — no seed data starts cancelled. */
  initialStatus: SubscriptionStatus;
}

// Mirrors PLANS in src/components/pricing/pricing-plans.tsx.
const TIER_PRICE: Record<Trainer["tier"], Record<BillingCycle, number>> = {
  standard: { monthly: 24, annual: 240 },
  premium: { monthly: 69, annual: 690 },
};

export function priceForTier(tier: Trainer["tier"], cycle: BillingCycle): number {
  return TIER_PRICE[tier][cycle];
}

/** Mirrors PLANS[].features in src/components/pricing/pricing-plans.tsx, so
 * the trainer-side Billing page lists the same entitlements the public
 * pricing page sells — no separate, driftable copy of what each tier includes. */
export const TIER_FEATURES: Record<Trainer["tier"], string[]> = {
  standard: [
    "Verified listing on the Hub",
    "Appears in search and on the map",
    "Unlimited student enquiries",
    "Verified reviews from your students",
    "Full profile with courses and pricing",
  ],
  premium: [
    "Everything in Standard",
    "Premium badge and gold frame",
    "Priority placement in Recommended results",
    "Eligible for homepage feature slots",
    "Priority enquiries and support",
  ],
};

const CYCLE_LENGTH_DAYS: Record<BillingCycle, number> = {
  monthly: 30,
  annual: 365,
};

function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

export function toSubscriptions(trainers: Trainer[], now: Date): Subscription[] {
  return trainers
    .map((t, index): Subscription => {
      const cycle: BillingCycle = index % 3 === 2 ? "annual" : "monthly";
      const cycleLength = CYCLE_LENGTH_DAYS[cycle];
      const offset = (index * 7) % cycleLength;
      return {
        slug: t.slug,
        name: t.name,
        city: t.city,
        tier: t.tier,
        cycle,
        priceGBP: TIER_PRICE[t.tier][cycle],
        renewsOn: addDays(now, cycleLength - offset),
        initialStatus: "active",
      };
    })
    .sort((a, b) => a.renewsOn.localeCompare(b.renewsOn));
}

/** Sums monthly-equivalent revenue for the given subscriptions. Callers pass
 * only the subscriptions that should count (e.g. filtered to active). */
export function totalMRR(subscriptions: Subscription[]): number {
  return Math.round(
    subscriptions.reduce(
      (sum, s) => sum + (s.cycle === "annual" ? s.priceGBP / 12 : s.priceGBP),
      0,
    ),
  );
}
