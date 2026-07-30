# Enquiry Login Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require a logged-in student account before the public trainer-profile enquiry form can be submitted — a logged-out (or trainer/admin) visitor sees a sign-in prompt instead of the form, and a logged-in student's submission actually persists (instead of faking a success state), landing them on the real message thread.

**Architecture:** `EnquiryDialog` (`src/components/trainer/enquiry-dialog.tsx`) receives the current `Session | null` as a prop from its server-rendered ancestor (`src/app/trainer/[slug]/page.tsx`) and branches its dialog content on it. Submission reuses `createEnquiryAction` from `src/app/student/messages/actions.ts` — already built for the student dashboard's "new message" flow, so no new persistence code is needed. Separately, the shared `LoginForm`/`RegisterForm` components gain an optional `next` redirect so a visitor sent to sign in from a trainer page lands back on it afterward.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), React 19, TypeScript, existing shadcn/ui primitives (`Dialog`, `Select`, `Button`).

## Global Constraints

- No database and no test runner exist in this repo (`package.json` has no test script) — every "test" step in this plan is `npx tsc --noEmit`, `npm run lint`, and a concrete manual dev-server check, matching the convention used in `docs/superpowers/plans/2026-07-29-student-module-plan.md`.
- Reuse existing design tokens only (`ink`, `ink-soft`, `stone`, `linen`, `paper`) — no new colors or raw Tailwind grays.
- Exactly one demo trainer exists — `createEnquiryAction` already assumes this; this plan does not change that.
- The `Session`/`Booking`/venue rearchitecture from `docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md` is explicitly out of scope.
- Admin and trainer login/register behavior must not change — the `next` prop is optional and only ever passed by the student login/register pages.

---

## File Structure

**Modified files only — no new files:**

| File | Change |
|---|---|
| `src/lib/auth.ts` | Add `isSafeRedirect(path: unknown): path is string` helper |
| `src/components/auth/login-form.tsx` | Add optional `next?: string` prop, rendered as a hidden form field |
| `src/components/auth/register-form.tsx` | Add optional `next?: string` prop (hidden field) and carry it through the "Sign in" footer link |
| `src/app/student/login/page.tsx` | Read `next` from `searchParams`, pass to `LoginForm`, carry it into the "Create an account" footer link |
| `src/app/student/login/actions.ts` | Read `next` from `formData`, redirect there if safe, else `/student` |
| `src/app/student/register/page.tsx` | Read `next` from `searchParams`, pass to `RegisterForm` |
| `src/app/student/register/actions.ts` | Read `next` from `formData`, redirect there if safe, else `/student` |
| `src/components/trainer/enquiry-dialog.tsx` | Accept `session: Session \| null`; gate on it; trimmed real-submission form |
| `src/components/trainer/profile-hero.tsx` | Accept `session` prop, forward to its `EnquiryDialog` |
| `src/components/trainer/course-list.tsx` | Accept `session` prop, forward to its `EnquiryDialog` |
| `src/app/trainer/[slug]/page.tsx` | Fetch `getSession()`, pass to `ProfileHero`, `CourseList`, and its own `EnquiryDialog` |

---

### Task 1: `next`-redirect support in shared login/register forms

**Files:**
- Modify: `src/lib/auth.ts`
- Modify: `src/components/auth/login-form.tsx`
- Modify: `src/components/auth/register-form.tsx`

**Interfaces:**
- Produces: `isSafeRedirect(path: unknown): path is string` (exported from `src/lib/auth.ts`); `LoginFormProps.next?: string`; `RegisterFormProps.next?: string`

- [ ] **Step 1: Add `isSafeRedirect` to `src/lib/auth.ts`**

Append at the end of the file (after `clearSession`):

```ts
/** Guards against open redirects — only same-origin, absolute-path
 * targets (e.g. "/trainer/dr-amara-okafor") are allowed. Rejects
 * protocol-relative paths ("//evil.com") and anything that isn't a
 * plain string (FormData entries can also be File). */
export function isSafeRedirect(path: unknown): path is string {
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
}
```

- [ ] **Step 2: Add `next` to `LoginForm`**

In `src/components/auth/login-form.tsx`, add to `LoginFormProps` (after `footerLink?: { label: string; question: string; href: string };`):

