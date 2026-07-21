import { Check, ShieldCheck, Sparkles } from "lucide-react";
import type { BillingCycle, Subscription } from "@/lib/billing";
import { priceForTier, TIER_FEATURES } from "@/lib/billing";
import { cn, formatGBP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Tier = Subscription["tier"];

const TIER_RANK: Record<Tier, number> = { standard: 0, premium: 1 };

export const TIER_ICON: Record<Tier, typeof ShieldCheck> = {
  standard: ShieldCheck,
  premium: Sparkles,
};

export function PlanCard({
  tier,
  name,
  tagline,
  cycle,
  currentTier,
  disabled,
  onSelect,
}: {
  tier: Tier;
  name: string;
  tagline: string;
  cycle: BillingCycle;
  currentTier: Tier;
  disabled: boolean;
  onSelect: () => void;
}) {
  const isCurrent = tier === currentTier;
  const isUpgrade = TIER_RANK[tier] > TIER_RANK[currentTier];
  const price = priceForTier(tier, cycle);
  const Icon = TIER_ICON[tier];

  return (
    <div
      className={cn(
        "flex flex-col rounded-card border bg-paper p-7 shadow-e1 transition-shadow duration-200",
        isCurrent ? "border-gold" : "border-linen hover:shadow-e2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isCurrent ? "bg-gold-tint text-gold-deep" : "bg-linen/60 text-ink-soft",
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <h3 className="text-title font-display text-ink">{name}</h3>
        </div>
        {isCurrent && (
          <Badge variant="gold" className="shrink-0 gap-1">
            <Check className="h-3 w-3" strokeWidth={2.5} />
            Current plan
          </Badge>
        )}
      </div>

      <p className="mt-3 text-small text-ink-soft">{tagline}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="font-data text-display-md font-medium text-ink">
          {formatGBP(price)}
        </span>
        <span className="text-small text-stone">
          per {cycle === "annual" ? "year" : "month"}
        </span>
      </div>

      <ul className="mt-6 flex flex-col gap-2.5">
        {TIER_FEATURES[tier].map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-small text-ink-soft">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" strokeWidth={2.5} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-7 pt-1">
        {isCurrent ? (
          <Button
            disabled
            className="w-full bg-linen text-stone opacity-100 hover:bg-linen"
          >
            Current plan
          </Button>
        ) : (
          <Button
            variant={isUpgrade ? "primary" : "outline"}
            disabled={disabled}
            onClick={onSelect}
            className="w-full"
          >
            {isUpgrade ? `Upgrade to ${name}` : `Downgrade to ${name}`}
          </Button>
        )}
      </div>
    </div>
  );
}
