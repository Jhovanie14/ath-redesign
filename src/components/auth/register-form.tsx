"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginShowcase, type ShowcaseQuote } from "./login-showcase";

const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

export interface RegisterFormState {
  error?: string;
}

export interface RegisterFormProps {
  action: (
    state: RegisterFormState,
    formData: FormData,
  ) => Promise<RegisterFormState>;
  showcase: {
    imageSrc: string;
    imageAlt: string;
    quotes: [ShowcaseQuote, ...ShowcaseQuote[]];
  };
  next?: string;
}

export function RegisterForm({ action, showcase, next }: RegisterFormProps) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <div className="lg:grid lg:h-dvh lg:grid-cols-[3fr_2fr]">
      <LoginShowcase
        imageSrc={showcase.imageSrc}
        imageAlt={showcase.imageAlt}
        quotes={showcase.quotes}
      />

      <div className="flex min-h-dvh items-center justify-center bg-ivory px-4 py-16 lg:min-h-0 lg:bg-paper lg:px-16">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="mb-8 flex justify-center lg:justify-start"
            aria-label="Aesthetic Training Hub — home"
          >
            <Image
              src="/logos/wordmark-ink.png"
              alt="Aesthetic Training Hub"
              width={123}
              height={40}
              className="h-9 w-auto"
            />
          </Link>

          <div className="rounded-card border border-linen bg-paper p-8 sm:p-10 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
            <p className="eyebrow !text-stone">Student registration</p>
            <h1 className="mt-2 font-display text-title text-ink">
              Create your account
            </h1>
            <p className="mt-1.5 text-small leading-relaxed text-ink-soft">
              Track your enquiries and message trainers directly.
            </p>

            <form action={formAction} className="mt-7 space-y-4" noValidate>
              {next && <input type="hidden" name="next" value={next} />}
              <div>
                <label htmlFor="student-name" className="eyebrow mb-2 block">
                  Full name
                </label>
                <input
                  id="student-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  className={FIELD}
                  placeholder="Jordan Ellis"
                />
              </div>

              <div>
                <label htmlFor="student-email" className="eyebrow mb-2 block">
                  Email
                </label>
                <input
                  id="student-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={FIELD}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label htmlFor="student-password" className="eyebrow mb-2 block">
                  Password
                </label>
                <input
                  id="student-password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={FIELD}
                  placeholder="At least 8 characters"
                />
              </div>

              {state.error && (
                <p role="alert" className="text-micro text-error">
                  {state.error}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={pending}>
                {pending ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-small text-ink-soft">
              Already have an account?{" "}
              <Link
                href={
                  next
                    ? `/student/login?next=${encodeURIComponent(next)}`
                    : "/student/login"
                }
                className="font-medium text-ink underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
