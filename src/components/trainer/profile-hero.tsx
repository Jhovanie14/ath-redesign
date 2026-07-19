"use client";

import { useState } from "react";
import { Heart, MapPin } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { cn, formatGBP, initials } from "@/lib/utils";
import { DuotoneCover } from "@/components/duotone-cover";
import { TierBadge } from "@/components/tier-badge";
import { RatingStars } from "@/components/rating-stars";
import { Stat } from "@/components/stat";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "./enquiry-dialog";

export function ProfileHero({ trainer }: { trainer: Trainer }) {
  const [saved, setSaved] = useState(false);
  const isPremium = trainer.tier === "premium";

  return (
    <section>
      <DuotoneCover
        name={trainer.name}
        className="h-52 rounded-card sm:h-64"
        initialsSize={220}
      />

      <div className="relative z-10 px-0 sm:px-6">
        <div className="-mt-16 rounded-card border border-linen bg-paper p-6 shadow-e2 sm:-mt-20 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-linen bg-linen">
                <span className="font-display text-title text-ink/70">
                  {initials(trainer.name)}
                </span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {isPremium && <TierBadge type="premium" />}
                  <TierBadge type="verified" />
                </div>
                <h1 className="mt-2.5 font-display text-display-lg text-ink">
                  {trainer.name}
                </h1>
                <p className="mt-1 text-body text-stone">{trainer.headline}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone" />
                    {trainer.city}
                  </span>
                  <span aria-hidden className="text-stone">
                    ·
                  </span>
                  <span className="font-data text-stone">
                    {trainer.availabilityNote}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-2.5">
              <EnquiryDialog trainer={trainer}>
                <Button>Enquire</Button>
              </EnquiryDialog>
              <Button
                variant="outline"
                aria-pressed={saved}
                onClick={() => setSaved((s) => !s)}
              >
                <Heart
                  className={cn("h-4 w-4", saved && "fill-error text-error")}
                />
                {saved ? "Saved" : "Save"}
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <RatingStars rating={trainer.rating} size={17} />
              <span className="font-data text-body font-medium text-ink">
                {trainer.rating.toFixed(1)}
              </span>
              <span className="font-data text-small text-stone">
                {trainer.reviewCount} reviews
              </span>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <Stat
                value={`${trainer.yearsExperience} yrs`}
                label="Experience"
                size="sm"
              />
              <div className="sm:border-l sm:border-linen sm:pl-8">
                <Stat
                  value={`${trainer.studentsTrained}+`}
                  label="Students trained"
                  size="sm"
                />
              </div>
              <div className="sm:border-l sm:border-linen sm:pl-8">
                <Stat
                  value={formatGBP(trainer.fromPriceGBP)}
                  label="From"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
