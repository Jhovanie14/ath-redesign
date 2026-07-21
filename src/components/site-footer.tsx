import Image from "next/image";
import Link from "next/link";
import { Reveal } from "./motion";
import { VerifiedSeal } from "./verified-seal";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "For students",
      links: [
        { label: "Find training", href: "/search" },
        { label: "How it works", href: "/how-it-works" },
        { label: "Browse all trainers", href: "/search" },
      ],
    },
    {
      heading: "For trainers",
      links: [
        { label: "List your training", href: "/apply" },
        { label: "Tiers & pricing", href: "/pricing" },
        { label: "How vetting works", href: "/how-it-works" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "Contact us", href: "/contact" },
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Vetting standards", href: "#" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-ink-deep text-ivory">
      <Reveal
        amount={0.1}
        className="mx-auto max-w-[1600px] px-4 pt-20 sm:px-6 lg:px-8"
      >
        <div className="grid gap-10 md:grid-cols-[1.4fr_auto_1fr_1fr_1fr]">
          {/* Brand blurb */}
          <div className="max-w-xs">
            <Image
              src="/logos/wordmark-stone.png"
              alt="Aesthetic Training Hub"
              width={123}
              height={40}
              className="h-9 w-auto"
            />
            <p className="mt-5 text-small leading-relaxed text-ivory/70">
              The UK&rsquo;s vetted directory for aesthetics training. No
              anonymous listings, no directories of unknowns.
            </p>
            <p className="eyebrow mt-6 inline-flex items-center border-t border-ivory/20 pt-3 !text-stone">
              Vetted training. Verified reviews.
            </p>
          </div>

          {/* Structural hairline between brand block and link columns */}
          <div
            aria-hidden
            className="hidden w-px bg-ivory/10 md:block"
          />

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="eyebrow !text-stone">{col.heading}</h3>
              <ul className="mt-5 space-y-3.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group relative inline-block text-small text-ivory/75 transition-colors hover:text-ivory"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-ivory transition-all duration-300 ease-out group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-ivory/10 pt-6">
          {/* Oversized closing wordmark — editorial signature moment */}
          <p
            aria-hidden
            className="select-none overflow-hidden whitespace-nowrap font-display uppercase text-ivory/[0.07]"
            style={{
              fontSize: "clamp(1.5rem, 6.4vw, 6.25rem)",
              lineHeight: 1,
              letterSpacing: "0",
            }}
          >
            Aesthetic Training Hub
          </p>

          <div className="mt-8 flex flex-col gap-5 border-t border-ivory/10 pb-10 pt-7 sm:flex-row sm:items-center sm:justify-between sm:pr-20">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
              <p className="text-micro text-ivory/60">
                © 2026 Aesthetic Training Hub Ltd
              </p>
              <p className="flex items-center gap-2 text-micro text-ivory/60">
                <VerifiedSeal size={16} />
                Every listed trainer is insurance-checked and
                qualification-verified.
              </p>
            </div>

            <a
              href="#top"
              className="group inline-flex items-center gap-2 self-start text-micro text-ivory/60 transition-colors hover:text-ivory sm:self-auto"
            >
              Back to top
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-ivory/20 transition-colors group-hover:border-ivory/50">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  aria-hidden="true"
                  className="-translate-y-px transition-transform duration-300 group-hover:-translate-y-1"
                >
                  <path
                    d="M6 10V2M2.5 5.5 6 2l3.5 3.5"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
