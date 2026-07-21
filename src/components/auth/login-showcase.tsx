"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ShowcaseQuote {
  quote: string;
  attribution: string;
  context: string;
}

export interface LoginShowcaseProps {
  imageSrc: string;
  imageAlt: string;
  quotes: [ShowcaseQuote, ...ShowcaseQuote[]];
}

const AUTO_ADVANCE_MS = 6000;
const FADE_MS = 400;

export function LoginShowcase({
  imageSrc,
  imageAlt,
  quotes,
}: LoginShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const active = quotes[index];

  const go = useCallback(
    (delta: number) => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + delta + quotes.length) % quotes.length);
        setVisible(true);
      }, FADE_MS);
    },
    [quotes.length],
  );

  // Auto-advance; the timer restarts whenever `index` changes, whether from
  // this timer or a manual arrow click, so a manual click doesn't get
  // immediately stomped by a queued auto-advance.
  useEffect(() => {
    if (quotes.length <= 1) return;
    const id = window.setTimeout(() => go(1), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [index, quotes.length, go]);

  return (
    <div className="relative hidden overflow-hidden bg-ink lg:block">
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 0vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-ink/55" />

      <div className="absolute left-8 top-8">
        <Image
          src="/logos/wordmark-stone.png"
          alt="Aesthetic Training Hub"
          width={123}
          height={40}
          className="h-8 w-auto opacity-90"
        />
      </div>

      <div
        className={cn(
          "absolute inset-x-8 bottom-24 transition-opacity ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{ transitionDuration: `${FADE_MS}ms` }}
      >
        <blockquote className="font-display text-display-md leading-[1.1] text-ivory">
          &ldquo;{active.quote}&rdquo;
        </blockquote>
      </div>

      <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-4">
        <div
          className={cn(
            "transition-opacity ease-out",
            visible ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <p className="text-small font-medium text-ivory">
            {active.attribution}
          </p>
          <p className="mt-0.5 text-micro text-ivory/65">{active.context}</p>
        </div>

        {quotes.length > 1 && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next testimonial"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/25 text-ivory transition-colors hover:bg-ivory/10"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {quotes.length > 1 && (
        <div className="absolute left-8 top-20 flex gap-1.5">
          {quotes.map((q, i) => (
            <span
              key={q.attribution}
              className={cn(
                "h-1 w-6 rounded-full transition-colors",
                i === index ? "bg-ivory" : "bg-ivory/25",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
