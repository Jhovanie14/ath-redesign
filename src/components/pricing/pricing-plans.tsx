"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn, formatGBP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/tier-badge";

type Cycle = "monthly" | "annual";

interface Plan {
  name: string;
  premium: boolean;
  tagline: string;
  price: { monthly: number; annual: number };
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Standard",
    premium: false,
    tagline: "Everything you need to be found and booked.",
    price: { monthly: 24, annual: 240 },
    features: [
      "Verified listing on the Hub",
      "Appears in search and on the map",
      "Unlimited student enquiries",
      "Verified reviews from your students",
      "Full profile with courses and pricing",
    ],
  },
  {
    name: "Premium",
    premium: true,
    tagline: "Stand out and get seen first.",
    price: { monthly: 69, annual: 690 },
    features: [
      "Everything in Standard",
      "Premium badge and gold frame",
      "Priority placement in Recommended results",
      "Eligible for homepage feature slots",
      "Priority enquiries and support",
    ],
  },
];

function PriceBlock({ plan, cycle }: { plan: Plan; cycle: Cycle }) {
  const amount = plan.price[cycle];
  const perMonth = cycle === "annual" ? plan.price.annual / 12 : plan.price.monthly;
  const saving = plan.price.monthly * 12 - plan.price.annual;
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-data text-display-lg font-medium",
            plan.premium ? "text-ivory" : "text-ink",
          )}
        >
          {formatGBP(amount)}
        </span>
        <span className={cn("text-body", plan.premium ? "text-ivory/60" : "text-stone")}>
          /{cycle === "annual" ? "year" : "month"}
        </span>
      </div>
      <p
        className={cn(
          "mt-1.5 font-data text-small",
          plan.premium ? "text-ivory/60" : "text-stone",
        )}
      >
        {cycle === "annual"
          ? `${formatGBP(Math.round(perMonth))} a month, billed annually · save ${formatGBP(saving)}`
          : "billed monthly, cancel anytime"}
      </p>
    </div>
  );
}

export function PricingPlans() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="inline-flex items-center gap-1 rounded-full border border-linen bg-paper p-1"
        >
          {(["monthly", "annual"] as Cycle[]).map((c) => {
            const active = cycle === c;
            return (
              <button
                key={c}
                role="radio"
                aria-checked={active}
                onClick={() => setCycle(c)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-small font-medium transition-colors",
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-linen",
                )}
              >
                {c === "monthly" ? "Monthly" : "Annual"}
                {c === "annual" && (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
                      active ? "bg-ivory/20 text-ivory" : "bg-linen text-ink-soft",
                    )}
                  >
                    2 months free
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier cards */}
      <div className="mx-auto mt-10 grid max-w-5xl gap-8 md:grid-cols-2">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative flex flex-col rounded-card border p-10",
              plan.premium
                ? "border-ink bg-ink text-ivory"
                : "border-linen bg-paper",
            )}
          >
            {plan.premium && (
              <>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-card ring-1 ring-inset ring-gold/40"
                />
                <span className="absolute -top-3 left-10 inline-flex items-center rounded-full bg-gold-tint px-3 py-1 text-micro font-medium text-gold-deep ring-1 ring-gold/30">
                  Recommended
                </span>
              </>
            )}

            <div className="flex items-center justify-between">
              <h3
                className={cn(
                  "font-display text-display-md",
                  plan.premium ? "text-ivory" : "text-ink",
                )}
              >
                {plan.name}
              </h3>
              <TierBadge type={plan.premium ? "premium" : "verified"} />
            </div>
            <p
              className={cn(
                "mt-1.5 text-body",
                plan.premium ? "text-ivory/70" : "text-stone",
              )}
            >
              {plan.tagline}
            </p>

            <div className="mt-8">
              <PriceBlock plan={plan} cycle={cycle} />
            </div>

            <ul className="mt-8 flex flex-col gap-3.5">
              {plan.features.map((f) => (
                <li
                  key={f}
                  className={cn(
                    "flex items-start gap-3 text-body",
                    plan.premium ? "text-ivory/85" : "text-ink-soft",
                  )}
                >
                  <Check
                    className={cn(
                      "mt-0.5 h-5 w-5 shrink-0",
                      plan.premium ? "text-ivory" : "text-ink",
                    )}
                    strokeWidth={2.5}
                  />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3">
              <Button asChild variant={plan.premium ? "paper" : "outline"} size="lg">
                <Link href="/apply">List your training</Link>
              </Button>
              <p
                className={cn(
                  "text-center text-micro",
                  plan.premium ? "text-ivory/60" : "text-stone",
                )}
              >
                Vetting included · no charge until approved
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
