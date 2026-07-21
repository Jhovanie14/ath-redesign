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
