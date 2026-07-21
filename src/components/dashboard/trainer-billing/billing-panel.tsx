"use client";

import { useState } from "react";
import type { BillingCycle, Subscription, SubscriptionStatus } from "@/lib/billing";
import { BillingCycleSelector } from "./billing-cycle-selector";
import { PlanCard } from "./plan-card";
import { SubscriptionSummaryCard } from "./subscription-summary-card";

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
      <h1 className="font-display text-display-md text-ink">Billing</h1>
      <p className="mt-2.5 max-w-xl text-body text-ink-soft">
        Manage your plan and billing cycle.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[65fr_35fr] lg:items-start">
        <div className="flex flex-col gap-9">
          <BillingCycleSelector
            cycle={state.cycle}
            disabled={disabled}
            onChange={setCycle}
          />

          <div>
            <h2 className="font-sans text-title font-semibold text-ink">
              Available plans
            </h2>
            <p className="mt-1 text-small text-ink-soft">
              Choose the plan that best fits your training business.
            </p>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {TIER_OPTIONS.map((option) => (
                <PlanCard
                  key={option.tier}
                  tier={option.tier}
                  name={option.name}
                  tagline={option.tagline}
                  cycle={state.cycle}
                  currentTier={state.tier}
                  disabled={disabled}
                  onSelect={() => setTier(option.tier)}
                />
              ))}
            </div>
          </div>
        </div>

        <SubscriptionSummaryCard
          tier={state.tier}
          cycle={state.cycle}
          status={state.status}
          renewsOn={subscription.renewsOn}
          onToggleStatus={toggleStatus}
        />
      </div>
    </>
  );
}
