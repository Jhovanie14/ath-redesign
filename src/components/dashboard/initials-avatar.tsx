import { initials, cn } from "@/lib/utils";

export function InitialsAvatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linen font-data text-micro font-medium text-ink-soft",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
