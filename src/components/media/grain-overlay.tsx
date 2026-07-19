import { cn } from "@/lib/utils";

/**
 * Subtle film-grain texture, rendered as an inline SVG turbulence overlay.
 * Adds warmth and depth to flat surfaces without external assets.
 */
export function GrainOverlay({
  className,
  opacity = 0.06,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full mix-blend-soft-light",
        className,
      )}
      style={{ opacity }}
    >
      <filter id="ath-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves={2}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#ath-grain)" />
    </svg>
  );
}
