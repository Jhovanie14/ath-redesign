import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { TrainerCard } from "@/components/trainer-card";
import { FoundingSpotlight } from "@/components/founding-spotlight";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { EditorialImage } from "@/components/media/editorial-image";
import { GrainOverlay } from "@/components/media/grain-overlay";
import { ProofBand } from "@/components/home/proof-band";
import { SpecialismsStrip } from "@/components/home/specialisms-strip";
import { Testimonials, type TestimonialItem } from "@/components/home/testimonials";
import { SplitHero } from "@/components/home/split-hero";
import { OverlayHero } from "@/components/home/overlay-hero";
import type { EditorialVariant } from "@/components/media/editorial-image";

// Full-bleed sections wrap their content in this centered, wide container.
const CONTAINER = "mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8";

const STEPS: { n: string; title: string; body: string; variant: EditorialVariant }[] =
  [
    {
      n: "01",
      title: "Search by location & course",
      body: "Filter by specialism, city and radius to see only the vetted trainers who teach what you want, near you.",
      variant: "hero",
    },
    {
      n: "02",
      title: "Enquire on-platform",
      body: "Message a trainer directly through the Hub. No booking fee, no middleman — your enquiry goes straight to them.",
      variant: "gold",
    },
    {
      n: "03",
      title: "Book, learn, review",
      body: "Attend your course, then leave a review tied to your booking. Only students who were there can post one.",
      variant: "stone",
    },
  ];

