"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { toggleSavedTrainer } from "@/lib/favorites";
import { getRepository } from "@/lib/repository";

export async function toggleSavedTrainerAction(trainerSlug: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const trainer = await getRepository().getBySlug(trainerSlug);
  if (!trainer) {
    return;
  }

  toggleSavedTrainer(session.email, trainerSlug, new Date().toISOString());

  revalidatePath(`/trainer/${trainerSlug}`);
  revalidatePath("/student/saved");
  revalidatePath("/student");
}