```ts
  next?: string;
```

Add `next` to the destructured props in `LoginForm({ ... })`:

```ts
export function LoginForm({
  role,
  heading,
  subheading,
  demoEmail,
  demoPassword,
  action,
  showcase,
  footerLink,
  next,
}: LoginFormProps) {
```

Inside the `<form action={formAction} className="mt-7 space-y-4" noValidate>` element, add the hidden field as its first child (right before the email `<div>`):

```tsx
              {next && <input type="hidden" name="next" value={next} />}
```

- [ ] **Step 3: Add `next` to `RegisterForm`**

In `src/components/auth/register-form.tsx`, add to `RegisterFormProps` (after `showcase: {...}`):

```ts
  next?: string;
```

Add `next` to the destructured props:

```ts
export function RegisterForm({ action, showcase, next }: RegisterFormProps) {
```

Add the hidden field as the first child of the `<form>` (right before the name `<div>`):

```tsx
              {next && <input type="hidden" name="next" value={next} />}
```

Update the "Already have an account? Sign in" link to carry `next` forward:

```tsx
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
```

- [ ] **Step 4: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual regression check**

Run: `npm run dev` (skip if already running), then visit `http://localhost:3000/admin/login` and `http://localhost:3000/trainer/login`.
Expected: both render exactly as before (they don't pass `next`, so no hidden field/behavior change is visible) and still sign in correctly with their demo credentials.

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/components/auth/login-form.tsx src/components/auth/register-form.tsx
git commit -m "feat: add next-redirect support to shared login/register forms"
```

---

### Task 2: Wire `next` through the student login route

**Files:**
- Modify: `src/app/student/login/page.tsx`
- Modify: `src/app/student/login/actions.ts`

**Interfaces:**
- Consumes: `isSafeRedirect` from `src/lib/auth.ts` (Task 1); `LoginForm`'s `next` prop (Task 1)

- [ ] **Step 1: Read `next` from `searchParams` in the login page**

Replace the full contents of `src/app/student/login/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Redirect to `next` from the login action**

Replace the full contents of `src/app/student/login/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { findStudentAccount } from "@/lib/students";
import { isSafeRedirect, setSession } from "@/lib/auth";
import type { LoginFormState } from "@/components/auth/login-form";

export async function loginStudent(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  const session = findStudentAccount(email, password);
  if (!session) {
    return { error: "Incorrect email or password." };
  }

  await setSession(session);
  redirect(isSafeRedirect(next) ? next : "/student");
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check — with and without `next`**

Run: `npm run dev` (skip if already running).

Visit `http://localhost:3000/student/login` (no `next`), sign in with `student@ath.demo` / `student123`.
Expected: redirected to `/student`.

Visit `http://localhost:3000/student/login?next=/trainer/dr-amara-okafor`, sign in with the same credentials.
Expected: redirected to `/trainer/dr-amara-okafor`.

Visit `http://localhost:3000/student/login?next=https://example.com`, sign in.
Expected: redirected to `/student` (unsafe `next` rejected, falls back).

- [ ] **Step 5: Commit**

```bash
git add src/app/student/login/page.tsx src/app/student/login/actions.ts
git commit -m "feat: redirect back to the referring page after student login"
```

---

### Task 3: Wire `next` through the student register route

**Files:**
- Modify: `src/app/student/register/page.tsx`
- Modify: `src/app/student/register/actions.ts`

**Interfaces:**
- Consumes: `isSafeRedirect` from `src/lib/auth.ts` (Task 1); `RegisterForm`'s `next` prop (Task 1)

- [ ] **Step 1: Read `next` from `searchParams` in the register page**

Replace the full contents of `src/app/student/register/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Redirect to `next` from the register action**

Replace the full contents of `src/app/student/register/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { registerStudent } from "@/lib/students";
import { isSafeRedirect, setSession } from "@/lib/auth";
import type { RegisterFormState } from "@/components/auth/register-form";

export async function registerStudentAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = formData.get("next");

  if (!name || !email || password.length < 8) {
    return { error: "Fill in every field — password needs at least 8 characters." };
  }

  const result = registerStudent({ name, email, password });
  if ("error" in result) {
    return { error: result.error };
  }

  await setSession(result.session);
  redirect(isSafeRedirect(next) ? next : "/student");
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check — with and without `next`**

Run: `npm run dev` (skip if already running).

Visit `http://localhost:3000/student/register?next=/trainer/dr-amara-okafor`, register a new account with a fresh email (e.g. `new-student@example.com` / a password 8+ characters).
Expected: redirected to `/trainer/dr-amara-okafor`.

Visit `http://localhost:3000/student/register` (no `next`) and register another fresh email.
Expected: redirected to `/student`.

- [ ] **Step 5: Commit**

```bash
git add src/app/student/register/page.tsx src/app/student/register/actions.ts
git commit -m "feat: redirect back to the referring page after student registration"
```

---

### Task 4: Gate `EnquiryDialog` behind a student session

**Files:**
- Modify: `src/components/trainer/enquiry-dialog.tsx`
- Modify: `src/components/trainer/profile-hero.tsx`
- Modify: `src/components/trainer/course-list.tsx`
- Modify: `src/app/trainer/[slug]/page.tsx`

**Interfaces:**
- Consumes: `Session` type from `src/lib/auth.ts`; `getSession()` from `src/lib/auth.ts`; `createEnquiryAction(input: { courseTitle: string; body: string }): Promise<void>` from `src/app/student/messages/actions.ts` (existing, unchanged)
- Produces: `EnquiryDialog` now requires a `session: Session | null` prop; `ProfileHero` and `CourseList` now require the same

- [ ] **Step 1: Rewrite `EnquiryDialog`**

Replace the full contents of `src/components/trainer/enquiry-dialog.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Trainer } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { createEnquiryAction } from "@/app/student/messages/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerifiedSeal } from "@/components/verified-seal";

const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

export function EnquiryDialog({
  trainer,
  session,
  defaultCourseTitle,
  children,
}: {
  trainer: Trainer;
  session: Session | null;
  defaultCourseTitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState(
    defaultCourseTitle ?? trainer.courses[0]?.title ?? "General enquiry",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const returnTo = `/trainer/${trainer.slug}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Add a short message about what you're after.");
      return;
    }
    setError("");
    startTransition(async () => {
      await createEnquiryAction({ courseTitle: course, body: trimmed });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        {!session || session.role !== "student" ? (
          <div className="py-2">
            <DialogTitle className="text-title">
              Sign in to enquire
            </DialogTitle>
            <DialogDescription className="mt-2">
              Create a free student account or sign in to send an enquiry to{" "}
              {trainer.name}.
            </DialogDescription>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button asChild className="flex-1">
                <Link
                  href={`/student/register?next=${encodeURIComponent(returnTo)}`}
                >
                  Create account
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/student/login?next=${encodeURIComponent(returnTo)}`}>
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogTitle className="text-title">
              Ask about a course
            </DialogTitle>
            <DialogDescription className="mt-1">
              Enquiring with {trainer.name}.
            </DialogDescription>

            <p className="mt-4 text-small text-ink-soft">
              Sending as {session.name} · {session.email}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="enq-course" className="eyebrow mb-2 block">
                  Course
                </label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="enq-course" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trainer.courses.map((c) => (
                      <SelectItem key={c.id} value={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="General enquiry">
                      General enquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="enq-message" className="eyebrow mb-2 block">
                  Message
                </label>
                <textarea
                  id="enq-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className={`${FIELD} h-auto resize-none py-2.5`}
                  placeholder="I'm looking for a first lip filler course in the spring…"
                  aria-invalid={Boolean(error)}
                />
                {error && (
                  <p className="mt-1.5 text-micro text-error">{error}</p>
                )}
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-micro leading-relaxed text-stone">
              <span className="mt-0.5">
                <VerifiedSeal size={16} />
              </span>
              Your enquiry goes directly to the trainer through the Hub. No
              fees, no middleman.
            </p>

            <Button type="submit" className="mt-5 w-full" disabled={pending}>
              {pending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Thread `session` through `ProfileHero`**

In `src/components/trainer/profile-hero.tsx`, add `session` to the props type and destructuring:

```tsx
export function ProfileHero({
  trainer,
  coverSrc,
  headshotSrc,
  session,
}: {
  trainer: Trainer;
  /** Resolved server-side — ProfileHero is a client component and can't read /public itself. */
  coverSrc?: string;
  /** A real face portrait, distinct from `coverSrc` — the avatar shown beside the trainer's name. */
  headshotSrc?: string;
  session: Session | null;
}) {
```

Add the import at the top (alongside the existing `Trainer` type import):

```ts
import type { Session } from "@/lib/auth";
```

Update the `EnquiryDialog` call site:

```tsx
              <EnquiryDialog trainer={trainer} session={session}>
                <Button>Enquire</Button>
              </EnquiryDialog>
```

- [ ] **Step 3: Thread `session` through `CourseList`**

In `src/components/trainer/course-list.tsx`, add the import and prop:

```ts
import type { Session } from "@/lib/auth";
```

```tsx
export function CourseList({
  trainer,
  session,
}: {
  trainer: Trainer;
  session: Session | null;
}) {
```

Update the `EnquiryDialog` call site:

```tsx
                <EnquiryDialog
                  trainer={trainer}
                  session={session}
                  defaultCourseTitle={course.title}
                >
                  <Button variant="outline" size="sm">
                    Enquire about this course
                  </Button>
                </EnquiryDialog>
```

- [ ] **Step 4: Fetch and pass `session` from the trainer page**

In `src/app/trainer/[slug]/page.tsx`, add the import:

```ts
import { getSession } from "@/lib/auth";
```

In `TrainerPage`, fetch the session alongside the existing `trainer`/`nearby` lookups:

```tsx
  const { slug } = await params;
  const repo = getRepository();
  const trainer = await repo.getBySlug(slug);
  if (!trainer) notFound();

  const session = await getSession();

  const nearbyAll = await repo.search({
```

Update the three render sites to pass it through:

```tsx
          <ProfileHero
            trainer={trainer}
            coverSrc={resolveImage(`trainers/${trainer.slug}`)}
            headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
            session={session}
          />
```

```tsx
              <CourseList trainer={trainer} session={session} />
```

```tsx
                <EnquiryDialog trainer={trainer} session={session}>
                  <Button className="mt-4 w-full">Ask about a course</Button>
                </EnquiryDialog>
```

- [ ] **Step 5: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors — in particular, confirm no leftover reference to the old `EMAIL_RE` constant or unused `CheckCircle2`/`DialogClose` imports.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Manual check — logged out**

Run: `npm run dev` (skip if already running), open a private/incognito window (so there's no session cookie), visit `http://localhost:3000/trainer/dr-amara-okafor`.

Click each of the three enquire entry points: the hero "Enquire" button, the aside "Ask about a course" button, and a course card's "Enquire about this course" button.
Expected: all three open the dialog showing "Sign in to enquire" with **Create account** and **Log in** buttons — not the form.

Click **Create account**.
Expected: navigates to `/student/register?next=%2Ftrainer%2Fdr-amara-okafor`.

- [ ] **Step 7: Manual check — logged in as student, end to end**

Register (or log in with `student@ath.demo` / `student123`).
Expected (per Task 3's redirect): lands back on `/trainer/dr-amara-okafor`.

Click "Ask about a course" again.
Expected: the real form now appears, showing "Sending as {your name} · {your email}", with Course and Message fields (no name/email inputs).

Fill in a message and submit.
Expected: redirected to `/student/messages/{id}` showing the new thread with your message.

In a separate browser session, log in as the trainer demo account (`trainer@ath.demo` / `trainer123`) and visit `/trainer/enquiries`.
Expected: the new enquiry appears in the inbox.

- [ ] **Step 8: Manual check — wrong-role session**

While logged in as the trainer demo account, visit `http://localhost:3000/trainer/dr-amara-okafor` and click any enquire entry point.
Expected: the "Sign in to enquire" gate appears (same as logged-out) — not the form.

- [ ] **Step 9: Commit**

```bash
git add src/components/trainer/enquiry-dialog.tsx src/components/trainer/profile-hero.tsx src/components/trainer/course-list.tsx src/app/trainer/[slug]/page.tsx
git commit -m "feat: require student login before submitting a trainer enquiry"
```
