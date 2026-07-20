import type { Trainer } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { RatingStars } from "@/components/rating-stars";
import { VerifiedSeal } from "@/components/verified-seal";
import { SectionEyebrow } from "@/components/section-eyebrow";

export function ReviewList({ trainer }: { trainer: Trainer }) {
  return (
    <section id="reviews" className="scroll-mt-24">
      <SectionEyebrow>Reviews</SectionEyebrow>
      <h2 className="sr-only">Reviews</h2>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-baseline gap-3">
          <span className="font-data text-display-md font-medium text-ink">
            {trainer.rating.toFixed(1)}
          </span>
          <div className="flex flex-col gap-1">
            <RatingStars rating={trainer.rating} size={16} />
            <span className="font-data text-micro text-stone">
              {trainer.reviewCount} reviews
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 max-w-prose text-small leading-relaxed text-ink-soft">
        Every review is tied to a verified booking — only students who attended
        can post.
      </p>

      <ul className="mt-7 flex flex-col gap-4">
        {trainer.reviews.map((review) => (
          <li
            key={review.id}
            className="rounded-card border border-linen bg-paper p-6"
          >
            <RatingStars rating={review.rating} size={14} />
            <p className="mt-3 text-body leading-relaxed text-ink-soft">
              {review.body}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="font-data text-micro text-stone">
                {review.studentInitials} · {review.courseTitle} ·{" "}
                {formatMonthYear(review.date)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-micro font-medium text-ink-soft">
                <VerifiedSeal size={16} />
                Booking verified
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
