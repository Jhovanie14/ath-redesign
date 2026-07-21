import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_CREDENTIALS } from "@/lib/auth";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { loginAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return (
    <LoginForm
      role="admin"
      heading="Admin sign in"
      subheading="Manage trainer applications, listings, and vetting."
      demoEmail={DEMO_CREDENTIALS.admin.email}
      demoPassword={DEMO_CREDENTIALS.admin.password}
      action={loginAdmin}
      showcase={{
        imageSrc: "/images/how-it-works-hero.jpeg",
        imageAlt: "A trainer reviewing technique with a student",
        quotes: LOGIN_SHOWCASE_QUOTES,
      }}
    />
  );
}
