import type { BillingCycle, Subscription, SubscriptionStatus } from "@/lib/billing";
import { priceForTier } from "@/lib/billing";
import { formatGBP, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TIER_ICON } from "./plan-card";

type Tier = Subscription["tier"];

export function SubscriptionSummaryCard({
  tier,
  cycle,
  status,
  renewsOn,
  onToggleStatus,
}: {
  tier: Tier;
  cycle: BillingCycle;
  status: SubscriptionStatus;
  renewsOn: string;
  onToggleStatus: () => void;
}) {
  const price = priceForTier(tier, cycle);
  const Icon = TIER_ICON[tier];
  const active = status === "active";

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-card border border-linen bg-paper p-7 shadow-e1 sm:p-8">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-deep"
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="eyebrow">Current subscription</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="font-display text-title text-ink">
                {tier === "premium" ? "Premium" : "Standard"}
              </p>
              <Badge variant={active ? "success" : "error"}>
                {active ? "Active" : "Cancelled"}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-baseline gap-2 border-t border-linen pt-6">
          <span className="font-data text-display-md font-medium text-ink">
            {formatGBP(price)}
          </span>
          <span className="text-small text-stone">
            per {cycle === "annual" ? "year" : "month"}
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <p className="text-small text-ink">
            Renews {formatShortDate(renewsOn)}
          </p>
          <p className="text-small text-stone">
            {cycle === "annual" ? "Annual" : "Monthly"} billing
          </p>
        </div>

        <div className="mt-7 border-t border-linen pt-6">
          <p className="text-small font-semibold text-ink">
            Subscription management
          </p>
          <div className="mt-3">
            {active ? (
              <button
                type="button"
                onClick={onToggleStatus}
                className="text-small font-medium text-stone transition-colors duration-150 hover:text-error focus-visible:text-error"
              >
                Cancel subscription
              </button>
            ) : (
              <Button variant="outline" size="sm" onClick={onToggleStatus}>
                Reinstate subscription
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
