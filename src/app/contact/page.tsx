import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { Reveal } from "@/components/motion";
import { ContactForm } from "@/components/contact/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description:
    "Get in touch with the Aesthetic Training Hub team — student support, trainer listing help, partnerships and press.",
};

const CONTAINER = "mx-auto w-full max-w-[1600px] px-5 sm:px-8";

const POINTERS = [
  {
    title: "Looking for training?",
    body: "Browse every vetted trainer by specialism and location.",
    href: "/search",
    cta: "Find training",
  },
  {
    title: "Want to get listed?",
    body: "Apply free — you're not charged until you're approved and live.",
    href: "/apply",
    cta: "List your training",
  },
  {
    title: "Quick question?",
    body: "The chat bubble in the corner replies right away for most things.",
    href: null,
    cta: null,
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className={`${CONTAINER} pb-20 pt-16 sm:pt-24`}>
          <Reveal className="max-w-2xl">
            <SectionEyebrow>Contact us</SectionEyebrow>
            <h1 className="mt-6 font-display text-display-xl text-ink">
              Get in <span className="italic">touch</span>.
            </h1>
            <p className="mt-6 text-body leading-relaxed text-ink-soft">
              Student support, trainer listing help, partnerships or press —
              send us a message and a real person on the team will get back
              to you.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal className="flex flex-col gap-4">
              {POINTERS.map((p) => (
                <div
                  key={p.title}
                  className="rounded-card border border-linen bg-paper p-6"
                >
                  {p.href === null ? (
                    <MessageCircle className="h-5 w-5 text-stone" />
                  ) : null}
                  <h3 className="mt-3 font-display text-title text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-small leading-relaxed text-ink-soft">
                    {p.body}
                  </p>
                  {p.href && (
                    <Link
                      href={p.href}
                      className="mt-3 inline-block text-small font-medium text-ink underline underline-offset-2 hover:text-stone"
                    >
                      {p.cta}
                    </Link>
                  )}
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
