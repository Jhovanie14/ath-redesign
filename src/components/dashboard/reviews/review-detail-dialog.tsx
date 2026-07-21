"use client";

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
import { RatingStars } from "@/components/rating-stars";
import { formatShortDate } from "@/lib/utils";
import type { AdminReview, ReviewStatus } from "@/lib/reviews";

export interface ReviewDetailDialogProps {
  review: AdminReview | null;
  status: ReviewStatus;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

export function ReviewDetailDialog({
  review,
  status,
  onOpenChange,
  onStatusChange,
}: ReviewDetailDialogProps) {
  return (
    <Dialog open={!!review} onOpenChange={onOpenChange}>
      <DialogContent
        position="center"
        className="max-h-[85vh] max-w-lg overflow-y-auto p-6 sm:p-8"
      >
        {review && (
          <>
            <DialogHeader>
              <DialogTitle className="text-title">
                {review.practitionerName}
              </DialogTitle>
              <DialogDescription>
                {review.courseTitle} · {formatShortDate(review.date)}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5">
              <RatingStars rating={review.rating} size={16} />
              <p className="mt-3 text-body leading-relaxed text-ink-soft">
                {review.body}
              </p>
              <p className="mt-4 font-data text-micro text-stone">
                {review.studentInitials} · Booking verified
              </p>
            </div>

            <DialogFooter className="mt-7">
              <Link
                href={`/trainer/${review.practitionerSlug}#reviews`}
                target="_blank"
                className="inline-flex items-center text-small text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline sm:mr-auto"
              >
                View public profile
              </Link>
              {status === "visible" ? (
                <Button
                  variant="outline"
                  onClick={() => onStatusChange(review.id, "hidden")}
                >
                  Hide review
                </Button>
              ) : (
                <Button onClick={() => onStatusChange(review.id, "visible")}>
                  Unhide review
                </Button>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
