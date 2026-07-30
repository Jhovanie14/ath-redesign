"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { Trainer } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { cn, formatGBP, initials } from "@/lib/utils";
import { toggleSavedTrainerAction } from "@/app/student/saved/actions";
import { DuotoneCover } from "@/components/duotone-cover";
import { TierBadge } from "@/components/tier-badge";
import { RatingStars } from "@/components/rating-stars";
import { Stat } from "@/components/stat";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "./enquiry-dialog";

export function ProfileHero({
  trainer,
  coverSrc,
  headshotSrc,
  session,
  saved,
}: {
  trainer: Trainer;
  /** Resolved server-side — ProfileHero is a client component and can't read /public itself. */
  coverSrc?: string;
  /** A real face portrait, distinct from `coverSrc` — the avatar shown beside the trainer's name. */
  headshotSrc?: string;
  session: Session | null;
  /** Whether the current student has already saved this trainer. */
  saved: boolean;
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [, startTransition] = useTransition();
  const isPremium = trainer.tier === "premium";
  const canSave = session?.role === "student";

  function handleSaveClick() {
    setIsSaved((s) => !s);
    startTransition(async () => {
      await toggleSavedTrainerAction(trainer.slug);
    });
  }

  return (
    <section>
      <DuotoneCover
        name={trainer.name}
        className="h-64 rounded-card sm:h-80"
        initialsSize={220}
        src={coverSrc}
        alt={`${trainer.name} — training environment`}
        priority
      />

      <div className="relative z-10 px-0 sm:px-6">
        <div className="-mt-16 rounded-card border border-linen bg-paper p-6 sm:-mt-20 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5 sm:gap-6">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-linen ring-4 ring-paper sm:h-28 sm:w-28">
                {headshotSrc ? (
                  <Image
                    src={headshotSrc}
                    alt={`${trainer.name} — portrait`}
                    width={112}
                    height={112}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-title text-ink/70">
                      {initials(trainer.name)}
                    </span>
                  </div>
                )}
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

            <div className="flex shrink-0 gap-2.5 sm:self-center">
              <EnquiryDialog trainer={trainer} session={session}>
                <Button>Enquire</Button>
              </EnquiryDialog>
              {canSave ? (
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={isSaved}
                  onClick={handleSaveClick}
                >
                  <Heart
                    className={cn("h-4 w-4", isSaved && "fill-error text-error")}
                  />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link
                    href={`/student/login?next=${encodeURIComponent(`/trainer/${trainer.slug}`)}`}
                  >
                    <Heart className="h-4 w-4" />
                    Save
                  </Link>
                </Button>
              )}
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
