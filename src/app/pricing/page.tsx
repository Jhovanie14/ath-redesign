import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { VerifiedSeal } from "@/components/verified-seal";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "@/components/motion";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Standard and Premium tiers for aesthetics trainers. Vetting is included and you're never charged until your listing is approved and live.",
};

const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";

type Cell = boolean | string;
const COMPARISON: { feature: string; standard: Cell; premium: Cell }[] = [
  { feature: "Verified listing on the Hub", standard: true, premium: true },
  { feature: "Search and map placement", standard: "Standard", premium: "Priority" },
  { feature: "Student enquiries", standard: "Unlimited", premium: "Unlimited" },
  { feature: "Verified reviews", standard: true, premium: true },
  { feature: "Courses and pricing on profile", standard: true, premium: true },
  { feature: "Premium badge and gold frame", standard: false, premium: true },
  { feature: "Featured in Recommended results", standard: false, premium: true },
  { feature: "Homepage feature eligibility", standard: false, premium: true },
  { feature: "Priority enquiries and support", standard: false, premium: true },
];

const FAQS = [
  {
    q: "When am I charged?",
    a: "Never before your listing is approved and live. Vetting is free — billing only starts the day you go live, on the cycle you chose.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel whenever you like; your listing stays live until the end of the period you've already paid for.",
  },
  {
    q: "What's the difference between Standard and Premium?",
    a: "Both are fully vetted and appear in search. Premium adds prominence: a gold-framed listing with the Premium badge, priority placement in Recommended results, and eligibility for the homepage feature slots.",
  },
  {
    q: "Do I need to be medically qualified to list?",
    a: "No. We list qualified medics and experienced practitioners alike. Everyone passes the same vetting, and we show GMC, NMC or GDC registration where it applies.",
  },
  {
    q: "How does Premium placement work?",
    a: "Premium listings sort above Standard in Recommended results, carry the Premium badge and gold frame, and are eligible for the featured slots on the homepage.",
  },
  {
    q: "Is there a setup fee?",
    a: "No setup fee. You pay the monthly or annual price only, starting when your listing goes live.",
  },
];

function ComparisonCell({ value }: { value: Cell }) {
  if (value === true)
    return (
      <Check
        className="mx-auto h-4 w-4 text-ink"
        strokeWidth={2.5}
        aria-label="Included"
      />
    );
  if (value === false)
    return (
      <Minus className="mx-auto h-4 w-4 text-stone/60" aria-label="Not included" />
    );
  return <span className="font-data text-small text-ink">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        {/* ---------------------------------------------- Hero + plans */}
        <section className={`${CONTAINER} pb-10 pt-14 text-center sm:pt-20`}>
          <Reveal>
            <SectionEyebrow align="center">Pricing</SectionEyebrow>
            <h1 className="mx-auto mt-6 max-w-2xl font-display text-display-xl text-ink">
              Simple pricing. Vetting <span className="italic">included</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-body leading-relaxed text-ink-soft">
              Two ways to list on the Hub. Both are hand-checked and appear in
              search — you&rsquo;re never charged until your listing is approved
              and live.
            </p>
          </Reveal>
          <Reveal className="mt-10">
            <PricingPlans />
          </Reveal>
        </section>

        {/* ---------------------------------------------- Comparison */}
        <section className={`${CONTAINER} py-16 sm:py-20`}>
          <Reveal>
            <SectionEyebrow>Compare tiers</SectionEyebrow>
            <h2 className="mt-5 font-display text-display-md text-ink">
              What&rsquo;s in each tier.
            </h2>
          </Reveal>

          <Reveal className="mt-8 overflow-hidden rounded-card border border-linen bg-paper">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-linen">
                    <th className="px-6 py-4 text-small font-medium text-ink-soft">
                      Feature
                    </th>
                    <th className="w-40 px-4 py-4 text-center eyebrow">
                      Standard
                    </th>
                    <th className="w-40 bg-gold-tint/50 px-4 py-4 text-center eyebrow !text-gold-deep">
                      Premium
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i > 0 ? "border-t border-linen" : undefined}
                    >
                      <td className="px-6 py-3.5 text-small text-ink-soft">
                        {row.feature}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <ComparisonCell value={row.standard} />
                      </td>
                      <td className="bg-gold-tint/40 px-4 py-3.5 text-center">
                        <ComparisonCell value={row.premium} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal className="mt-6 flex items-center justify-center gap-2 text-small text-ink-soft">
            <VerifiedSeal size={16} />
            Full vetting is included in both tiers — insurance, qualifications
            and a human review.
          </Reveal>
        </section>

        {/* ---------------------------------------------- FAQ */}
        <section className={`${CONTAINER} py-16 sm:py-20`}>
          <Reveal>
            <SectionEyebrow>Questions</SectionEyebrow>
            <h2 className="mt-5 font-display text-display-md text-ink">
              Pricing questions.
            </h2>
          </Reveal>
          <Reveal className="mt-8">
            <Accordion type="single" collapsible className="border-t border-linen">
              {FAQS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger>{faq.q}</AccordionTrigger>
                  <AccordionContent>{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        {/* ---------------------------------------------- CTA (Level 3) */}
        <section className="bg-ink text-ivory">
          <div className={`${CONTAINER} py-20 sm:py-28`}>
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="eyebrow !text-stone">Get listed</span>
              <h2 className="mt-5 font-display text-display-lg text-ivory">
                Ready to reach more students?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-body leading-relaxed text-ivory/75">
                Apply now, pass vetting, and go live. It&rsquo;s free until
                your listing is approved — so there&rsquo;s nothing to lose by
                starting.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="paper">
                  <Link href="/apply">List your training</Link>
                </Button>
                <Button asChild variant="ghostInk">
                  <Link href="/how-it-works">
                    How vetting works
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
