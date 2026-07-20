import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { HomeSearch } from "@/components/home-search";
import { VerificationPassport } from "@/components/verification-passport";
import { TrainerCard } from "@/components/trainer-card";
import { FoundingSpotlight } from "@/components/founding-spotlight";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { EditorialImage } from "@/components/media/editorial-image";
import { GrainOverlay } from "@/components/media/grain-overlay";
import { RatingStars } from "@/components/rating-stars";
import { VerifiedSeal } from "@/components/verified-seal";
import { ProofBand } from "@/components/home/proof-band";
import { SpecialismsStrip } from "@/components/home/specialisms-strip";
import { Testimonials, type TestimonialItem } from "@/components/home/testimonials";
import type { EditorialVariant } from "@/components/media/editorial-image";

// Full-bleed sections wrap their content in this centered, wide container.
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

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

export default async function HomePage() {
  const repo = getRepository();
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
        {/* ------------------------------------------------ Hero */}
        <section className="relative w-full overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(243,236,221,0.9) 0%, transparent 70%)",
            }}
          />
          <div className={`${CONTAINER} relative pb-12 pt-10 sm:pt-14`}>
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              <Reveal>
                <SectionEyebrow>
                  Vetted training. Verified reviews.
                </SectionEyebrow>
                <h1 className="mt-6 font-display text-display-xl text-ink">
                  Find the <span className="italic">right</span> aesthetics
                  trainer near you.
                </h1>
                <p className="mt-6 max-w-xl text-body leading-relaxed text-ink-soft">
                  Every educator on the Hub is insured, qualified and reviewed
                  by real students. No anonymous listings. No directories of
                  unknowns.
                </p>

                <div className="mt-8 max-w-xl">
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

              {/* Layered media composition */}
              <div className="relative">
                <EditorialImage
                  variant="hero"
                  priority
                  src={resolveImage("images/hero")}
                  alt="A trainer demonstrating an aesthetics technique in a warm studio"
                  className="h-[380px] w-full rounded-[22px] border border-linen shadow-e2 sm:h-[460px] lg:h-[540px]"
                >
                  <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-linen bg-paper/80 px-3 py-1.5 shadow-e1 backdrop-blur-sm motion-safe:animate-[floatSlower_7s_ease-in-out_infinite]">
                    <RatingStars rating={avgRating} size={13} />
                    <span className="font-data text-micro font-medium text-ink">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="font-data text-micro text-stone">
                      · {totalReviews} reviews
                    </span>
                  </div>
                </EditorialImage>

                <div className="absolute -bottom-6 left-2 w-[76%] max-w-[300px] motion-safe:animate-[floatSlow_6s_ease-in-out_infinite] sm:-left-4">
                  <VerificationPassport
                    animated
                    rotate={-2}
                    sealSize={40}
                    title="Dr Amara Okafor"
                    rows={[
                      { label: "Insurance in date", note: "Feb 2026" },
                      { label: "Qualifications checked", note: "Dec 2025" },
                      { label: "GMC confirmed", note: "7412088" },
                    ]}
                    footer="Reviewed by a human · Jan 2026"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------ Proof band */}
        <section className="w-full">
          <div className={`${CONTAINER} pb-4 pt-14 sm:pt-20`}>
            <Reveal>
              <ProofBand stats={stats} />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ Specialisms */}
        <section className="w-full">
          <div className={`${CONTAINER} py-16 sm:py-20`}>
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

        {/* ------------------------------------------------ How it works */}
        <section className="w-full">
          <div className={`${CONTAINER} py-16 sm:py-20`}>
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
                  className="overflow-hidden rounded-card border border-linen bg-paper shadow-e2"
                >
                  <EditorialImage
                    variant={step.variant}
                    src={resolveImage(`images/steps/step-${i + 1}`)}
                    className="relative h-24"
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
          <div className={`${CONTAINER} py-16 sm:py-20`}>
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
          </div>
        </section>

        {/* ------------------------------------------------ Testimonials */}
        {testimonials.length > 0 && (
          <section className="w-full">
            <div className={`${CONTAINER} py-16 sm:py-20`}>
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
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(185,154,91,0.28) 0%, transparent 70%)",
            }}
          />
          <GrainOverlay opacity={0.05} />
          <div className={`${CONTAINER} relative py-20 sm:py-28`}>
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
                  <Button asChild variant="paper">
                    <Link href="/apply">List your training</Link>
                  </Button>
                  <Button asChild variant="ghostInk">
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
