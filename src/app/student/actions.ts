"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export async function logoutStudent() {
  await clearSession();
  redirect("/student/login");
}
