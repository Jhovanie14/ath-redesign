"use client";

import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { cn, formatGBP } from "@/lib/utils";
import { DuotoneCover } from "./duotone-cover";
import { TierBadge } from "./tier-badge";
import { Star } from "./rating-stars";

export interface TrainerCardProps {
  trainer: Trainer;
  className?: string;
  /** Highlighted (e.g. its map marker is active). */
  active?: boolean;
  onHoverChange?: (slug: string | null) => void;
}

export function TrainerCard({
  trainer,
  className,
  active,
  onHoverChange,
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
        "group relative flex flex-col overflow-hidden rounded-card border bg-paper shadow-e2 transition-[transform,box-shadow,border-color] duration-300 ease-out",
        "hover:border-stone/40 hover:shadow-e2-hover motion-safe:hover:-translate-y-[3px]",
        active
          ? "border-stone/50 shadow-e2-hover -translate-y-[3px]"
          : "border-linen",
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
      <DuotoneCover name={trainer.name} className="h-40" initialsSize={104}>
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
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-linen text-ink transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
