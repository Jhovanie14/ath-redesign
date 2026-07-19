import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = { title: "List your training" };

export default function ApplyPage() {
  return (
    <PlaceholderPage
      eyebrow="Phase 2"
      title="The application to get listed is coming in Phase 2."
      sentence="The vetting process — insurance, qualifications and a human review — will run right here, and you won&rsquo;t be charged until you&rsquo;re approved."
    />
  );
}
