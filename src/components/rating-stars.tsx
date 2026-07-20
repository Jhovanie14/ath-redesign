import { cn } from "@/lib/utils";

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-full w-full", className)} aria-hidden>
      <path
        d="M12 2.2l2.7 5.9 6.4.7-4.8 4.3 1.3 6.3L12 16.9 6.4 19.7l1.3-6.3L2.9 9.1l6.4-.7z"
        fill="currentColor"
      />
    </svg>
  );
}

export interface RatingStarsProps {
  rating: number;
  /** Pixel size of each star. */
  size?: number;
  className?: string;
  /** Hide the visually-hidden text label (when a nearby number states it). */
  hideLabel?: boolean;
}

/** Five-star row with fractional gold fill. Gold here is sanctioned. */
export function RatingStars({
  rating,
  size = 14,
  className,
  hideLabel,
}: RatingStarsProps) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = [0, 1, 2, 3, 4];
  return (
    <span
      className={cn("relative inline-flex", className)}
      style={{ height: size }}
    >
      {/* rest state */}
      <span className="inline-flex text-linen" aria-hidden>
        {stars.map((i) => (
          <span key={i} style={{ width: size, height: size }}>
            <Star />
          </span>
        ))}
      </span>
      {/* gold fill */}
      <span
        className="absolute inset-0 inline-flex overflow-hidden text-gold"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        {stars.map((i) => (
          <span key={i} style={{ width: size, height: size, flexShrink: 0 }}>
            <Star />
          </span>
        ))}
      </span>
      {!hideLabel && (
        <span className="sr-only">{rating.toFixed(1)} out of 5</span>
      )}
    </span>
  );
}

export { Star };
