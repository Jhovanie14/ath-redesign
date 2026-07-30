"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { toggleSavedTrainerAction } from "@/app/student/saved/actions";
import { TrainerCard } from "@/components/trainer-card";

export function SavedTrainerCard({
  trainer,
  coverSrc,
  headshotSrc,
}: {
  trainer: Trainer;
  coverSrc?: string;
  headshotSrc?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();

  if (hidden) return null;

  function handleUnsave() {
    setHidden(true);
    startTransition(async () => {
      await toggleSavedTrainerAction(trainer.slug);
    });
  }

  return (
    <div className="relative">
      <TrainerCard trainer={trainer} coverSrc={coverSrc} headshotSrc={headshotSrc} />
      <button
        type="button"
        onClick={handleUnsave}
        disabled={pending}
        aria-label={`Unsave ${trainer.name}`}
        className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-error backdrop-blur-sm transition-colors hover:bg-paper"
      >
        <Heart className="h-4 w-4 fill-error" />
      </button>
    </div>
  );
}
