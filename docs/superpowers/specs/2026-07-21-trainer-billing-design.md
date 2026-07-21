# Trainer Billing Page — Design Spec

## Goal

Let a trainer view and manage their own subscription — tier, billing cycle,
and active/cancelled status — from the dashboard, at `/trainer/billing` (nav
entry already reserved but disabled; this is the last remaining disabled
entry in `TRAINER_NAV`).

## Context

`src/lib/billing.ts` already defines a real `Subscription` model
(`slug`, `name`, `city`, `tier`, `cycle`, `priceGBP`, `renewsOn`,
`initialStatus`) and `toSubscriptions(trainers, now)`, which derives one
`Subscription` per trainer deterministically from `Trainer.tier` (cycle and
renewal offset are assigned by array index). This already powers
`src/app/admin/billing/page.tsx` → `BillingTable`, where an admin can review
any trainer's subscription and cancel/reinstate it via
`SubscriptionReviewDialog`.

No trainer-facing equivalent exists. This page is the trainer's own
self-service view of the same subscription data the admin already sees for
her, plus the ability to change her own tier and billing cycle (not just
cancel/reinstate).

There is no payment-method data model anywhere in the app (no card/bank
fields on any type). This page will not fabricate one — it covers only the
data that actually exists in `Subscription`.

## Data Model Change

`src/lib/billing.ts`: extract the existing private `TIER_PRICE` lookup into
an exported helper:

```ts
export function priceForTier(tier: Trainer["tier"], cycle: BillingCycle): number {
  return TIER_PRICE[tier][cycle];
}
```

`TIER_PRICE` itself is unchanged (still module-private); `toSubscriptions`
still uses it directly. This is the only change to existing code — no new
fields on `Trainer`, `Subscription`, or `trainers.json`. The helper exists so
the trainer billing panel can recompute price live when the trainer changes
tier/cycle, without a third copy of the price table (there are already two:
`TIER_PRICE` here and `PLANS` in `src/components/pricing/pricing-plans.tsx`,
which the file's own comment already flags as mirrors of each other).

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Billing entry (line 33). This is the last disabled entry in
`TRAINER_NAV`; after this change no trainer nav item is disabled.

## Trainer Billing Page

### `src/app/trainer/billing/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- `const trainers = await getRepository().getAll();` then
  `const subscription = toSubscriptions(trainers, new Date()).find((s) => s.slug === "dr-amara-okafor");`
  — deriving from the full trainers array (not a single-trainer array) keeps
  her cycle/price/renewal identical to what `toSubscriptions` would produce
  for her inside the admin table, since cycle assignment depends on array
  index. `notFound()` if not found.
- Renders `BillingPanel` inside `DashboardShell`, passing the subscription.
  No page-level heading — heading lives inside the component (established
  pattern from `CoursesList`/`AvailabilityForm`/`ProfileForm`/`DocumentsList`).

### `src/components/dashboard/trainer-billing/billing-panel.tsx` (new, client component)

Props: `{ subscription: Subscription }` (the `Subscription` type imported
from `@/lib/billing`).

Local state, seeded once from the prop:

```tsx
"use client";
type BillingState = {
  tier: Trainer["tier"];
  cycle: BillingCycle;
  status: SubscriptionStatus;
};
```

`renewsOn` is never part of local state — it's read directly from the
`subscription` prop and displayed as-is, never recomputed, regardless of
tier/cycle changes.

- Page heading ("Billing") + short description: "Manage your plan and
  billing cycle."
- **Current plan card** (`className="rounded-card border border-linen bg-paper p-6"`):
  - Tier: `<Badge variant="gold">Premium</Badge>` if `tier === "premium"`,
    else plain `<span className="text-ink-soft">Standard</span>` text
    (exact pattern from `billing-table.tsx:172-177`).
  - Price: `formatGBP(priceForTier(tier, cycle))` + `/mo` or `/yr` suffix
    depending on `cycle` (exact pattern from `billing-table.tsx:182-187`).
  - Cycle: "Monthly" or "Annual" text.
  - Renewal date: `formatShortDate(subscription.renewsOn)`.
  - Status: `<Badge variant={status === "active" ? "success" : "error"}>{status === "active" ? "Active" : "Cancelled"}</Badge>`
    (exact `STATUS_BADGE` mapping from `billing-table.tsx:30-36`).
- **Billing cycle toggle**: same Monthly/Annual pill `role="radiogroup"`
  pattern as `PricingPlans` (`pricing-plans.tsx:88-122`) — clicking a cycle
  option sets `cycle` in local state, live-updating price and cycle text in
  the plan card above. Disabled (both options non-interactive, current
  cycle still displayed) when `status === "cancelled"`.
- **Tier switch**: two compact selectable cards, Standard and Premium,
  condensed version of `PricingPlans`' tier cards (name, price for the
  currently selected cycle, 2-3 top features) — condensed to name + price
  + one-line tagline is enough; this is a plan switcher, not the marketing
  page. Clicking a card sets `tier` in local state, live-updating the badge
  and price in the plan card above. The currently-selected tier's card gets
  a `Check` icon (from `lucide-react`, same import `PricingPlans` already
  uses) + "Current plan" label in its header, and a `ring-2 ring-ink`
  highlight on the card container; the non-selected card has neither.
  Disabled when `status === "cancelled"`.
