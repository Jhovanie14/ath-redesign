import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { resolveImage } from "@/lib/media";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Stat } from "@/components/stat";
import { VerifiedSeal } from "@/components/verified-seal";
import { VerificationPassport } from "@/components/verification-passport";
import { Button } from "@/components/ui/button";
import { EditorialImage } from "@/components/media/editorial-image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How the Aesthetic Training Hub keeps training trustworthy — hand-checked trainers, verified reviews, and a clear route for students and educators.",
};

const CONTAINER = "mx-auto w-full max-w-[1600px] px-5 sm:px-8";

const HERO_STATS = [
  { value: "100%", label: "Trainers hand-checked" },
  { value: "£0", label: "Student booking fee" },
  { value: "Verified", label: "Reviews only from bookings" },
];

const STUDENT_STEPS = [
  {
    n: "01",
    title: "Search by location and course",
    body: "Filter by specialism, city and a radius that suits you. The map shows every vetted trainer nearby, so you choose from a real shortlist — not a directory of unknowns.",
  },
  {
    n: "02",
    title: "Enquire on-platform",
    body: "Message a trainer directly through the Hub. There's no booking fee and no middleman: your enquiry goes straight to them, and they typically reply within two working days.",
  },
  {
    n: "03",
    title: "Book, attend, review",
    body: "Arrange the course with the trainer, attend, then leave a review tied to your booking. Your honest account is what helps the next student choose well.",
  },
];

const CHECKS = [
  {
    title: "Insurance in date",
    body: "We confirm current medical malpractice and public liability cover — and the date it runs to.",
  },
  {
    title: "Qualifications verified",
    body: "We check the qualifications behind every course a trainer lists, not just their headline.",
  },
  {
    title: "Professional registration",
    body: "For doctors, nurses and dentists we confirm GMC, NMC or GDC registration is active.",
  },
  {
    title: "Reviewed by a human",
    body: "Someone on our team signs off every listing. No automatic approvals.",
  },
];

