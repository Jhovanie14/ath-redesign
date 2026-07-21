# Admin Billing page — design

## Context

The admin dashboard already has Applications, Practitioners, and Reviews pages,
each following the same shell: a `lib/*.ts` mapper that shapes `Trainer` data for
the dashboard, a `page.tsx` that guards the session and fetches data, a client-side
table component, and a review dialog for the per-row action.

`ADMIN_NAV` (`src/components/dashboard/nav-config.ts`) has a nav entry currently
labelled "Commission" pointing at `/admin/commission`, rendered inert with
`disabled: true`. This spec builds and renames that entry.

## Why "Commission" becomes "Billing"

ATH's actual revenue model (`src/app/pricing/page.tsx`,
`src/components/pricing/pricing-plans.tsx`) is trainer subscriptions — Standard
(£24/mo · £240/yr) or Premium (£69/mo · £690/yr), billed directly to the
practitioner. There is no per-booking commission cut anywhere in the data model
(`Course` only has a flat `priceGBP`; there is no booking/transaction record at
all). "Commission" was the wrong label for what this page needs to show. This
spec renames the nav entry and route to **Billing** (`/admin/billing`) and builds
a subscription ledger, not a booking-commission ledger.

## Goal

Give the admin one list of every practitioner's subscription — tier, billing
cycle, price, renewal date, and status — with the ability to mark a subscription
cancelled or reinstate it. This is an ops tool for handling cancellation/reinstate
requests that come in outside the product (support email, phone), since there's
no real payment processor wired up yet for self-serve cancellation.

## Scope boundary

Cancel/reinstate is admin-side only, held in local component state — it does
**not** wire back into `trainers.json`, charge/refund anything, or call a payment
processor. Same "no backend yet" seam as `applications.ts`, `reviews.ts`, and the
Practitioners Pause/Reinstate toggle.

"Past due" (a failed-payment state) is deliberately **not** modeled — that status
would come from real payment-processor webhooks, not an admin's manual input. All
seed subscriptions start `"active"`, matching the Reviews/Practitioners precedent
of seeding a healthy default state.

Out of scope: search/filter (8 rows doesn't need it), invoice/line-item history,
proration on cancellation, pagination, wiring cancel/reinstate to any real billing
system, changes to the public pricing page.

## Data layer — `src/lib/billing.ts` (new)

```ts
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
  initialStatus: SubscriptionStatus; // always "active" — no seed data starts cancelled
}

export function toSubscriptions(trainers: Trainer[], now: Date): Subscription[]
export function totalMRR(subscriptions: Subscription[]): number
```

Pricing constants mirror `PLANS` in `pricing-plans.tsx` exactly (standard
£24/£240, premium £69/£690) — duplicated as plain data here rather than importing
from a client component.

`toSubscriptions` maps each trainer:
- `cycle`: deterministic by index — every 3rd trainer (`index % 3 === 2`) is
  `"annual"`, the rest `"monthly"` (skews toward monthly, matching the pricing
  page's monthly-first default).
- `priceGBP`: looked up from tier + cycle.
- `renewsOn`: staggered deterministically so rows don't all share one date —
  `addDays(now, cycleLengthDays - (index * 7) % cycleLengthDays)` where
  `cycleLengthDays` is 30 (monthly) or 365 (annual).
- `initialStatus`: always `"active"`.

Sorted by `renewsOn` ascending (soonest renewal first — this is an ops queue, not
a browse log, so the nearest actionable date leads).

`totalMRR` sums `priceGBP` for subscriptions with status `"active"` only,
normalizing annual to `/12` and rounding to the nearest pound.

## Page — `src/app/admin/billing/page.tsx` (new)

Same shape as `src/app/admin/practitioners/page.tsx`:
- Session guard (`redirect("/admin/login")` if not an admin session).
- `getRepository().getAll()` → `toSubscriptions(trainers, new Date())`.
- Renders `<DashboardShell>` with an `<h1>Billing</h1>` and
  `<BillingTable initialSubscriptions={...} />`.

## Table — `src/components/dashboard/billing/billing-table.tsx` (new, client)

Columns: Practitioner (avatar + name + city, same as `PractitionersTable`), Tier
(gold badge for premium / plain text for standard — same treatment as
`PractitionersTable`), Cycle, Price, Renews on, Status badge, Action ("Review"
button opening the dialog).

State: `useState<Record<string, SubscriptionStatus>>` keyed by slug, seeded from
`initialStatus` — same pattern as `PractitionersTable`'s `statuses` state.

Summary line above the table: "8 subscriptions · £N MRR" using `totalMRR`,
formatted with `formatGBP`.

## Dialog — `src/components/dashboard/billing/subscription-review-dialog.tsx` (new)

Props: `subscription: Subscription | null`, `status: SubscriptionStatus`,
`onOpenChange`, `onStatusChange: (slug: string, status: SubscriptionStatus) => void`.

Contents: practitioner name + city as title/description, a fields grid (Tier,
Cycle, Price, Renews on — same `dl`/`ReviewField` layout as
`PractitionerReviewDialog`), a "View public profile" link to `/trainer/[slug]`
(opens in new tab), and a footer button: "Cancel subscription" when active,
"Reinstate subscription" when cancelled.

## Nav — `src/components/dashboard/nav-config.ts`

Change the `ADMIN_NAV` entry from:
```ts
{ label: "Commission", href: "/admin/commission", icon: PoundSterling, disabled: true },
```
to:
```ts
{ label: "Billing", href: "/admin/billing", icon: PoundSterling },
```

## Consistency fix — `src/lib/dashboard-stats.ts` / `src/app/admin/page.tsx`

`DEMO_ADMIN_STATS.mrrGBP` (£249) and `.activeSubscribers` (1) are stale
placeholders from before real trainer/tier data existed — they'd contradict the
new Billing page's numbers if left alone. `AdminPage` will compute
`activeSubscribers`/`mrrGBP` from `toSubscriptions(trainers, new Date())` and
`totalMRR(...)` instead of reading those two fields off `DEMO_ADMIN_STATS`.
`pendingApplications`, `insuranceExpiring`, and `churnThisMonth` are untouched
(no equivalent real data source exists for those yet).

## Testing

No test suite exists for the dashboard pages yet — manual verification via the
running dev server, checking:
- `/admin/billing` renders all 8 subscriptions, soonest renewal first.
- Cancel/Reinstate toggles the status badge and MRR summary without a page reload
  (cancelling should reduce the displayed MRR).
- Nav link is now clickable (no more "Soon" hint) and labelled "Billing".
- `/admin` Overview's "Active subscribers" and "Monthly recurring revenue" stat
  cards match what `/admin/billing` shows.
