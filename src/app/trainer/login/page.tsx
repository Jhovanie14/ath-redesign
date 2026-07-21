import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_CREDENTIALS } from "@/lib/auth";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { loginTrainer } from "./actions";

export const metadata: Metadata = {
  title: "Trainer sign in",
};

export default function TrainerLoginPage() {
  return (
    <LoginForm
      role="trainer"
      heading="Trainer sign in"
      subheading="Manage your listing, courses, and student enquiries."
      demoEmail={DEMO_CREDENTIALS.trainer.email}
      demoPassword={DEMO_CREDENTIALS.trainer.password}
      action={loginTrainer}
      showcase={{
        imageSrc: "/images/trainer-cover.jpeg",
        imageAlt: "A trainer preparing tools for a hands-on session",
        quotes: LOGIN_SHOWCASE_QUOTES,
      }}
    />
  );
}
