import Image from "next/image";
import { cn } from "@/lib/utils";
import { GrainOverlay } from "./grain-overlay";

/**
 * A single visual slot. Today it renders hand-authored editorial craft art
 * (layered gradient + soft orbs + contour motif + grain). Pass `src` later
 * to swap in a real photograph with no other change to the call site.
 */
export type EditorialVariant = "hero" | "warm" | "stone" | "gold";

interface VariantSpec {
  gradient: string;
  orbs: { color: string; className: string }[];
  stroke: string;
  accent: string;
  rotate: number;
}

const VARIANTS: Record<EditorialVariant, VariantSpec> = {
  hero: {
    gradient:
      "linear-gradient(155deg, #f8f3ea 0%, #efe7d5 36%, #e2d6bd 70%, #cabf9f 100%)",
    orbs: [
      { color: "rgba(185,154,91,0.38)", className: "-right-10 -top-12 h-72 w-72" },
      {
        color: "rgba(169,161,144,0.40)",
        className: "-bottom-16 -left-12 h-80 w-80",
      },
    ],
    stroke: "rgba(38,37,31,0.10)",
    accent: "rgba(154,125,64,0.24)",
    rotate: -16,
  },
  warm: {
    gradient:
      "linear-gradient(160deg, #f6efe1 0%, #efe4cd 45%, #e4d3ae 100%)",
    orbs: [
      { color: "rgba(185,154,91,0.34)", className: "-right-8 -bottom-10 h-56 w-56" },
    ],
    stroke: "rgba(38,37,31,0.09)",
    accent: "rgba(154,125,64,0.22)",
    rotate: 8,
  },
  stone: {
    gradient:
      "linear-gradient(150deg, #efece4 0%, #e3ddd0 50%, #cfc7b6 100%)",
    orbs: [
      { color: "rgba(169,161,144,0.42)", className: "-left-8 -top-8 h-56 w-56" },
    ],
    stroke: "rgba(38,37,31,0.08)",
    accent: "rgba(38,37,31,0.14)",
    rotate: -24,
  },
  gold: {
    gradient:
      "linear-gradient(150deg, #f7efdc 0%, #f0e4c6 48%, #e3d0a3 100%)",
    orbs: [
      { color: "rgba(185,154,91,0.45)", className: "-right-6 -top-6 h-52 w-52" },
    ],
    stroke: "rgba(154,125,64,0.16)",
    accent: "rgba(154,125,64,0.30)",
    rotate: 14,
  },
};

function ContourMotif({
  stroke,
  accent,
  rotate,
}: {
  stroke: string;
  accent: string;
  rotate: number;
}) {
  const rings = Array.from({ length: 9 }, (_, i) => 26 + i * 24);
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 520"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <g transform={`translate(298 150) rotate(${rotate})`}>
        {rings.map((r, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="0"
            rx={r}
            ry={r * 0.8}
            fill="none"
            stroke={i % 3 === 0 ? accent : stroke}
            strokeWidth={i % 3 === 0 ? 1.4 : 1}
          />
        ))}
      </g>
    </svg>
  );
}

export interface EditorialImageProps {
  variant?: EditorialVariant;
  /** Provide to swap the craft art for a real photograph. */
  src?: string;
  alt?: string;
  className?: string;
  children?: React.ReactNode;
  grain?: boolean;
  motif?: boolean;
  priority?: boolean;
  /** Override the responsive `sizes` hint — default assumes a 50vw desktop slot. */
  sizes?: string;
  /** CSS `object-position` for the photo — e.g. "75% center" to keep a
   * subject sitting toward one edge of the source from being cropped out
   * by `object-cover`. Defaults to centred. */
  objectPosition?: string;
}

export function EditorialImage({
  variant = "hero",
  src,
  alt = "",
  className,
  children,
  grain = true,
  motif = true,
  priority,
  sizes = "(max-width: 1024px) 100vw, 50vw",
  objectPosition,
}: EditorialImageProps) {
  const spec = VARIANTS[variant];
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          style={objectPosition ? { objectPosition } : undefined}
          sizes={sizes}
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ backgroundImage: spec.gradient }}
          />
          {spec.orbs.map((orb, i) => (
            <div
              key={i}
              aria-hidden
              className={cn("absolute rounded-full blur-2xl", orb.className)}
              style={{
                background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              }}
            />
          ))}
          {motif && (
            <ContourMotif
              stroke={spec.stroke}
              accent={spec.accent}
              rotate={spec.rotate}
            />
          )}
        </>
      )}
      {grain && <GrainOverlay opacity={0.08} />}
      {children}
    </div>
  );
}
