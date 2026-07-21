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
        "relative flex flex-col overflow-hidden rounded-card border p-7 transition-[box-shadow,border-color,transform] duration-[180ms] ease-out",
        isCurrent
          ? "border-[#C6A45E] bg-[#FFFCF6] shadow-[0_10px_30px_rgba(54,43,25,0.05)]"
          : "border-linen bg-paper shadow-e1 hover:-translate-y-px hover:border-[#CFC5B4] hover:shadow-[0_10px_28px_rgba(40,35,28,0.055)]",
      )}
    >
      {isCurrent && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] bg-[#B9985A]"
        />
      )}

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
        <span className="font-data text-[40px] font-medium leading-none text-ink">
          {formatGBP(price)}
        </span>
        <span className="text-small text-[#9A9285]">
          per {cycle === "annual" ? "year" : "month"}
        </span>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {TIER_FEATURES[tier].map((feature) => (
          <li
            key={feature}
            className="flex items-start gap-2 text-small leading-[1.45] text-ink-soft"
          >
            <span className="flex w-[18px] shrink-0 justify-start pt-0.5">
              <Check className="h-4 w-4 text-ink" strokeWidth={2.5} />
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-7">
        {isCurrent ? (
          <div className="flex h-11 cursor-default items-center justify-center gap-1.5 rounded-[10px] border border-[#DED8CD] bg-[#F2EEE5] text-small font-medium text-[#746F65]">
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            Your current plan
          </div>
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
