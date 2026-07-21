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
import { formatShortDate } from "@/lib/utils";
import type { Practitioner, PractitionerStatus } from "@/lib/practitioners";

export interface PractitionerReviewDialogProps {
  practitioner: Practitioner | null;
  status: PractitionerStatus;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (slug: string, status: PractitionerStatus) => void;
}

export function PractitionerReviewDialog({
  practitioner,
  status,
  onOpenChange,
  onStatusChange,
}: PractitionerReviewDialogProps) {
  return (
    <Dialog open={!!practitioner} onOpenChange={onOpenChange}>
      <DialogContent
        position="center"
        className="max-h-[85vh] max-w-lg overflow-y-auto p-6 sm:p-8"
      >
        {practitioner && (
          <>
            <DialogHeader>
              <DialogTitle className="text-title">
                {practitioner.name}
              </DialogTitle>
              <DialogDescription>
                {practitioner.headline} · {practitioner.city}
              </DialogDescription>
            </DialogHeader>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              <ReviewField
                label="Tier"
                value={practitioner.tier === "premium" ? "Premium" : "Standard"}
              />
              <ReviewField
                label="Rating"
                value={`${practitioner.rating.toFixed(1)} · ${practitioner.reviewCount} reviews`}
              />
              <ReviewField
                label="Registration"
                value={
                  practitioner.regBody
                    ? `${practitioner.regBody} ${practitioner.regNumber}`
                    : "Not applicable"
                }
              />
              <ReviewField
                label="Insurance renewal"
                value={
                  <span
                    className={
                      practitioner.renewalUrgency === "overdue"
                        ? "text-error"
                        : practitioner.renewalUrgency === "due-soon"
                          ? "text-warning"
                          : "text-ink"
                    }
                  >
                    {formatShortDate(practitioner.renewalDue)}
                    {practitioner.renewalUrgency === "overdue" &&
                      ` · ${Math.abs(practitioner.daysUntilRenewal)}d overdue`}
                    {practitioner.renewalUrgency === "due-soon" &&
                      ` · in ${practitioner.daysUntilRenewal}d`}
                  </span>
                }
              />
            </dl>

            {practitioner.renewalUrgency !== "current" && (
              <p className="mt-5 rounded-xl border border-linen bg-linen/40 px-4 py-3 text-small leading-relaxed text-ink-soft">
                {practitioner.renewalUrgency === "overdue"
                  ? "Cover has lapsed — this listing is paused automatically until insurance is confirmed renewed."
                  : "Insurance renews soon. Confirm the updated certificate before it lapses to avoid an automatic pause."}
              </p>
            )}

            <DialogFooter className="mt-7">
              <Link
                href={`/trainer/${practitioner.slug}`}
                target="_blank"
                className="inline-flex items-center text-small text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline sm:mr-auto"
              >
                View public profile
              </Link>
              {status === "active" ? (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(practitioner.slug, "paused")}
                >
                  Pause listing
                </Button>
              ) : (
                <Button
                  onClick={() => onStatusChange(practitioner.slug, "active")}
                >
                  Reinstate listing
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
