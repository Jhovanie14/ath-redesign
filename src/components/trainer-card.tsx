"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { cn, formatGBP, initials } from "@/lib/utils";
import { DuotoneCover } from "./duotone-cover";
import { TierBadge } from "./tier-badge";
import { Star } from "./rating-stars";

export interface TrainerCardProps {
  trainer: Trainer;
  className?: string;
  /** Highlighted (e.g. its map marker is active). */
  active?: boolean;
  onHoverChange?: (slug: string | null) => void;
  /** Resolved server-side — TrainerCard is a client component and can't read /public itself. */
  coverSrc?: string;
  /** A real face portrait, distinct from `coverSrc` — sits as a badge in the cover's bottom-right corner. */
  headshotSrc?: string;
}

export function TrainerCard({
  trainer,
  className,
  active,
  onHoverChange,
  coverSrc,
  headshotSrc,
}: TrainerCardProps) {
  const isPremium = trainer.tier === "premium";
  return (
    <Link
      href={`/trainer/${trainer.slug}`}
      onMouseEnter={() => onHoverChange?.(trainer.slug)}
      onMouseLeave={() => onHoverChange?.(null)}
      onFocus={() => onHoverChange?.(trainer.slug)}
      onBlur={() => onHoverChange?.(null)}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card bg-paper",
        active && "ring-2 ring-inset ring-stone/40",
        className,
      )}
    >
      {isPremium && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-card ring-1 ring-inset ring-gold/40"
        />
      )}

      {/* Cover */}
      <DuotoneCover
        name={trainer.name}
        className="h-52"
        initialsSize={120}
        src={coverSrc}
        alt={`${trainer.name} — training environment`}
      >
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isPremium && <TierBadge type="premium" />}
          <TierBadge type="verified" />
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-paper/85 px-2.5 py-1 text-micro font-medium text-ink-soft backdrop-blur-sm">
            <MapPin className="h-3 w-3 text-stone" />
            {trainer.city}
          </span>
        </div>
        <div className="absolute bottom-3 right-3">
          <div className="h-11 w-11 overflow-hidden rounded-full bg-linen ring-2 ring-paper">
            {headshotSrc ? (
              <Image
                src={headshotSrc}
                alt={`${trainer.name} — portrait`}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="font-display text-micro text-ink/70">
                  {initials(trainer.name)}
                </span>
              </div>
            )}
          </div>
        </div>
      </DuotoneCover>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 font-display text-title text-ink">
          {trainer.name}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-[2.75rem] text-small text-stone">
          {trainer.headline}
        </p>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 text-gold">
            <Star />
          </span>
          <span className="font-data text-small font-medium text-ink">
            {trainer.rating.toFixed(1)}
          </span>
          <span className="font-data text-small text-stone">
            ({trainer.reviewCount})
          </span>
        </div>

        <div className="my-4 h-px w-full bg-linen" />

        <div className="mt-auto flex items-end justify-between">
          <span className="flex flex-col leading-none">
            <span className="mb-1 text-micro text-stone">From</span>
            <span className="font-data text-body font-medium text-ink">
              {formatGBP(trainer.fromPriceGBP)}
            </span>
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-linen text-ink transition-colors duration-300 ease-out group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
