"use server";

import { redirect } from "next/navigation";
import { getSession, setSession } from "@/lib/auth";
import { updateStudentAccount } from "@/lib/students";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateStudentProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Name and email can't be empty." };
  }
  if (password && password.length < 8) {
    return { error: "New password needs at least 8 characters." };
  }

  const result = updateStudentAccount(session.email, {
    name,
    email,
    password: password || undefined,
  });
  if ("error" in result) {
    return { error: result.error };
  }

  await setSession(result.session);
  return { success: true };
}
