"use client";

import type { BillingCycle } from "@/lib/billing";
import { cn } from "@/lib/utils";

const OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "annual", label: "Annual" },
];

export function BillingCycleSelector({
  cycle,
  disabled,
  onChange,
}: {
  cycle: BillingCycle;
  disabled?: boolean;
  onChange: (cycle: BillingCycle) => void;
}) {
  return (
    <div>
      <h2 className="font-sans text-title font-semibold text-ink">
        Choose your billing cycle
      </h2>
      <p className="mt-1 text-small text-ink-soft">
        Switch between monthly and annual pricing.
      </p>

      <div
        role="radiogroup"
        aria-label="Billing cycle"
        className="mt-4 inline-flex h-11 w-full items-center gap-1 rounded-xl border border-linen bg-paper p-1 sm:w-auto"
      >
        {OPTIONS.map((option) => {
          const active = cycle === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-full flex-1 rounded-lg px-6 text-small font-medium transition-colors duration-150 sm:flex-initial",
                active
                  ? "bg-ink text-ivory"
                  : "text-ink hover:bg-linen/70",
                disabled && "cursor-not-allowed opacity-50 hover:bg-transparent",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
