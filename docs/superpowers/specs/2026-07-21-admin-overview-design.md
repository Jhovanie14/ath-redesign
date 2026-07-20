# Admin Overview page — design

## Context

`/admin` (`src/app/admin/page.tsx`) currently renders only a page header and a
row of 5 `StatCard`s (`src/components/dashboard/stat-card.tsx`). Everything
below that is blank. Applications, Practitioners, Reviews, Billing, and Config
all now exist and follow the "search + filter + pagination" pattern from
earlier specs; Overview has had no equivalent pass.

There is still no backend — all admin data is either static seed data
(`DEMO_APPLICATIONS`) or derived live from `trainers.json` via mapper
functions (`toPractitioners`, `toSubscriptions`, `toAdminReviews`, all taking
`(trainers, now)`). This spec adds an action-items section and a set of chart
widgets to fill the page, following that same "derive from real data where
possible" convention, with one deliberate, explicitly-labelled exception (see
Revenue trend below).

## Goal

Turn Overview into a real landing page for the admin: things that need action
today, front and center, plus a set of at-a-glance charts about the state of
the marketplace. Nothing on the page should contradict the numbers shown
elsewhere (Billing, Practitioners, Reviews) — anything derivable from real
data is computed the same way those pages compute it.

## Scope boundary

Out of scope: real historical billing/signup events (no such data model
exists — see Revenue trend), wiring any widget to a real backend, new nav
items, changes to the 5 existing `StatCard`s' layout or props, changes to
any of the 5 existing admin tables.

## Stat cards — one correctness fix

`StatCard`s stay as-is except: "Insurance expiring" currently reads the
hardcoded `DEMO_ADMIN_STATS.insuranceExpiring` (`0`), while
`toPractitioners(trainers, now)` already computes real `renewalUrgency`
(`"overdue" | "due-soon" | "current"`) per practitioner for the Practitioners
page. `AdminPage` will instead count practitioners whose `renewalUrgency !==
"current"` and pass that as the card's value — consistent with the existing
precedent in this spec series of preferring a live-derived number over a
stale placeholder (same fix already applied to `activeSubscribers`/`mrrGBP`
in the Billing spec). `pendingApplications` and `churnThisMonth` are
untouched — no live source exists for either yet.

## "Needs attention" section (new)

Two cards, side by side (`sm:grid-cols-2`), directly below the stat card row.

**Pending applications** (`src/components/dashboard/overview/pending-applications-card.tsx`)
- Reads `DEMO_APPLICATIONS`, filters `status === "pending"`, sorted oldest
  `submittedAt` first (same ordering the Applications table subtitle already
  implies — "oldest first").
- Shows up to 4 rows: name, tier badge, submitted date (`formatShortDate`).
- Footer link: "View all →" to `/admin/applications`.
- Empty state (0 pending): "No pending applications" — short, not the full
  empty-state treatment used on table pages.

