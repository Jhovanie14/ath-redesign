"use client";

import { useState } from "react";
import type { BillingCycle, Subscription, SubscriptionStatus } from "@/lib/billing";
import { priceForTier } from "@/lib/billing";
import { formatGBP, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  function confirmCancel() {
    onToggleStatus();
    setConfirmOpen(false);
  }

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-card border border-linen bg-paper p-7 shadow-e1">
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

        <div className="mt-6 flex items-baseline gap-2 border-t border-[#E4DED4] pt-6">
          <span className="font-data text-[44px] font-medium leading-none text-ink">
            {formatGBP(price)}
          </span>
          <span className="text-small text-[#9A9285]">
            per {cycle === "annual" ? "year" : "month"}
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-1">
          <p className="text-small text-ink">
            Renews {formatShortDate(renewsOn)}
          </p>
          <p className="text-small text-[#9A9285]">
            {cycle === "annual" ? "Annual" : "Monthly"} billing
          </p>
        </div>

        <div className="mt-6 border-t border-[#E4DED4] pt-6">
          <p className="text-small font-semibold text-ink">
            Subscription management
          </p>
          <div className="mt-3">
            {active ? (
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="-ml-2.5 rounded-lg px-2.5 py-2 text-small font-medium text-[#746F65] transition-colors duration-150 hover:bg-[#F9ECEA] hover:text-[#A34F46] focus-visible:bg-[#F9ECEA] focus-visible:text-[#A34F46]"
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

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-title">
              Cancel subscription?
            </DialogTitle>
            <DialogDescription>
              Your plan stays active until {formatShortDate(renewsOn)}. After
              that, your listing will come down from search until you
              reinstate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-7">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep subscription
            </Button>
            <Button
              onClick={confirmCancel}
              className="bg-error text-ivory hover:bg-error/90"
            >
              Cancel subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
