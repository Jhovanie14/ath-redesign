import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRepository } from "@/lib/repository";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionEyebrow } from "@/components/section-eyebrow";
import { TrainerCard } from "@/components/trainer-card";
import { Button } from "@/components/ui/button";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { ProfileHero } from "@/components/trainer/profile-hero";
import { CourseList } from "@/components/trainer/course-list";
import { ReviewList } from "@/components/trainer/review-list";
import { VerificationPanel } from "@/components/trainer/verification-panel";
import { EnquiryDialog } from "@/components/trainer/enquiry-dialog";

const CONTAINER = "mx-auto w-full max-w-[1120px] px-5 sm:px-8";

export async function generateStaticParams() {
  const trainers = await getRepository().getAll();
  return trainers.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await getRepository().getBySlug(slug);
  if (!trainer) return { title: "Trainer not found" };
  return {
    title: `${trainer.name} — ${trainer.city}`,
    description: trainer.bio.slice(0, 155),
  };
}

export default async function TrainerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getRepository();
  const trainer = await repo.getBySlug(slug);
  if (!trainer) notFound();

  const nearbyAll = await repo.search({
    near: { lat: trainer.lat, lng: trainer.lng, radiusKm: 1000 },
  });
  const nearby = nearbyAll.filter((t) => t.slug !== slug).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className={`${CONTAINER} pb-16 pt-6 sm:pt-8`}>
          <ProfileHero trainer={trainer} />

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[1.65fr_1fr] lg:gap-12">
            {/* Main */}
            <div className="flex flex-col gap-14">
              <section id="about" className="scroll-mt-24">
                <SectionEyebrow>About</SectionEyebrow>
                <h2 className="mt-4 font-display text-display-md text-ink">
                  About {trainer.name.split(" ").slice(0, 2).join(" ")}
                </h2>
                <p className="mt-4 max-w-prose text-body leading-relaxed text-ink-soft">
                  {trainer.bio}
                </p>
              </section>

              <CourseList trainer={trainer} />
              <ReviewList trainer={trainer} />
            </div>

            {/* Aside */}
            <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
              <VerificationPanel trainer={trainer} />

              <div className="rounded-card border border-linen bg-paper p-6">
                <h3 className="font-display text-title text-ink">
                  Ask about a course
                </h3>
                <p className="mt-2 text-small leading-relaxed text-ink-soft">
                  Tell {trainer.name.split(" ").slice(-1)} what you&rsquo;re
                  looking for and they&rsquo;ll reply directly.
                </p>
                <EnquiryDialog trainer={trainer}>
                  <Button className="mt-4 w-full">Ask about a course</Button>
                </EnquiryDialog>
                <p className="mt-3 text-micro leading-relaxed text-stone">
                  Your enquiry goes directly to the trainer through the Hub. No
                  fees, no middleman.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* More trainers nearby */}
        {nearby.length > 0 && (
          <section className="border-t border-linen bg-ivory">
            <div className={`${CONTAINER} py-16 sm:py-20`}>
              <Reveal>
                <SectionEyebrow>More trainers nearby</SectionEyebrow>
                <h2 className="mt-4 font-display text-display-md text-ink">
                  Other vetted educators
                </h2>
              </Reveal>
              <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {nearby.map((t) => (
                  <RevealItem key={t.slug}>
                    <TrainerCard trainer={t} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