**Renewals due** (`src/components/dashboard/overview/renewals-due-card.tsx`)
- Reads `toPractitioners(trainers, now)`, filters `renewalUrgency !==
  "current"`, already sorted soonest-first (mapper's existing sort).
- Shows up to 4 rows: name, city, renewal date, urgency badge (reusing the
  same `Badge variant="error"/"warning"` + `URGENCY_LABEL` mapping already in
  `practitioners-table.tsx`).
- Footer link: "View all →" to `/admin/practitioners`.
- Empty state (0 due): "No renewals due soon".

**Both empty:** instead of two near-empty cards, collapse the section into a
single full-width "All caught up" card with a short reassuring line. This
mirrors the "no matches" vs "no data" distinction already used in the table
components.

## "Insights" section (new) — charts

New dependency: **Recharts**. Charts are themed off the existing CSS color
tokens (`src/app/globals.css`) rather than Recharts' default palette:
`--color-ink` for primary series, `--color-stone` / `--color-linen` for
secondary series and gridlines/axes, `--color-gold` reserved *only* for the
Premium slice in the tier chart (matching the existing "gold = Premium /
verification only" convention enforced elsewhere in the codebase),
`--color-warning` / `--color-error` reused for urgency where relevant.

Data-shaping lives in a new `src/lib/dashboard-charts.ts`, following the
`(trainers, now)` convention of the other mapper files.

### Revenue & signups trend (full width)

```ts
export interface TrendPoint { month: string; mrrGBP: number; signups: number }
export function getRevenueTrend(trainers: Trainer[], now: Date): TrendPoint[]
```

12 monthly points ending at `now`. **The last point is always real**: `mrrGBP`
= `totalMRR(toSubscriptions(trainers, now).filter(active))`, `signups` =
`trainers.length`. The preceding 11 points are synthesized backwards with a
deterministic (seeded-by-index, not `Math.random`) gentle upward curve, so
the chart never contradicts the live stat cards above it and is stable
across re-renders/SSR.

Rendered as a Recharts `ComposedChart`: `Area` for MRR (ink, low-opacity
fill), `Bar` for signups (stone). Card caption: "Illustrative — full history
will be available once billing events are tracked", so this is legible as a
placeholder rather than a claim about real history.

### Course category mix

```ts
export function getCategoryMix(trainers: Trainer[]): { category: CourseCategory; label: string; count: number }[]
```

Counts practitioners whose `categories` array includes each of the 9
`CourseCategory` values (a trainer can count toward multiple categories).
Sorted descending by count. Rendered as a horizontal `BarChart` (9 bars, ink
fill) — horizontal so all 9 category labels stay readable without rotation.

### Tier & billing mix

```ts
export function getTierBillingMix(subscriptions: Subscription[]): {
  tier: { premium: number; standard: number };
  cycle: { monthly: number; annual: number };
}
```

Two small side-by-side donut charts in one card: Premium/Standard (gold for
Premium, linen for Standard) and Monthly/Annual (ink for Monthly, stone for
Annual). Built from the same `toSubscriptions` data Billing already uses.

### Review ratings distribution

```ts
export function getRatingDistribution(reviews: AdminReview[]): {
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  average: number;
}
```

Vertical `BarChart`, 5 bars (1★–5★, ink fill), with the numeric average
shown as a headline number above the chart (same visual treatment as a
`StatCard` value). Built from `toAdminReviews(trainers)` (21 seed reviews).

## Layout summary (`src/app/admin/page.tsx`)

1. Header (unchanged)
2. Stat cards row (unchanged except the Insurance expiring fix above)
3. "Needs attention" — `<PendingApplicationsCard>` + `<RenewalsDueCard>`,
   `sm:grid-cols-2`, or the single collapsed "All caught up" card
4. "Insights" section heading
5. `<RevenueTrendChart>` (full width)
6. 3-column row (`xl:grid-cols-3`, stacks to 1 column on mobile):
   `<CategoryMixChart>`, `<TierBillingChart>`, `<RatingDistributionChart>`

All new chart/card components live under
`src/components/dashboard/overview/`, each wrapped in the existing
`Card`/`CardContent` primitives, each with its own empty state (e.g. "No
reviews yet" in place of an empty/broken chart) for the case where the
underlying dataset is empty.

## Testing

No test suite exists for dashboard pages yet — manual verification via the
running dev server:
- `/admin` renders both new sections without layout overflow at mobile,
  tablet, and desktop widths.
- Insurance expiring stat card matches the count of non-"current"
  `renewalUrgency` practitioners shown in the Renewals due card.
- Pending applications / Renewals due cards' "View all" links land on the
  correct filtered context on Applications/Practitioners.
- Revenue trend chart's rightmost point matches the live MRR/active-
  subscriber stat cards.
- Category mix, tier/billing, and rating distribution totals are internally
  consistent (e.g. rating bar counts sum to 21; tier donut sums to 8).
- Temporarily emptying a data source (e.g. `DEMO_APPLICATIONS = []`) shows
  the correct empty states instead of a crash or blank chart.
