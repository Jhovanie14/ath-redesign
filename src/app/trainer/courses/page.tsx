import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CoursesList } from "@/components/dashboard/courses/courses-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Courses",
};

export default async function TrainerCoursesPage() {
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
      <CoursesList courses={trainer.courses} />
    </DashboardShell>
  );
}
