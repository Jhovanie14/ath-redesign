# Trainer Billing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer view and self-service manage their own subscription (tier, billing cycle, active/cancelled status) at `/trainer/billing`, reusing the existing `Subscription` model that already powers the admin Billing table.

**Architecture:** A new server page derives this trainer's `Subscription` via the existing `toSubscriptions()` helper (same derivation the admin table uses, so the numbers match) and passes it to a new client component that holds all state locally — cycle/tier/status can be changed live in the UI, but nothing is ever persisted or written back, matching every other trainer-dashboard mutation in this app.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4. No backend, no test runner in this repo (confirmed: no `test` script exists) — verification is `tsc --noEmit` + `eslint` + manual browser walkthrough.

## Global Constraints

- No backend — all changes are local `useState`, seeded once from server-computed props derived from `toSubscriptions`, never written back. Reloading the page reverts to the seed state.
- No new data model beyond one small `priceForTier` export from `src/lib/billing.ts` — no new fields on `Trainer`, `Subscription`, or `trainers.json`.
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"`.
- Tier display: `Badge variant="gold"` for Premium, plain `text-ink-soft` span for Standard (matches `billing-table.tsx`).
- Status display: `Badge variant="success"` for Active, `Badge variant="error"` for Cancelled (matches `billing-table.tsx`'s `STATUS_BADGE`).
- Cancel/Reinstate button copy and variants match `subscription-review-dialog.tsx:74-87` exactly: `variant="outline"` + "Cancel subscription" when active; default variant + "Reinstate subscription" when cancelled.
- Billing cycle toggle: same pill `role="radiogroup"` pattern as `pricing-plans.tsx:88-122`.
- No payment-method UI of any kind (no backing data model).
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: subscription for `dr-amara-okafor` found via `toSubscriptions(await getRepository().getAll(), new Date())`, `notFound()` if missing.

---

### Task 1: `priceForTier` helper + `BillingPanel` component

**Files:**
- Modify: `src/lib/billing.ts`
- Create: `src/components/dashboard/trainer-billing/billing-panel.tsx`

**Interfaces:**
- Consumes: `Subscription`, `BillingCycle`, `SubscriptionStatus` types already exported from `src/lib/billing.ts`; `Badge` from `@/components/ui/badge`; `Button` from `@/components/ui/button`; `cn`, `formatGBP`, `formatShortDate` from `@/lib/utils`; `Check` icon from `lucide-react`.
- Produces: `priceForTier(tier: Trainer["tier"], cycle: BillingCycle): number` exported from `src/lib/billing.ts`. `BillingPanel({ subscription: Subscription })` exported from `src/components/dashboard/trainer-billing/billing-panel.tsx` — Task 2's server page imports and renders this with a `Subscription` prop.

- [ ] **Step 1: Add the `priceForTier` export to `src/lib/billing.ts`**

Open `src/lib/billing.ts`. Find this existing block (lines 18-22):

```ts
// Mirrors PLANS in src/components/pricing/pricing-plans.tsx.
const TIER_PRICE: Record<Trainer["tier"], Record<BillingCycle, number>> = {
  standard: { monthly: 24, annual: 240 },
  premium: { monthly: 69, annual: 690 },
};
```

Insert a new exported function directly after it (before the `CYCLE_LENGTH_DAYS` block):

```ts
// Mirrors PLANS in src/components/pricing/pricing-plans.tsx.
const TIER_PRICE: Record<Trainer["tier"], Record<BillingCycle, number>> = {
  standard: { monthly: 24, annual: 240 },
  premium: { monthly: 69, annual: 690 },
};

export function priceForTier(tier: Trainer["tier"], cycle: BillingCycle): number {
  return TIER_PRICE[tier][cycle];
}
```

Nothing else in the file changes — `TIER_PRICE` stays module-private, `toSubscriptions` keeps using it directly.

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no new errors (clean, same as before this edit — this repo has no test suite, so this is the only automated check for this step).

- [ ] **Step 3: Create `src/components/dashboard/trainer-billing/billing-panel.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { BillingCycle, Subscription, SubscriptionStatus } from "@/lib/billing";
import { priceForTier } from "@/lib/billing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatGBP, formatShortDate } from "@/lib/utils";

type Tier = Subscription["tier"];

type BillingState = {
  tier: Tier;
  cycle: BillingCycle;
  status: SubscriptionStatus;
};

const TIER_OPTIONS: { tier: Tier; name: string; tagline: string }[] = [
  {
    tier: "standard",
    name: "Standard",
    tagline: "Everything you need to be found and booked.",
  },
  {
    tier: "premium",
    name: "Premium",
    tagline: "Stand out and get seen first.",
  },
];

export function BillingPanel({ subscription }: { subscription: Subscription }) {
  const [state, setState] = useState<BillingState>({
    tier: subscription.tier,
    cycle: subscription.cycle,
    status: subscription.initialStatus,
  });

  const price = priceForTier(state.tier, state.cycle);
  const disabled = state.status === "cancelled";

  function setCycle(cycle: BillingCycle) {
    if (disabled) return;
    setState((prev) => ({ ...prev, cycle }));
  }

  function setTier(tier: Tier) {
    if (disabled) return;
    setState((prev) => ({ ...prev, tier }));
  }

  function toggleStatus() {
    setState((prev) => ({
      ...prev,
      status: prev.status === "active" ? "cancelled" : "active",
    }));
  }

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Billing</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          Manage your plan and billing cycle.
        </p>
      </div>

      <div className="mt-8 max-w-md rounded-card border border-linen bg-paper p-6">
        <div className="flex items-center gap-2">
          {state.tier === "premium" ? (
            <Badge variant="gold">Premium</Badge>
          ) : (
            <span className="text-ink-soft">Standard</span>
          )}
          <Badge variant={state.status === "active" ? "success" : "error"}>
            {state.status === "active" ? "Active" : "Cancelled"}
          </Badge>
        </div>

        <p className="mt-4 text-display-md font-medium text-ink">
          {formatGBP(price)}
          <span className="text-body text-ink-soft">
            /{state.cycle === "annual" ? "yr" : "mo"}
          </span>
        </p>

        <p className="mt-2 text-micro text-stone">
          {state.cycle === "annual" ? "Annual" : "Monthly"} billing · renews{" "}
          {formatShortDate(subscription.renewsOn)}
        </p>
      </div>

      <div className="mt-8 max-w-md">
        <p className="eyebrow">Billing cycle</p>
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="mt-3 inline-flex items-center gap-1 rounded-full border border-linen bg-paper p-1"
        >
          {(["monthly", "annual"] as BillingCycle[]).map((c) => {
            const active = state.cycle === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => setCycle(c)}
                className={cn(
                  "rounded-full px-4 py-2 text-small font-medium transition-colors",
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-linen",
                  disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
                )}
              >
                {c === "monthly" ? "Monthly" : "Annual"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex max-w-2xl flex-col gap-4 sm:flex-row">
        {TIER_OPTIONS.map((option) => {
          const selected = state.tier === option.tier;
          return (
            <button
              key={option.tier}
              type="button"
              disabled={disabled}
              onClick={() => setTier(option.tier)}
              className={cn(
                "flex-1 rounded-card border border-linen bg-paper p-6 text-left transition-colors",
                selected && "ring-2 ring-ink",
                disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="font-display text-title text-ink">
                  {option.name}
                </p>
                {selected && (
                  <span className="inline-flex items-center gap-1 text-micro font-medium text-ink">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    Current plan
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-small text-ink-soft">{option.tagline}</p>
              <p className="mt-4 text-body font-medium text-ink">
                {formatGBP(priceForTier(option.tier, state.cycle))}
                <span className="text-small text-ink-soft">
                  /{state.cycle === "annual" ? "yr" : "mo"}
                </span>
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        {state.status === "active" ? (
          <Button variant="outline" onClick={toggleStatus}>
            Cancel subscription
          </Button>
        ) : (
          <Button onClick={toggleStatus}>Reinstate subscription</Button>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

Run: `npx eslint src/lib/billing.ts src/components/dashboard/trainer-billing/billing-panel.tsx`
Expected: clean (no errors).

- [ ] **Step 5: Commit**

```bash
git add src/lib/billing.ts src/components/dashboard/trainer-billing/billing-panel.tsx
git commit -m "feat: add trainer billing panel with plan/cycle self-service"
```

---

### Task 2: Server page + nav integration

**Files:**
- Create: `src/app/trainer/billing/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts:33`

**Interfaces:**
- Consumes: `BillingPanel` (from Task 1, `src/components/dashboard/trainer-billing/billing-panel.tsx`); `toSubscriptions` from `src/lib/billing.ts`; `getSession` from `@/lib/auth`; `getRepository` from `@/lib/repository`; `DashboardShell` from `@/components/dashboard/dashboard-shell`; `logoutTrainer` from `../actions`.
- Produces: the `/trainer/billing` route; the `TRAINER_NAV` Billing entry with `disabled` removed.

- [ ] **Step 1: Create `src/app/trainer/billing/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toSubscriptions } from "@/lib/billing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BillingPanel } from "@/components/dashboard/trainer-billing/billing-panel";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function TrainerBillingPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainers = await getRepository().getAll();
  const subscription = toSubscriptions(trainers, new Date()).find(
    (s) => s.slug === "dr-amara-okafor",
  );
  if (!subscription) notFound();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <BillingPanel subscription={subscription} />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Remove `disabled: true` from the Billing nav entry**

