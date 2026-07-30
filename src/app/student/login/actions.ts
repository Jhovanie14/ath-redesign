"use server";

import { redirect } from "next/navigation";
import { findStudentAccount } from "@/lib/students";
import { setSession } from "@/lib/auth";
import type { LoginFormState } from "@/components/auth/login-form";

export async function loginStudent(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const session = findStudentAccount(email, password);
  if (!session) {
    return { error: "Incorrect email or password." };
  }

  await setSession(session);
  redirect("/student");
}