const TRAINER_STEPS = [
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

const FAQS = [
  {
    q: "Does it cost anything to enquire or book?",
    a: "No. Students never pay a booking fee to use the Hub. You deal with the trainer directly on their course price — we don't take a cut of it.",
  },
  {
    q: "How do you verify a trainer's qualifications?",
    a: "We check the qualifications behind each course against the issuing bodies, and confirm professional registration where it applies. It's a manual check, repeated every time a listing renews.",
  },
  {
    q: "What happens if a trainer's insurance lapses?",
    a: "Their listing pauses automatically until cover is back in date. You'll only ever see trainers whose insurance is current.",
  },
  {
    q: "Who can leave a review?",
    a: "Only a student with a booking made through the Hub. Every review carries a 'Booking verified' mark, and there's no way to post one without having attended.",
  },
  {
    q: "Are all trainers medically qualified?",
    a: "Not all. Some are doctors, nurses or dentists — and we show their GMC, NMC or GDC registration when they are. Others are experienced practitioners. Medical or not, every trainer passes the same vetting.",
  },
  {
    q: "How do I get listed as a trainer?",
    a: "Apply, pass vetting, and go live. The whole process is manual and you're never charged until your listing is approved and live.",
  },
];

export default function HowItWorksPage() {
  const heroSrc = resolveImage("images/how-it-works-hero");
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ---------------------------------------------- Hero (split, edge-to-edge) */}
        <section className="relative w-full overflow-hidden">
          <div className="flex flex-col px-5 pb-6 pt-16 sm:px-8 sm:pt-24 lg:min-h-[620px] lg:flex-row lg:items-center lg:pb-0 lg:pt-0">
            <Reveal className="w-full max-w-3xl pl-4 sm:pl-6 lg:w-1/2 lg:max-w-none lg:py-16 lg:pl-8 lg:pr-14">
              <SectionEyebrow>How it works</SectionEyebrow>
              <h1 className="mt-6 font-display text-display-xl text-ink">
                Find training you can <span className="italic">trust</span> —
                and know exactly why.
              </h1>
              <p className="mt-6 max-w-2xl text-body leading-relaxed text-ink-soft lg:max-w-none">
                The Hub exists to take the guesswork out of booking aesthetics
                training. Every educator is checked before they&rsquo;re
                listed, and every review comes from a student who actually
                attended. Here&rsquo;s how that works — on both sides.
              </p>
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

            {/* Media — floats with a small margin from the viewport edges on
                desktop, full-width band on mobile. */}
            <div className="relative -mx-5 mt-10 h-[420px] sm:-mx-8 sm:h-[480px] lg:absolute lg:inset-y-6 lg:right-6 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[46%]">
              <EditorialImage
                variant="warm"
                priority
                src={heroSrc}
                alt="A trainer guiding a student through a technique on a practice arm"
                className="absolute inset-0 h-full w-full lg:rounded-[32px]"
                // Box height drives the object-cover crop here, not its
                // declared width — request full viewport width so the
                // fetched srcset entry is large enough to avoid upscaling.
                sizes="100vw"
              />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- For students (tinted, full-bleed) */}
        <section className="w-full border-y border-linen/70 bg-linen">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal>
              <SectionEyebrow>For students</SectionEyebrow>
              <h2 className="mt-5 max-w-2xl font-display text-display-md text-ink">
                Your route to the right course.
              </h2>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-5 md:grid-cols-3">
              {STUDENT_STEPS.map((step) => (
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
          </div>
        </section>

        {/* ---------------------------------------------- Vetting (Level 3) */}
        <section className="w-full bg-ink text-ivory">
          <div className={`${CONTAINER} py-24 sm:py-32`}>
            <Reveal className="max-w-2xl">
              <span className="eyebrow !text-stone">Vetting</span>
              <h2 className="mt-5 font-display text-display-lg text-ivory">
                What &ldquo;vetted&rdquo; actually means.
              </h2>
              <p className="mt-4 text-body leading-relaxed text-ivory/75">
                Before a trainer appears on the Hub, we check four things by
                hand. If any lapse, the listing pauses automatically.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
              <RevealGroup className="flex flex-col">
                {CHECKS.map((check) => (
                  <RevealItem
                    key={check.title}
                    className="flex gap-4 border-b border-ivory/15 py-5 last:border-0"
                  >
                    <div className="mt-0.5 shrink-0">
                      <VerifiedSeal size={22} />
                    </div>
                    <div>
                      <h3 className="font-display text-title text-ivory">
                        {check.title}
                      </h3>
                      <p className="mt-1 text-small leading-relaxed text-ivory/70">
                        {check.body}
                      </p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              <Reveal className="lg:pl-4">
                <VerificationPassport
                  className="mx-auto w-full max-w-sm"
                  rows={[
                    { label: "Insurance in date", note: "Feb 2026" },
                    { label: "Qualifications checked", note: "Dec 2025" },
                    { label: "Registration confirmed", note: "GMC / NMC / GDC" },
                    { label: "Human review passed", note: "Jan 2026" },
                  ]}
                  footer="Listings renew on a schedule and pause the moment cover lapses."
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- Verified reviews */}
        <section className="w-full">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
              <div>
                <SectionEyebrow>Verified reviews</SectionEyebrow>
                <h2 className="mt-5 max-w-xl font-display text-display-md text-ink">
                  Reviews only from students who were there.
                </h2>
                <p className="mt-4 max-w-xl text-body leading-relaxed text-ink-soft">
                  Every review on the Hub is tied to a verified booking. If you
                  didn&rsquo;t attend, you can&rsquo;t post one — so
                  there&rsquo;s no anonymous praise and no planted criticism,
                  just accounts from people who sat in the room.
                </p>
              </div>
              <div className="rounded-card border border-linen bg-paper p-6">
                <p className="text-body leading-relaxed text-ink-soft">
                  &ldquo;Five of us over two days, and I injected four live
                  models rather than watching from the back.&rdquo;
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-linen pt-4">
                  <VerifiedSeal size={16} />
                  <span className="text-micro font-medium text-ink-soft">
                    Booking verified
                  </span>
                  <span className="font-data text-micro text-stone">
                    · Foundation in Facial Aesthetics
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------- FAQ (tinted, full-bleed) */}
        <section className="w-full border-y border-linen/70 bg-linen">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal>
              <SectionEyebrow>Questions</SectionEyebrow>
              <h2 className="mt-5 font-display text-display-md text-ink">
                Common questions.
              </h2>
            </Reveal>
            <Reveal className="mt-8">
              <Accordion type="single" collapsible className="border-t border-ink/10">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`faq-${i}`}>
                    <AccordionTrigger>{faq.q}</AccordionTrigger>
                    <AccordionContent>{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Reveal>
          </div>
        </section>

        {/* ---------------------------------------------- For trainers */}
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
