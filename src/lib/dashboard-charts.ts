// src/lib/dashboard-charts.ts
//
// Chart data-shaping for the admin Overview page. Follows the same
// (trainers, now) -> derived-data convention as toPractitioners()/
// toSubscriptions() in the sibling lib files.

import type { CourseCategory, Trainer } from "./types";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "./types";
import type { Subscription } from "./billing";
import { toSubscriptions, totalMRR } from "./billing";

export interface TrendPoint {
  month: string; // e.g. "Aug 2025"
  mrrGBP: number;
  signups: number;
}

/**
 * 12 monthly points ending at `now`. The final (most recent) point is always
 * real — it equals the live MRR/subscriber numbers shown in the stat cards
 * above this chart. The preceding 11 points are a deterministic (not
 * Math.random-based) synthetic taper, since there is no real billing-event
 * history yet. Never contradicts the live stats; clearly labelled
 * "Illustrative" in the chart's own caption (see RevenueTrendChart).
 */
export function getRevenueTrend(trainers: Trainer[], now: Date): TrendPoint[] {
  const activeSubscriptions = toSubscriptions(trainers, now).filter(
    (s) => s.initialStatus === "active",
  );
  const currentMRR = totalMRR(activeSubscriptions);
  const totalSignups = trainers.length;

  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(
      new Intl.DateTimeFormat("en-GB", {
        month: "short",
        year: "numeric",
      }).format(d),
    );
  }

  // Signups: deterministic front-loaded distribution across 12 months that
  // sums exactly to the real trainer count (largest-remainder rounding).
  const weights = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12, recent months weighted higher
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (totalSignups * w) / weightSum);
  const floors = raw.map(Math.floor);
  const remainder = totalSignups - floors.reduce((a, b) => a + b, 0);
  const signups = [...floors];
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac || b.i - a.i);
  for (let k = 0; k < remainder; k++) {
    signups[order[k].i] += 1;
  }

  // MRR: gentle deterministic upward taper, anchored exactly at the real
  // current MRR in the final (most recent) month.
  const mrr = Array.from({ length: 12 }, (_, i) => {
    if (i === 11) return currentMRR;
    const fraction = 0.4 + 0.055 * i; // ~0.4 -> ~1.0 across months 0-10
    return Math.round(currentMRR * fraction);
  });

  return labels.map((month, i) => ({
    month,
    mrrGBP: mrr[i],
    signups: signups[i],
  }));
}

export interface CategoryMixDatum {
  category: CourseCategory;
  label: string;
  count: number;
}

/** Practitioners per course category (a practitioner can count toward more
 * than one), sorted descending by count. Real data — no synthesis. */
export function getCategoryMix(trainers: Trainer[]): CategoryMixDatum[] {
  const counts = new Map<CourseCategory, number>(
    ALL_CATEGORIES.map((c) => [c, 0]),
  );
  for (const t of trainers) {
    for (const c of t.categories) {
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
  }
  return ALL_CATEGORIES.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    count: counts.get(category) ?? 0,
  })).sort((a, b) => b.count - a.count);
}

export interface TierBillingMix {
  tier: { premium: number; standard: number };
  cycle: { monthly: number; annual: number };
}

/** Premium/Standard and Monthly/Annual split across active subscriptions.
 * Real data — mirrors what the Billing page already shows. */
export function getTierBillingMix(subscriptions: Subscription[]): TierBillingMix {
  const active = subscriptions.filter((s) => s.initialStatus === "active");
  return {
    tier: {
      premium: active.filter((s) => s.tier === "premium").length,
      standard: active.filter((s) => s.tier === "standard").length,
    },
    cycle: {
      monthly: active.filter((s) => s.cycle === "monthly").length,
      annual: active.filter((s) => s.cycle === "annual").length,
    },
  };
}

export interface RatingDistribution {
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  average: number;
}

/** 1-5 star histogram plus average. Real data. Takes anything with a
 * `rating` so both AdminReview[] (admin Overview) and Review[] (a single
 * trainer's own Overview) can share one histogram implementation. */
export function getRatingDistribution(
  reviews: readonly { rating: 1 | 2 | 3 | 4 | 5 }[],
): RatingDistribution {
  const counts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of reviews) {
    counts[r.rating] += 1;
  }
  const total = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = total === 0 ? 0 : sum / total;
  return { counts, average };
}