- **Cancel/Reinstate button**: no dialog (unlike the admin's
  `SubscriptionReviewDialog` — this is the trainer's own account, not a
  review workflow, so a modal confirmation adds friction without adding
  safety). Single button below the tier switch:
  - `status === "active"`: `<Button variant="outline">Cancel subscription</Button>`,
    clicking sets `status` to `"cancelled"`.
  - `status === "cancelled"`: `<Button>Reinstate subscription</Button>`
    (default variant), clicking sets `status` to `"active"`.
  - Exact button copy/variant pattern from `subscription-review-dialog.tsx:74-87`.
- No separate Save step — every action (cycle toggle, tier switch,
  cancel/reinstate) takes effect immediately on local state, matching the
  immediate-effect convention already used by `DocumentsList`'s
  upload/replace/remove actions (a click is itself the confirmation).
- No persistence — all state is local `useState`, seeded once from the
  server-computed `subscription` prop, never written back. Reloading the
  page reverts to the original seed state (matches every other
  trainer-dashboard mutation: `AvailabilityForm`, `CoursesList`,
  `ProfileForm`, `DocumentsList`). Changes here never affect
  `trainer.tier` elsewhere (public profile, admin billing table) — same
  local-only convention.

No payment-method section. No invoice history (no such data model exists).

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack).
- No backend — all changes are local `useState`, seeded once from
  server-computed props derived from `toSubscriptions`, never written back.
  Reloading the page reverts to the seed state.
- No new data model beyond the one small `priceForTier` export from
  `src/lib/billing.ts` — no new fields on `Trainer`, `Subscription`, or
  `trainers.json`.
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"`.
- Tier display: `Badge variant="gold"` for Premium, plain
  `text-ink-soft` span for Standard (matches `billing-table.tsx`).
- Status display: `Badge variant="success"` for Active, `Badge
  variant="error"` for Cancelled (matches `billing-table.tsx`'s
  `STATUS_BADGE`).
- Cancel/Reinstate button copy and variants match
  `subscription-review-dialog.tsx:74-87` exactly: `variant="outline"` +
  "Cancel subscription" when active; default variant + "Reinstate
  subscription" when cancelled.
- Billing cycle toggle: same pill `role="radiogroup"` pattern as
  `pricing-plans.tsx:88-122`.
- No payment-method UI of any kind (no backing data model).
- Auth guard pattern: redirect to `/trainer/login` if
  `!session || session.role !== "trainer"` (exact pattern in
  `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: subscription for `dr-amara-okafor` found via
  `toSubscriptions(await getRepository().getAll(), new Date())`,
  `notFound()` if missing (exact `notFound()` pattern in
  `src/app/trainer/courses/page.tsx:19-20`).

## Manual Verification

1. Log in as trainer, open `/trainer/billing` — the plan card shows the
   same tier/cycle/price/renewal date the admin Billing table shows for
   "Dr Amara Okafor", with an "Active" status badge.
2. Toggle billing cycle from Monthly to Annual (or vice versa) — the plan
   card's price and cycle text update immediately to match the new cycle's
   price for the current tier.
3. Click the other tier's card (Standard ↔ Premium) — the plan card's tier
   badge and price update immediately; the clicked card now shows the
   "Current plan" indicator.
4. Click "Cancel subscription" — status badge changes to "Cancelled", the
   button becomes "Reinstate subscription", and the cycle toggle/tier cards
   become disabled.
5. Click "Reinstate subscription" — status returns to "Active", cycle
   toggle/tier cards become interactive again.
6. Reload `/trainer/billing` — everything reverts to the original seed
   state from step 1 (expected, no persistence).
7. Confirm the admin Billing table (`/admin/billing`) still shows Dr Amara
   Okafor's original tier/cycle/status, unaffected by any of the above
   (expected, read-only shared source data, not a copy that was mutated).
8. Confirm Billing is no longer disabled in the trainer sidebar nav (no
   "Soon" tag), and no other `TRAINER_NAV` entry changed.
9. `npx tsc --noEmit` and `npx eslint src` both clean.
