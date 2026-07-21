"use client";

import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatGBP, formatShortDate } from "@/lib/utils";
import type { Application, ApplicationStatus } from "@/lib/applications";

export interface ApplicationReviewDialogProps {
  application: Application | null;
  onOpenChange: (open: boolean) => void;
  onDecide: (id: string, status: ApplicationStatus) => void;
}

export function ApplicationReviewDialog({
  application,
  onOpenChange,
  onDecide,
}: ApplicationReviewDialogProps) {
  return (
    <Dialog open={!!application} onOpenChange={onOpenChange}>
      <DialogContent
        position="center"
        className="max-h-[85vh] max-w-xl overflow-y-auto p-6 sm:p-8"
      >
        {application && (
          <>
            <DialogHeader>
              <DialogTitle className="text-title">
                {application.name}
              </DialogTitle>
              <DialogDescription>
                {application.headline} · {application.city}
              </DialogDescription>
            </DialogHeader>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4">
              <ReviewField label="Email" value={application.email} />
              <ReviewField
                label="Experience"
                value={`${application.yearsExperience} years`}
              />
              <ReviewField
                label="Tier"
                value={`${application.tier === "premium" ? "Premium" : "Standard"} · ${application.billingCycle}`}
              />
              <ReviewField
                label="Submitted"
                value={formatShortDate(application.submittedAt)}
              />
              <ReviewField
                label="Registration"
                value={`${application.regBody} ${application.regNumber}`}
              />
              <ReviewField
                label="Insurance renewal"
                value={formatShortDate(application.insuranceRenewal)}
              />
            </dl>

            <div className="mt-5">
              <p className="eyebrow !text-stone">Bio</p>
              <p className="mt-2 text-small leading-relaxed text-ink-soft">
                {application.bio}
              </p>
            </div>

            <div className="mt-5">
              <p className="eyebrow !text-stone">Specialisms</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {application.categories.map((c) => (
                  <Badge key={c} variant="outline">
                    {CATEGORY_LABELS[c]}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="eyebrow !text-stone">Proposed courses</p>
              <ul className="mt-2 space-y-2">
                {application.courses.map((c) => (
                  <li
                    key={c.title}
                    className="flex items-center justify-between gap-3 rounded-xl border border-linen px-3.5 py-2.5 text-small"
                  >
                    <span className="text-ink">{c.title}</span>
                    <span className="font-data text-ink-soft">
                      {formatGBP(c.priceGBP)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter className="mt-7">
              {application.status === "pending" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => onDecide(application.id, "rejected")}
                  >
                    Decline
                  </Button>
                  <Button onClick={() => onDecide(application.id, "approved")}>
                    Approve
                  </Button>
                </>
              ) : (
                <div className="flex w-full items-center justify-between gap-3">
                  <Badge
                    variant={
                      application.status === "approved" ? "success" : "error"
                    }
                  >
                    {application.status === "approved"
                      ? "Approved"
                      : "Declined"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecide(application.id, "pending")}
                  >
                    Reopen
                  </Button>
                </div>
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