const APPLY_BULLETS = [
  "Free until your listing is approved and live",
  "Vetting does the trust-building for you",
  "Reach students who are actively searching",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ hero?: string }>;
}) {
  const { hero } = await searchParams;
  const repo = getRepository();
  const ctaBg = resolveImage("images/cta-band");
  const heroSrc = resolveImage("images/hero-3");
  const FEATURED_LIMIT = 3;
  const [featured, all] = await Promise.all([
    repo.getFeatured(FEATURED_LIMIT),
    repo.getAll(),
  ]);
  const showGrid = featured.length >= 3;

  // Data-driven proof.
  const studentsTrained = all.reduce((s, t) => s + t.studentsTrained, 0);
  const totalReviews = all.reduce((s, t) => s + t.reviewCount, 0);
  const avgRating = all.reduce((s, t) => s + t.rating, 0) / all.length;

  const stats = [
    {
      value: Math.floor(studentsTrained / 100) * 100,
      suffix: "+",
      label: "Students trained",
    },
    { value: avgRating, decimals: 1, label: "Average rating" },
    { value: totalReviews, label: "Verified reviews" },
    { value: 100, suffix: "%", label: "Insurance-checked" },
  ];

  // Testimonials — one strong review per trainer (excluding the test fixture).
  const testimonials: TestimonialItem[] = [];
  for (const t of all) {
    if (t.slug === "dr-test-trainer") continue;
    const r = t.reviews.find((rv) => rv.rating === 5);
    if (r)
      testimonials.push({
        body: r.body,
        initials: r.studentInitials,
        rating: r.rating,
        course: r.courseTitle,
        trainer: t.name,
      });
    if (testimonials.length >= 3) break;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ------------------------------------------------ Hero (edge-to-edge) */}
        {/* Mockup toggle: visit /?hero=overlay to compare the alternative
            full-width-photo-with-overlay hero against the current split hero. */}
        {hero === "overlay" ? (
          <OverlayHero
            avgRating={avgRating}
            totalReviews={totalReviews}
            heroSrc={heroSrc}
          />
        ) : (
          <SplitHero
            avgRating={avgRating}
            totalReviews={totalReviews}
            heroSrc={heroSrc}
          />
        )}

        {/* ------------------------------------------------ Proof band (tinted, full-bleed) */}
        <section className="w-full border-y border-linen/70 bg-linen">
          <div className={`${CONTAINER} py-16 sm:py-24`}>
            <Reveal>
              <ProofBand stats={stats} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ Specialisms */}
        <section className="w-full">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <SectionEyebrow>Explore by specialism</SectionEyebrow>
                <h2 className="mt-5 font-display text-display-md text-ink">
                  Train in what you want to offer.
                </h2>
              </div>
              <Button asChild variant="outline" className="hidden sm:inline-flex">
                <Link href="/search">
                  See all trainers
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </Reveal>
            <Reveal className="mt-10">
              <SpecialismsStrip />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ How it works (tinted, full-bleed) */}
        <section className="w-full border-y border-linen/70 bg-linen">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal>
              <SectionEyebrow>How it works</SectionEyebrow>
              <h2 className="mt-5 max-w-2xl font-display text-display-md text-ink">
                A trusted route to your next course.
              </h2>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <RevealItem
                  key={step.n}
                  className="overflow-hidden rounded-card border border-linen bg-paper"
                >
                  <EditorialImage
                    variant={step.variant}
                    src={resolveImage(`images/steps/step-${i + 1}`)}
                    className="relative h-48 sm:h-56"
                  >
                    <span className="absolute left-5 top-3 font-data text-display-md text-ink/55">
                      {step.n}
                    </span>
                  </EditorialImage>
                  <div className="p-6">
                    <h3 className="font-display text-title text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-small leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ------------------------------------------------ Featured trainers */}
        <section className="w-full">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
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
                    <TrainerCard
                      trainer={trainer}
                      coverSrc={resolveImage(`trainers/${trainer.slug}`)}
                      headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
                    />
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
          </div>
        </section>

        {/* ------------------------------------------------ Testimonials */}
        {testimonials.length > 0 && (
          <section className="w-full border-y border-linen/70 bg-linen">
            <div className={`${CONTAINER} py-20 sm:py-28`}>
              <Reveal>
                <SectionEyebrow>From real students</SectionEyebrow>
                <h2 className="mt-5 max-w-2xl font-display text-display-md text-ink">
                  Reviews you can actually trust.
                </h2>
                <p className="mt-3 max-w-xl text-small leading-relaxed text-ink-soft">
                  Every review is tied to a verified booking — only students who
                  attended can post one.
                </p>
              </Reveal>
              <Reveal className="mt-10">
                <Testimonials items={testimonials} />
              </Reveal>
            </div>
          </section>
        )}

        {/* ------------------------------------------------ Trainer CTA (Level 3) */}
        <section className="relative w-full overflow-hidden bg-ink text-ivory">
          {ctaBg && (
            <>
              <Image
                src={ctaBg}
                alt=""
                fill
                className="object-cover"
                sizes="100vw"
              />
              <div aria-hidden className="absolute inset-0 bg-ink/75" />
            </>
          )}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(185,154,91,0.28) 0%, transparent 70%)",
            }}
          />
          <GrainOverlay opacity={0.05} />
          <div className={`${CONTAINER} relative py-24 sm:py-32`}>
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <Reveal>
                <span className="eyebrow !text-stone">For trainers</span>
                <h2 className="mt-5 font-display text-display-lg text-ivory">
                  Train students? Get listed.
                </h2>
                <p className="mt-4 max-w-xl text-body leading-relaxed text-ivory/75">
                  List on a Standard or Premium tier once your insurance and
                  qualifications are checked. You&rsquo;re never charged until
                  your listing is approved and live.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant="paper" size="lg">
                    <Link href="/apply">List your training</Link>
                  </Button>
                  <Button asChild variant="ghostInk" size="lg">
                    <Link href="/pricing">See tiers & pricing</Link>
                  </Button>
                </div>
              </Reveal>

              <Reveal>
                <ul className="flex flex-col gap-4 rounded-card border border-ivory/15 bg-ivory/[0.03] p-7">
                  {APPLY_BULLETS.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-deep">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <span className="text-small leading-relaxed text-ivory/85">
                        {b}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
