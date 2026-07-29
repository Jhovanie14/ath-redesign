"use server";

import { redirect } from "next/navigation";
import { registerStudent } from "@/lib/students";
import { setSession } from "@/lib/auth";
import type { RegisterFormState } from "@/components/auth/register-form";

export async function registerStudentAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    return { error: "Fill in every field — password needs at least 8 characters." };
  }

  const result = registerStudent({ name, email, password });
  if ("error" in result) {
    return { error: result.error };
  }

  await setSession(result.session);
  redirect("/student");
}
