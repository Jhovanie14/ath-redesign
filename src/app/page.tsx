import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Stat } from "@/components/stat";
import { Button } from "@/components/ui/button";
import { HomeSearch } from "@/components/home-search";
import { VerificationPassport } from "@/components/verification-passport";
import { TrainerCard } from "@/components/trainer-card";
import { FoundingSpotlight } from "@/components/founding-spotlight";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";

const CONTAINER = "mx-auto w-full max-w-[1240px] px-5 sm:px-8";

const HERO_STATS = [
  { value: "100%", label: "Insurance verified" },
  { value: "£0", label: "Booking fee for students" },
  { value: "UK-wide", label: "Map & radius search" },
];

const STEPS = [
  {
    n: "01",
    title: "Search by location & course",
    body: "Filter by specialism, city and radius to see only the vetted trainers who teach what you want, near you.",
  },
  {
    n: "02",
    title: "Enquire on-platform",
    body: "Message a trainer directly through the Hub. No booking fee, no middleman — your enquiry goes straight to them.",
  },
  {
    n: "03",
    title: "Book, learn, review",
    body: "Attend your course, then leave a review tied to your booking. Only students who were there can post one.",
  },
];

export default async function HomePage() {
  const repo = getRepository();
  // Change this constant to reach the cold-start spotlight branch.
  const FEATURED_LIMIT = 3;
  const featured = await repo.getFeatured(FEATURED_LIMIT);
  const showGrid = featured.length >= 3;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ------------------------------------------------ Hero */}
        <section className={`${CONTAINER} pb-6 pt-12 sm:pb-8 sm:pt-16`}>
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <Reveal>
              <SectionEyebrow>Vetted training. Verified reviews.</SectionEyebrow>
              <h1 className="mt-6 font-display text-display-xl text-ink">
                Find the <span className="italic">right</span> aesthetics
                trainer near you.
              </h1>
              <p className="mt-6 max-w-xl text-body leading-relaxed text-ink-soft">
                Every educator on the Hub is insured, qualified and reviewed by
                real students. No anonymous listings. No directories of
                unknowns.
              </p>

              <div className="mt-8 max-w-xl">
                <HomeSearch />
              </div>

              <dl className="mt-8 flex divide-x divide-linen">
                {HERO_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="min-w-0 px-4 first:pl-0 last:pr-0 sm:px-6"
                  >
                    <Stat value={s.value} label={s.label} size="sm" />
                  </div>
                ))}
              </dl>
            </Reveal>

            {/* Verification Passport — animated hero motif */}
            <div className="relative flex justify-center lg:justify-end">
              <div
                aria-hidden
                className="absolute inset-0 -z-10 mx-8 my-6 rounded-[16px] bg-linen/60"
                style={{ rotate: "3deg" }}
              />
              <VerificationPassport
                animated
                rotate={-2}
                className="w-full max-w-sm"
                title="Dr Amara Okafor"
                rows={[
                  { label: "Insurance in date", note: "Feb 2026" },
                  { label: "Qualifications checked", note: "Dec 2025" },
                  { label: "GMC registration confirmed", note: "GMC 7412088" },
                ]}
                footer="Reviewed by a human · Jan 2026"
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ How it works */}
        <section className={`${CONTAINER} py-20 sm:py-24`}>
          <Reveal>
            <SectionEyebrow>How it works</SectionEyebrow>
            <h2 className="mt-5 max-w-2xl font-display text-display-md text-ink">
              A trusted route to your next course.
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((step) => (
              <RevealItem
                key={step.n}
                className="rounded-card border border-linen bg-paper p-7"
              >
                <span className="font-data text-display-md text-ink/20">
                  {step.n}
                </span>
                <h3 className="mt-4 font-display text-title text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-small leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ------------------------------------------------ Featured trainers */}
        <section className={`${CONTAINER} py-20 sm:py-24`}>
          <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionEyebrow>Featured trainers</SectionEyebrow>
              <h2 className="mt-5 font-display text-display-md text-ink">
                Vetted educators on the Hub.
              </h2>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/search">
                Browse all trainers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </Reveal>

          {showGrid ? (
            <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((trainer) => (
                <RevealItem key={trainer.slug}>
                  <TrainerCard trainer={trainer} />
                </RevealItem>
              ))}
            </RevealGroup>
          ) : (
            <div className="mt-10">
              <FoundingSpotlight trainer={featured[0]} />
            </div>
          )}

          <div className="mt-8 sm:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/search">
                Browse all trainers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        {/* ------------------------------------------------ Trainer CTA (Level 3) */}
        <section className="bg-ink text-ivory">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow !text-stone">For trainers</span>
              <h2 className="mt-5 font-display text-display-lg text-ivory">
                Train students? Get listed.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-body leading-relaxed text-ivory/75">
                List on a Standard or Premium tier once your insurance and
                qualifications are checked. You&rsquo;re never charged until
                your listing is approved and live.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="paper">
                  <Link href="/apply">List your training</Link>
                </Button>
                <Button asChild variant="ghostInk">
                  <Link href="/pricing">See tiers & pricing</Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
