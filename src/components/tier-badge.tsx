import { cn } from "@/lib/utils";
import { VerifiedSeal } from "./verified-seal";

export interface TierBadgeProps {
  /** "premium" renders the gold Premium chip; "verified" the standard mark. */
  type: "premium" | "verified";
  className?: string;
}

/**
 * Premium: gold-tint fill, gold-deep text — the only card-level gold besides
 * the seal and stars. Verified: paper fill, hairline, VerifiedSeal + label.
 */
export function TierBadge({ type, className }: TierBadgeProps) {
  if (type === "premium") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-gold-tint px-2.5 py-1 text-micro font-medium leading-none text-gold-deep ring-1 ring-gold/30",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
        Premium
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-linen bg-paper py-1 pl-1 pr-2.5 text-micro font-medium leading-none text-ink-soft",
        className,
      )}
    >
      <VerifiedSeal size={16} />
      Verified
    </span>
  );
}
