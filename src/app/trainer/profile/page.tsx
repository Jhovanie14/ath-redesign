import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
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
        initialHeadline={trainer.headline}
        initialCity={trainer.city}
        initialBio={trainer.bio}
      />
    </DashboardShell>
  );
}
