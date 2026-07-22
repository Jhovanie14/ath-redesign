import { SectionEyebrow } from "@/components/section-eyebrow";
import { HomeSearch } from "@/components/home-search";
import { Reveal } from "@/components/motion";
import { EditorialImage } from "@/components/media/editorial-image";
import { VerifiedSeal } from "@/components/verified-seal";

export interface HeroProps {
  avgRating: number;
  totalReviews: number;
  heroSrc?: string;
}

/** Current hero: text column + image bleeding to the right viewport edge. */
export function SplitHero({ heroSrc }: HeroProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="flex flex-col px-4 pt-10 sm:px-6 lg:min-h-[calc(100dvh-68px)] lg:flex-row lg:items-center lg:px-8 lg:pt-0">
        {/* Text — now a true half of the full-bleed hero, not a fraction of a
            capped container, so it scales in step with the vw-based photo. */}
        <Reveal className="w-full max-w-xl lg:w-1/2 lg:max-w-none lg:py-24 lg:pr-16">
          <SectionEyebrow>Vetted training. Verified reviews.</SectionEyebrow>
          <h1 className="mt-6 font-display text-display-xl text-ink">
            Find the <span className="italic">right</span> aesthetics
            trainer near you.
          </h1>
          <p className="mt-6 max-w-xl text-body leading-relaxed text-ink-soft lg:max-w-none">
            Every educator on the Hub is insured, qualified and reviewed by
            real students. No anonymous listings. No directories of unknowns.
          </p>

          <div className="mt-8 max-w-xl lg:max-w-none">
            <HomeSearch />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-micro text-stone">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink-soft">
              <VerifiedSeal size={16} />
              Insured
            </span>
            <span aria-hidden>·</span>
            <span>Qualifications verified</span>
            <span aria-hidden>·</span>
            <span className="font-data">GMC · NMC · GDC checked</span>
          </div>
        </Reveal>

        {/* Media — floats with a small margin from the viewport edges on
            desktop, full-width band on mobile. */}
        <div className="relative -mx-4 mt-10 h-[440px] sm:-mx-6 sm:h-[520px] lg:absolute lg:inset-y-6 lg:right-6 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[50vw]">
          <EditorialImage
            variant="hero"
            priority
            src={heroSrc}
            alt="A trainer demonstrating an aesthetics technique in a warm studio"
            className="absolute inset-0 h-full w-full lg:rounded-[32px]"
            // The box is near full-viewport-height but only 50vw wide, while
            // the source photo is landscape — object-cover scales it up to
            // match the box's height, which needs far more source pixels
            // than a "50vw" width hint would fetch. Request full viewport
            // width instead so the browser pulls a large enough srcset entry.
            sizes="100vw"
            objectPosition="80% 38%"
          />
        </div>
      </div>
    </section>
  );
}
