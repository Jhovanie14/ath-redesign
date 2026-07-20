import { SectionEyebrow } from "@/components/section-eyebrow";
import { HomeSearch } from "@/components/home-search";
import { Reveal } from "@/components/motion";
import { EditorialImage } from "@/components/media/editorial-image";
import { GrainOverlay } from "@/components/media/grain-overlay";
import { VerifiedSeal } from "@/components/verified-seal";
import type { HeroProps } from "./split-hero";

/**
 * Alternative hero: one full-width photo bleeding to every viewport edge,
 * with the headline overlaid directly on it behind an ink scrim (bottom-up
 * on mobile, left-to-right from `sm` up) rather than sitting beside it.
 */
export function OverlayHero({ heroSrc }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[calc(100dvh-68px)] min-h-[600px]">
        <EditorialImage
          variant="hero"
          priority
          src={heroSrc}
          alt="A trainer demonstrating an aesthetics technique in a warm studio"
          className="absolute inset-0 h-full w-full"
          grain={false}
          sizes="100vw"
        />

        {/* Scrim: bottom-weighted on mobile so text has a dark base to sit on;
            left-weighted from sm up so the right half of the photo stays clear. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent sm:bg-gradient-to-r sm:from-ink/85 sm:via-ink/45 sm:to-transparent"
        />
        <GrainOverlay opacity={0.06} />

        {/* Text — overlaid directly on the image, anchored bottom on mobile,
            vertically centred in the readable left band from sm up. */}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 pb-9 sm:justify-center sm:p-10 sm:pb-10 lg:w-[46%] lg:max-w-none lg:p-16">
          <Reveal>
            <SectionEyebrow>Vetted training. Verified reviews.</SectionEyebrow>
            <h1 className="mt-6 font-display text-display-xl text-ivory">
              Find the <span className="italic">right</span> aesthetics
              trainer near you.
            </h1>
            <p className="mt-6 max-w-xl text-body leading-relaxed text-ivory/80 lg:max-w-none">
              Every educator on the Hub is insured, qualified and reviewed by
              real students. No anonymous listings. No directories of
              unknowns.
            </p>

            <div className="mt-8 max-w-xl lg:max-w-none">
              <HomeSearch />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-micro text-ivory/70">
              <span className="inline-flex items-center gap-1.5 font-medium text-ivory">
                <VerifiedSeal size={16} />
                Insured
              </span>
              <span aria-hidden>·</span>
              <span>Qualifications verified</span>
              <span aria-hidden>·</span>
              <span className="font-data">GMC · NMC · GDC checked</span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
