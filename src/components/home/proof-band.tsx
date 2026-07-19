import { cn } from "@/lib/utils";
import { GrainOverlay } from "@/components/media/grain-overlay";
import { CountUp } from "./count-up";

export interface ProofStat {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

/** Animated, data-driven credibility band. */
export function ProofBand({ stats }: { stats: ProofStat[] }) {
  return (
    <div className="relative overflow-hidden rounded-card border border-linen bg-paper shadow-e2">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 140% at 100% 0%, rgba(243,236,221,0.9) 0%, transparent 55%)",
        }}
      />
      <GrainOverlay opacity={0.05} />
      <dl className="relative grid grid-cols-2 divide-linen md:grid-cols-4 md:divide-x">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "px-6 py-8 text-center",
              i >= 2 && "border-t border-linen md:border-t-0",
              i % 2 === 1 && "border-l border-linen md:border-l-0",
            )}
          >
            <dt className="font-data text-display-md font-medium text-ink">
              <CountUp
                end={s.value}
                decimals={s.decimals}
                prefix={s.prefix}
                suffix={s.suffix}
              />
            </dt>
            <dd className="eyebrow mt-2">{s.label}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
