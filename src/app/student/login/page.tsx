import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_CREDENTIALS } from "@/lib/auth";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { loginStudent } from "./actions";

export const metadata: Metadata = {
  title: "Student sign in",
};

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <LoginForm
      role="student"
      heading="Student sign in"
      subheading="View your enquiries and message your trainer."
      demoEmail={DEMO_CREDENTIALS.student.email}
      demoPassword={DEMO_CREDENTIALS.student.password}
      action={loginStudent}
      next={next}
      footerLink={{
        question: "New here?",
        label: "Create an account",
        href: next
          ? `/student/register?next=${encodeURIComponent(next)}`
          : "/student/register",
      }}
      showcase={{
        imageSrc: "/images/how-it-works-hero.jpeg",
        imageAlt: "A practitioner practising an injectable technique during training",
        quotes: LOGIN_SHOWCASE_QUOTES,
      }}
    />
  );
}
