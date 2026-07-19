import { RatingStars } from "@/components/rating-stars";
import { VerifiedSeal } from "@/components/verified-seal";

export interface TestimonialItem {
  body: string;
  initials: string;
  rating: number;
  course: string;
  trainer: string;
}

export function Testimonials({ items }: { items: TestimonialItem[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((t, i) => (
        <figure
          key={i}
          className="flex flex-col rounded-card border border-linen bg-paper p-6 shadow-e2"
        >
          <RatingStars rating={t.rating} size={15} />
          <blockquote className="mt-4 flex-1 text-body leading-relaxed text-ink-soft">
            &ldquo;{t.body}&rdquo;
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 border-t border-linen pt-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linen font-data text-micro font-medium text-ink-soft">
              {t.initials.replace(/\./g, "")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-small font-medium text-ink">
                {t.initials} · {t.trainer}
              </span>
              <span className="block truncate font-data text-micro text-stone">
                {t.course}
              </span>
            </span>
            <span title="Booking verified">
              <VerifiedSeal size={16} />
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
