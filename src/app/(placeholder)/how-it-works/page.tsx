import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <PlaceholderPage
      eyebrow="Phase 2"
      title="The full how-it-works walkthrough is on its way."
      sentence="We&rsquo;re building the step-by-step guide to searching, enquiring and reviewing on the Hub — for now, start by finding a trainer near you."
    />
  );
}
