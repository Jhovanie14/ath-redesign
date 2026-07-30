"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  submitStudentReviewAction,
  type SubmitReviewState,
} from "@/app/student/reviews/actions";

const INITIAL_STATE: SubmitReviewState = {};

export function LeaveReviewDialog({
  enquiryId,
  courseTitle,
}: {
  enquiryId: string;
  courseTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(
    submitStudentReviewAction,
    INITIAL_STATE,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Leave a review</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <DialogTitle className="text-title">Leave a review</DialogTitle>
        <DialogDescription className="mt-1">{courseTitle}</DialogDescription>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="enquiryId" value={enquiryId} />
          <input type="hidden" name="rating" value={rating} />

          <div>
            <p className="eyebrow mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      value <= rating ? "fill-gold text-gold" : "text-linen",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-body" className="eyebrow mb-2 block">
              Your review
            </label>
            <Textarea
              id="review-body"
              name="body"
              rows={4}
              placeholder="What stood out about the course?"
              required
            />
          </div>

          {state.error && (
            <p role="alert" className="text-micro text-error">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
