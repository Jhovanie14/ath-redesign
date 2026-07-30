import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSavedTrainersForStudent } from "@/lib/favorites";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { SavedTrainerCard } from "@/components/dashboard/student/saved-trainer-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Saved trainers",
};

export default async function StudentSavedPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const saved = getSavedTrainersForStudent(session.email);
  const repo = getRepository();
  const resolved = await Promise.all(saved.map((s) => repo.getBySlug(s.trainerSlug)));
  const trainers = resolved.filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Saved trainers</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Trainers you&rsquo;ve bookmarked from their public profile.
      </p>

      <div className="mt-8">
        {trainers.length === 0 ? (
          <EmptyState
            title="No saved trainers yet"
            description="Save a trainer from their profile page to find them here later."
            action={
              <Button asChild>
                <Link href="/search">Browse trainers</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <SavedTrainerCard
                key={trainer.slug}
                trainer={trainer}
                coverSrc={resolveImage(`trainers/${trainer.slug}`)}
                headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
