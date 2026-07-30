"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { toggleSavedTrainer } from "@/lib/favorites";

export async function toggleSavedTrainerAction(trainerSlug: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  toggleSavedTrainer(session.email, trainerSlug, new Date().toISOString());

  revalidatePath(`/trainer/${trainerSlug}`);
  revalidatePath("/student/saved");
  revalidatePath("/student");
}
