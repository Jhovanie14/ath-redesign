"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export async function logoutAdmin() {
  await clearSession();
  redirect("/admin/login");
}
