"use server";

import { redirect } from "next/navigation";
import { findDemoAccount, setSession } from "@/lib/auth";
import type { LoginFormState } from "@/components/auth/login-form";

export async function loginTrainer(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const session = findDemoAccount("trainer", email, password);
  if (!session) {
    return { error: "Incorrect email or password." };
  }

  await setSession(session);
  redirect("/trainer");
}
