import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { registerStudentAction } from "./actions";

export const metadata: Metadata = {
  title: "Create your student account",
};

export default async function StudentRegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <RegisterForm
      action={registerStudentAction}
      next={next}
      showcase={{
        imageSrc: "/images/how-it-works-hero.jpeg",
        imageAlt: "A practitioner practising an injectable technique during training",
        quotes: LOGIN_SHOWCASE_QUOTES,
      }}
    />
  );
}
