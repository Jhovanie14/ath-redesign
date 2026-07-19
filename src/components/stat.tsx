import { cn } from "@/lib/utils";

export interface StatProps {
  value: React.ReactNode;
  label: string;
  className?: string;
  /** Visual size of the value. */
  size?: "sm" | "md";
}

/** Mono value over a stone label — the data-display atom. */
export function Stat({ value, label, className, size = "md" }: StatProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          "font-data font-medium text-ink",
          size === "md" ? "text-title" : "text-body",
        )}
      >
        {value}
      </span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
