import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { formatGBP } from "@/lib/utils";
import { DuotoneCover } from "./duotone-cover";
import { TierBadge } from "./tier-badge";
import { RatingStars } from "./rating-stars";
import { Button } from "./ui/button";

/**
 * Cold-start branch: when fewer than three trainers can be featured, one
 * educator is presented as a curated founding spotlight — never lonely.
 */
export function FoundingSpotlight({ trainer }: { trainer: Trainer }) {
  return (
    <div className="grid overflow-hidden rounded-card border border-linen bg-paper shadow-e2 md:grid-cols-[40%_1fr]">
      <DuotoneCover
        name={trainer.name}
        className="min-h-52 md:min-h-full"
        initialsSize={160}
      >
        <div className="absolute left-4 top-4">
          <TierBadge type={trainer.tier === "premium" ? "premium" : "verified"} />
        </div>
      </DuotoneCover>

      <div className="flex flex-col p-8">
        <span className="eyebrow">Founding educator</span>
        <h3 className="mt-3 font-display text-display-md text-ink">
          {trainer.name}
        </h3>
        <p className="mt-1 text-small text-stone">{trainer.headline}</p>

        <div className="mt-3 flex items-center gap-2">
          <RatingStars rating={trainer.rating} size={15} />
          <span className="font-data text-small font-medium text-ink">
            {trainer.rating.toFixed(1)}
          </span>
          <span className="font-data text-small text-stone">
            ({trainer.reviewCount})
          </span>
        </div>

        <p className="mt-4 max-w-prose text-body leading-relaxed text-ink-soft">
          {trainer.bio}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <span className="flex flex-col leading-none">
            <span className="mb-1 text-micro text-stone">From</span>
            <span className="font-data text-title font-medium text-ink">
              {formatGBP(trainer.fromPriceGBP)}
            </span>
          </span>
          <Button asChild>
            <Link href={`/trainer/${trainer.slug}`}>
              View profile
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
