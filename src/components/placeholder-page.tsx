import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { SectionEyebrow } from "./section-eyebrow";
import { Button } from "./ui/button";

export interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  sentence: string;
}

/** Styled, on-brand stand-in for pages arriving in Phase 2. Never a 404. */
export function PlaceholderPage({
  eyebrow,
  title,
  sentence,
}: PlaceholderPageProps) {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-5 py-24 sm:px-8">
        <div className="max-w-xl text-center">
          <SectionEyebrow align="center">{eyebrow}</SectionEyebrow>
          <h1 className="mt-5 font-display text-display-lg text-ink">{title}</h1>
          <p className="mt-4 text-body text-ink-soft">{sentence}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Button asChild>
              <Link href="/search">Find training</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
