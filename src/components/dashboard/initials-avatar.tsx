import Image from "next/image";
import { initials, cn } from "@/lib/utils";

export function InitialsAvatar({
  name,
  avatarSrc,
  className,
}: {
  name: string;
  avatarSrc?: string;
  className?: string;
}) {
  if (avatarSrc) {
    return (
      <span
        className={cn(
          "block h-9 w-9 shrink-0 overflow-hidden rounded-full bg-linen",
          className,
        )}
      >
        <Image
          src={avatarSrc}
          alt={name}
          width={36}
          height={36}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }

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