Open `src/components/dashboard/nav-config.ts`. Find line 33:

```ts
  { label: "Billing", href: "/trainer/billing", icon: CreditCard, disabled: true },
```

Replace with:

```ts
  { label: "Billing", href: "/trainer/billing", icon: CreditCard },
```

No other line in this file changes.

- [ ] **Step 3: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

Run: `npx eslint src/app/trainer/billing/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/billing/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer billing page and enable nav entry"
```

---

### Task 3: Manual verification (no code changes)

**Files:** none — this task only exercises the app in a browser and re-runs the full type/lint check.

- [ ] **Step 1: Full type and lint check**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npx eslint src`
Expected: clean, or only the pre-existing baseline `react-hooks/set-state-in-effect` errors in `design-tweak-panel.tsx` (unrelated to this feature — confirmed pre-existing in prior features' verification passes).

- [ ] **Step 2: Log in as trainer and open the Billing page**

Log in as the demo trainer, navigate to `/trainer/billing`.
Expected: the plan card shows the same tier/cycle/price/renewal date that `/admin/billing` shows for "Dr Amara Okafor", with an "Active" status badge.

- [ ] **Step 3: Cross-check against the admin Billing table**

Open `/admin/billing` in another tab (or note the values beforehand) and confirm Dr Amara Okafor's row shows the identical tier, cycle, price, and renewal date as the trainer Billing page in Step 2.

- [ ] **Step 4: Toggle billing cycle**

Click the other billing-cycle option (Monthly ↔ Annual).
Expected: the plan card's price and "billing · renews" line update immediately to the new cycle's price; the renewal date itself does not change.

- [ ] **Step 5: Switch tier**

Click the other tier's card (Standard ↔ Premium).
Expected: the plan card's tier badge and price update immediately; the clicked card now shows the "Current plan" check and highlighted ring; the other card loses it.

- [ ] **Step 6: Cancel the subscription**

Click "Cancel subscription".
Expected: status badge changes to "Cancelled" (red), the button becomes "Reinstate subscription", and the billing-cycle toggle and both tier cards become visibly disabled and non-interactive (clicking them does nothing).

- [ ] **Step 7: Reinstate the subscription**

Click "Reinstate subscription".
Expected: status returns to "Active" (green), and the cycle toggle and tier cards become interactive again.

- [ ] **Step 8: Reload and confirm no persistence**

Reload `/trainer/billing`.
Expected: everything reverts to the original seed state from Step 2 (same tier/cycle/status as first loaded) — no persistence, matching every other trainer-dashboard mutation in this app.

- [ ] **Step 9: Confirm admin view is unaffected**

Reload `/admin/billing`.
Expected: Dr Amara Okafor's row is unchanged from Step 3 — the trainer page's local-only mutations never touched the shared source data.

- [ ] **Step 10: Confirm nav state**

Check the trainer sidebar nav.
Expected: "Billing" has no "Soon" tag and is clickable; every other `TRAINER_NAV` entry is unchanged (all already enabled from prior features).

---
