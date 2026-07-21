import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function TrainerProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <ProfileForm
        trainer={trainer}
        coverSrc={resolveImage(`trainers/${trainer.slug}`)}
        headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
        liveInSearch={DEMO_TRAINER_STATS.liveInSearch}
      />
    </DashboardShell>
  );
}
