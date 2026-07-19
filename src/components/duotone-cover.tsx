import { cn } from "@/lib/utils";
import { initials as toInitials } from "@/lib/utils";

/** Deterministic warm duotone derived from the trainer's initials. */
function coverStyle(seed: string): React.CSSProperties {
  const code =
    (seed.charCodeAt(0) || 65) + (seed.charCodeAt(seed.length - 1) || 65);
  const angle = 125 + (code % 55);
  return {
    backgroundImage: `radial-gradient(120% 120% at 80% -10%, rgba(253,252,250,0.7) 0%, rgba(253,252,250,0) 42%), linear-gradient(${angle}deg, #efeadf 0%, var(--linen) 38%, #d3ccbd 82%, #c3bba9 100%)`,
  };
}

export interface DuotoneCoverProps {
  name: string;
  className?: string;
  children?: React.ReactNode;
  /** Font size (px) of the ghosted initials. */
  initialsSize?: number;
}

/**
 * Soft duotone panel carrying a trainer's initials in Fraunces at low opacity.
 * Shared by TrainerCard covers and the profile hero band.
 */
export function DuotoneCover({
  name,
  className,
  children,
  initialsSize = 120,
}: DuotoneCoverProps) {
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={coverStyle(name)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-4 right-4 select-none font-display font-medium leading-none text-ink/[0.07]"
        style={{ fontSize: initialsSize }}
      >
        {toInitials(name)}
      </span>
      {children}
    </div>
  );
}
