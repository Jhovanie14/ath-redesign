import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { ApplyWizard } from "@/components/apply/apply-wizard";

export const metadata: Metadata = {
  title: "List your training",
  description:
    "Apply to list your aesthetics training on the Hub. Pass vetting — insurance, qualifications and a human review — and go live. You're not charged until approved.",
};

const CONTAINER = "mx-auto w-full max-w-[1600px] px-5 sm:px-8";

export default function ApplyPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className={`${CONTAINER} pb-10 pt-16 sm:pt-20`}>
          <div className="max-w-2xl">
            <SectionEyebrow>List your training</SectionEyebrow>
            <h1 className="mt-6 font-display text-display-lg text-ink">
              Get listed on the Hub.
            </h1>
            <p className="mt-4 text-body leading-relaxed text-ink-soft">
              Four short steps. We check your insurance, qualifications and
              registration by hand — and you&rsquo;re never charged until your
              listing is approved and live.
            </p>
          </div>
        </section>
        <section className={`${CONTAINER} pb-28`}>
          <ApplyWizard />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
