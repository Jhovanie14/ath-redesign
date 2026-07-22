import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/media/editorial-image";
import { ProofBand } from "@/components/home/proof-band";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Why the Aesthetic Training Hub exists — a vetted directory built on insurance-checked trainers and reviews only from real bookings.",
};

const CONTAINER = "mx-auto w-full max-w-[1600px] px-5 sm:px-8";

const VALUES: { title: string; body: string }[] = [
  {
    title: "No anonymous listings",
    body: "Every trainer is a named, checked professional — never an unverifiable handle in a directory.",
  },
  {
    title: "Reviews only from real bookings",
    body: "You can't post a review without a booking made through the Hub. No planted praise, no anonymous pile-ons.",
  },
  {
    title: "Insurance checked, always",
    body: "We confirm current cover before a listing goes live, and it pauses automatically the moment that cover lapses.",
  },
  {
    title: "Human review, not algorithms",
    body: "Someone on our team signs off every listing by hand. There's no automatic approval queue.",
  },
];

const TRAINER_STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "01",
    title: "Apply",
    body: "Tell us about your training and share your insurance and qualifications.",
  },
  {
    n: "02",
    title: "Pass vetting",
    body: "We check everything by hand. You're never charged until you're approved.",
  },
  {
    n: "03",
    title: "Go live",
    body: "Your verified listing appears on the Hub, ready for student enquiries.",
  },
];

export default async function AboutPage() {
  const heroSrc = resolveImage("images/about-hero");
  const repo = getRepository();
  const all = await repo.getAll();

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

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ---------------------------------------------- Hero (split, edge-to-edge) */}
        <section className="relative w-full overflow-hidden">
          <div className="flex flex-col px-5 pb-6 pt-16 sm:px-8 sm:pt-24 lg:min-h-[620px] lg:flex-row lg:items-center lg:pb-0 lg:pt-0">
            <Reveal className="w-full max-w-3xl pl-4 sm:pl-6 lg:w-1/2 lg:max-w-none lg:py-16 lg:pl-8 lg:pr-14">
              <SectionEyebrow>About us</SectionEyebrow>
              <h1 className="mt-6 font-display text-display-xl text-ink">
                Training you can <span className="italic">trust</span>, not
                just find.
              </h1>
              <p className="mt-6 max-w-2xl text-body leading-relaxed text-ink-soft lg:max-w-none">
                Aesthetic training is full of anonymous listings and
                unverifiable claims. The Hub exists to fix that — every
                trainer is insurance-checked and qualification-verified
                before they&rsquo;re listed, and every review comes from a
                student who actually attended. No guesswork. No directories
                of unknowns.
              </p>
            </Reveal>

            {/* Media — floats with a small margin from the viewport edges on
                desktop, full-width band on mobile. */}
            <div className="relative -mx-5 mt-10 h-[420px] sm:-mx-8 sm:h-[480px] lg:absolute lg:inset-y-6 lg:right-6 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[46%]">
              <EditorialImage
                variant="warm"
                priority
                src={heroSrc}
                alt="A trainer and student in a bright aesthetics training studio"
                className="absolute inset-0 h-full w-full lg:rounded-[32px]"
                sizes="100vw"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- Why we exist + What we stand for */}
        <section className="w-full">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal className="max-w-2xl">
              <SectionEyebrow>Why we exist</SectionEyebrow>
              <h2 className="mt-5 font-display text-display-md text-ink">
                Anonymous listings shouldn&rsquo;t decide your training.
              </h2>
              <p className="mt-4 text-body leading-relaxed text-ink-soft">
                Booking aesthetics training used to mean scrolling
                directories with no way to check who was actually qualified,
                insured, or any good. A polished profile told you nothing
                about whether the person behind it could be trusted with a
                needle.
              </p>
              <p className="mt-4 text-body leading-relaxed text-ink-soft">
                Every listing on the Hub is checked by a person, not an
                algorithm, before it goes live — and it stays live only for
                as long as that trainer&rsquo;s insurance and registration
                remain current. That&rsquo;s the whole idea: fewer,
                better-checked listings instead of an unfiltered directory.
              </p>
            </Reveal>

            <Reveal className="mt-16">
              <SectionEyebrow>What we stand for</SectionEyebrow>
              <h2 className="mt-5 max-w-2xl font-display text-display-md text-ink">
                The standard every listing meets.
              </h2>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v) => (
                <RevealItem
                  key={v.title}
                  className="rounded-card border border-linen bg-paper p-7"
                >
                  <h3 className="font-display text-title text-ink">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-small leading-relaxed text-ink-soft">
                    {v.body}
                  </p>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal className="mt-8">
              <p className="text-small text-ink-soft">
                Want the full detail?{" "}
                <Link
                  href="/how-it-works"
                  className="font-medium text-ink underline underline-offset-2 hover:text-stone"
                >
                  See exactly how vetting works →
                </Link>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------- Proof band (tinted, full-bleed) */}
        <section className="w-full border-y border-linen/70 bg-linen">
          <div className={`${CONTAINER} py-16 sm:py-24`}>
            <Reveal>
              <ProofBand stats={stats} />
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------- Trainer CTA */}
        <section className="w-full">
          <div className={`${CONTAINER} pb-28 pt-10 sm:pb-32`}>
            <Reveal className="rounded-card border border-linen bg-paper p-8 sm:p-12">
              <div className="max-w-2xl">
                <SectionEyebrow>For trainers</SectionEyebrow>
                <h2 className="mt-5 font-display text-display-md text-ink">
                  Get listed in three steps.
                </h2>
              </div>
              <div className="mt-10 grid gap-6 sm:grid-cols-3">
                {TRAINER_STEPS.map((step) => (
                  <div key={step.n}>
                    <span className="font-data text-title text-ink/25">
                      {step.n}
                    </span>
                    <h3 className="mt-2 font-display text-title text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-small leading-relaxed text-ink-soft">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/apply">List your training</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">
                    See tiers &amp; pricing
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
