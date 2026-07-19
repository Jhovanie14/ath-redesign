import { cn } from "@/lib/utils";

export interface SectionEyebrowProps {
  children: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Letterspaced micro label preceded by a short rule — marks a section. */
export function SectionEyebrow({
  children,
  align = "left",
  className,
}: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        align === "center" && "justify-center",
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-stone/50" />
      <span className="eyebrow">{children}</span>
      {align === "center" && (
        <span aria-hidden className="h-px w-6 bg-stone/50" />
      )}
    </div>
  );
}
