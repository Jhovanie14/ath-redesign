import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <PlaceholderPage
      eyebrow="Phase 2"
      title="Standard and Premium tiers, priced in plain terms."
      sentence="Detailed pricing for trainers lands in Phase 2 — you&rsquo;re never charged until your listing is approved and live."
    />
  );
}
