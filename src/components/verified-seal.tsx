import { cn } from "@/lib/utils";

// Reeded "stamp" edge — short radial ticks generated once at module scope.
// Coordinates are rounded to a fixed precision so the server- and
// client-rendered SVG strings are byte-identical (no hydration mismatch).
const round = (n: number) => Math.round(n * 1000) / 1000;
const TICKS = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 2;
  const inner = 18.5;
  const outer = 21;
  return {
    x1: round(22 + Math.cos(angle) * inner),
    y1: round(22 + Math.sin(angle) * inner),
    x2: round(22 + Math.cos(angle) * outer),
    y2: round(22 + Math.sin(angle) * outer),
  };
});

export interface VerifiedSealProps {
  /** Rendered size in px. 16 (card), 22 (badge), 44 (panel). */
  size?: 16 | 22 | 44 | number;
  className?: string;
  /** Accessible label. When omitted the seal is decorative (aria-hidden). */
  title?: string;
}

/**
 * The one and only verification mark in the product: a document-style seal
 * with a reeded edge, double ring and centred check. Gold on gold-tint —
 * the single sanctioned card-level use of gold.
 */
export function VerifiedSeal({
  size = 22,
  className,
  title,
}: VerifiedSealProps) {
  const decorative = !title;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      className={cn("shrink-0", className)}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : title}
    >
      {title ? <title>{title}</title> : null}
      {/* Reeded stamp edge */}
      <g stroke="var(--gold)" strokeWidth={1.1} strokeLinecap="round">
        {TICKS.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
        ))}
      </g>
      {/* Double ring */}
      <circle
        cx="22"
        cy="22"
        r="17"
        fill="var(--gold-tint)"
        stroke="var(--gold)"
        strokeWidth="1.4"
      />
      <circle
        cx="22"
        cy="22"
        r="14"
        fill="none"
        stroke="var(--gold)"
        strokeWidth="0.9"
        opacity="0.65"
      />
      {/* Centred check glyph */}
      <path
        d="M15.5 22.5 L20 27 L29 16.5"
        stroke="var(--gold-deep)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
