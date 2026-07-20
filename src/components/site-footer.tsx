import Link from "next/link";
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
      heading: "Legal",
      links: [
        { label: "Privacy", href: "#" },
        { label: "Terms", href: "#" },
        { label: "Vetting standards", href: "#" },
      ],
    },
  ];

export function SiteFooter() {
  return (
    <footer className="w-full bg-ink text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Brand blurb */}
          <div className="max-w-xs">
            <div className="flex flex-col leading-none">
              <span className="font-display text-[22px] font-medium text-ivory">
                Aesthetic
              </span>
              <span className="-mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-stone">
                Training Hub
              </span>
            </div>
            <p className="mt-4 text-small leading-relaxed text-ivory/70">
              The UK&rsquo;s vetted directory for aesthetics training. No
              anonymous listings, no directories of unknowns.
            </p>
            <p className="eyebrow mt-5 !text-stone">
              Vetted training. Verified reviews.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="eyebrow !text-stone">{col.heading}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-small text-ivory/75 transition-colors hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-ivory/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-micro text-ivory/60">
            © 2026 Aesthetic Training Hub Ltd
          </p>
          <p className="flex items-center gap-2 text-micro text-ivory/60">
            <VerifiedSeal size={16} />
            Every listed trainer is insurance-checked and qualification-verified.
          </p>
        </div>
      </div>
    </footer>
  );
}
