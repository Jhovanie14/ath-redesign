"use client";

import { useActionState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Role } from "@/lib/auth";
import { LoginShowcase, type ShowcaseQuote } from "./login-showcase";

const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

export interface LoginFormState {
  error?: string;
}

export interface LoginFormProps {
  role: Role;
  heading: string;
  subheading: string;
  demoEmail: string;
  demoPassword: string;
  action: (
    state: LoginFormState,
    formData: FormData,
  ) => Promise<LoginFormState>;
  showcase: {
    imageSrc: string;
    imageAlt: string;
    quotes: [ShowcaseQuote, ...ShowcaseQuote[]];
  };
  footerLink?: { label: string; question: string; href: string };
}

export function LoginForm({
  role,
  heading,
  subheading,
  demoEmail,
  demoPassword,
  action,
  showcase,
  footerLink,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(action, {});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  function fillDemoCredentials() {
    if (emailRef.current) emailRef.current.value = demoEmail;
    if (passwordRef.current) passwordRef.current.value = demoPassword;
    passwordRef.current?.focus();
  }

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
            <p className="eyebrow !text-stone">
              {role === "admin" ? "Admin" : role === "student" ? "Student" : "Trainer"} sign in
            </p>
            <h1 className="mt-2 font-display text-title text-ink">
              {heading}
            </h1>
            <p className="mt-1.5 text-small leading-relaxed text-ink-soft">
              {subheading}
            </p>

            <form action={formAction} className="mt-7 space-y-4" noValidate>
              <div>
                <label
                  htmlFor={`${role}-email`}
                  className="eyebrow mb-2 block"
                >
                  Email
                </label>
                <input
                  ref={emailRef}
                  id={`${role}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={FIELD}
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label
                  htmlFor={`${role}-password`}
                  className="eyebrow mb-2 block"
                >
                  Password
                </label>
                <input
                  ref={passwordRef}
                  id={`${role}-password`}
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={FIELD}
                  placeholder="••••••••"
                />
              </div>

              {state.error && (
                <p role="alert" className="text-micro text-error">
                  {state.error}
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={pending}
              >
                {pending ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-6 w-full rounded-xl border border-linen bg-linen/40 px-4 py-3 text-left text-micro leading-relaxed text-ink-soft transition-colors hover:border-stone/50 hover:bg-linen/70"
            >
              <span className="flex items-center justify-between gap-3">
                <span>
                  Demo access — <span className="font-data">{demoEmail}</span>{" "}
                  / <span className="font-data">{demoPassword}</span>
                </span>
                <MousePointerClick
                  className="h-3.5 w-3.5 shrink-0 text-stone"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-stone">Tap to autofill</span>
            </button>

            {footerLink && (
              <p className="mt-6 text-center text-small text-ink-soft">
                {footerLink.question}{" "}
                <Link href={footerLink.href} className="font-medium text-ink underline underline-offset-2">
                  {footerLink.label}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
