"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatGBP, formatShortDate } from "@/lib/utils";
import type { Subscription, SubscriptionStatus } from "@/lib/billing";

export interface SubscriptionReviewDialogProps {
  subscription: Subscription | null;
  status: SubscriptionStatus;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (slug: string, status: SubscriptionStatus) => void;
}

export function SubscriptionReviewDialog({
  subscription,
  status,
  onOpenChange,
  onStatusChange,
}: SubscriptionReviewDialogProps) {
  return (
    <Dialog open={!!subscription} onOpenChange={onOpenChange}>
      <DialogContent
        position="center"
        className="max-h-[85vh] max-w-lg overflow-y-auto p-6 sm:p-8"
      >
        {subscription && (
          <>
            <DialogHeader>
              <DialogTitle className="text-title">
                {subscription.name}
              </DialogTitle>
              <DialogDescription>{subscription.city}</DialogDescription>
            </DialogHeader>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              <ReviewField
                label="Tier"
                value={subscription.tier === "premium" ? "Premium" : "Standard"}
              />
              <ReviewField
                label="Cycle"
                value={subscription.cycle === "annual" ? "Annual" : "Monthly"}
              />
              <ReviewField
                label="Price"
                value={`${formatGBP(subscription.priceGBP)} / ${
                  subscription.cycle === "annual" ? "yr" : "mo"
                }`}
              />
              <ReviewField
                label="Renews on"
                value={formatShortDate(subscription.renewsOn)}
              />
            </dl>

            <DialogFooter className="mt-7">
              <Link
                href={`/trainer/${subscription.slug}`}
                target="_blank"
                className="inline-flex items-center text-small text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline sm:mr-auto"
              >
                View public profile
              </Link>
              {status === "active" ? (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(subscription.slug, "cancelled")}
                >
                  Cancel subscription
                </Button>
              ) : (
                <Button
                  onClick={() => onStatusChange(subscription.slug, "active")}
                >
                  Reinstate subscription
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="eyebrow !text-stone">{label}</dt>
      <dd className="mt-1 text-small text-ink">{value}</dd>
    </div>
  );
}
