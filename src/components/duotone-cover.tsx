import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/utils";
import { GrainOverlay } from "./media/grain-overlay";

function seedCode(seed: string): number {
  return (seed.charCodeAt(0) || 65) + (seed.charCodeAt(seed.length - 1) || 65);
}

/** Deterministic warm duotone derived from the trainer's initials. */
function coverStyle(code: number): React.CSSProperties {
  const angle = 125 + (code % 55);
  return {
    backgroundImage: `radial-gradient(120% 120% at 80% -10%, rgba(253,252,250,0.75) 0%, rgba(253,252,250,0) 44%), linear-gradient(${angle}deg, #f1ece1 0%, var(--linen) 36%, #d3ccbd 80%, #c1b8a4 100%)`,
  };
}

export interface DuotoneCoverProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
  /** Font size (px) of the ghosted initials. */
  initialsSize?: number;
  /** Provide to layer a real photo beneath the duotone wash. */
  src?: string;
  alt?: string;
  priority?: boolean;
}

/**
 * Soft duotone panel carrying a trainer's initials in Fraunces at low opacity,
 * warmed with a seed-placed gold glow and film grain for depth. Pass `src` to
 * layer a real photo beneath the gradient — a genuine duotone wash rather
 * than a full swap, so the per-trainer glow and ghosted initials still read
 * on top and no two covers look like a flat photo repeat.
 */
export function DuotoneCover({
  name,
  className,
  children,
  initialsSize = 120,
  src,
  alt = "",
  priority,
}: DuotoneCoverProps) {
  const code = seedCode(name);
  const glowIntensity = 0.14 + (code % 16) / 140;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          unoptimized={src.startsWith("blob:")}
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 420px"
        />
      )}
      <div
        aria-hidden
        className={cn("absolute inset-0", src && "opacity-60")}
        style={coverStyle(code)}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute h-40 w-40 rounded-full blur-2xl",
          code % 2 === 0 ? "-left-10 top-2" : "-right-8 -top-6",
        )}
        style={{
          background: `radial-gradient(circle, rgba(185,154,91,${glowIntensity}) 0%, transparent 70%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 right-4 select-none font-display font-medium leading-none text-ink/[0.08]"
        style={{ fontSize: initialsSize }}
      >
        {toInitials(name)}
      </span>
      <GrainOverlay opacity={0.07} />
      {children}
    </div>
  );
}
