# Student Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a student-facing module — registration, login, a navbar-based dashboard, and a shared enquiry-messaging inbox — so a student can view their enquiries and the trainer's replies, and send new messages, with trainer replies and student replies landing in one real (in-memory) shared thread.

**Architecture:** Follows the codebase's existing "mock now, wire up later" convention throughout — no database, no test runner. A new mutable `src/lib/students.ts` store parallels the existing `DEMO_ACCOUNTS` pattern in `src/lib/auth.ts` but supports real (in-memory) registration. `src/lib/enquiries.ts`'s flat seed array becomes a mutable store behind accessor functions, shared by both the trainer dashboard (existing) and the new student dashboard, so a reply from either side is visible to the other. A new `StudentShell` component provides a navbar layout, deliberately not reusing the sidebar-based `DashboardShell` used by `/trainer` and `/admin`.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), React 19, TypeScript, Tailwind v4, shadcn/ui (Radix-based) primitives already installed (`Dialog`, `Select`, `Sheet`, `DropdownMenu`, `Card`, `Badge`, `Input`, `Textarea`).

## Global Constraints

- No database and no test runner exist in this repo (`package.json` has no test script) — every "test" step in this plan is `npx tsc --noEmit`, `npm run lint`, and a concrete manual dev-server check, matching how every other dashboard feature in this repo has been verified (see `docs/superpowers/specs/2026-07-21-trainer-enquiries-design.md`'s Testing section).
- Reuse existing design tokens only (`ink`, `ink-soft`, `stone`, `linen`, `paper`, `ivory`, `text-display-md`, `text-title`, `text-body`, `text-small`, `text-micro`, `eyebrow`) — no new colors or raw Tailwind grays.
- Role naming is **"student"** throughout (routes, `Role` type, nav labels) — not "user".
- The public `EnquiryDialog` (`src/components/trainer/enquiry-dialog.tsx`) is explicitly out of scope and must not be touched.
- `Session`/`Booking`/venue entities from `docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md` are explicitly out of scope — only `Enquiry.studentEmail` is added.
- Exactly one demo trainer exists (`dr-amara-okafor` / Dr Amara Okafor) — the student module's "new message" flow targets this trainer only, matching the trainer dashboard's existing single-trainer assumption.

---

## File Structure

**New files:**

| File | Responsibility |
|---|---|
| `src/lib/students.ts` | Student account store: seed demo account, `findStudentAccount`, `registerStudent`, `updateStudentAccount` |
| `src/components/auth/register-form.tsx` | Registration form UI (name/email/password), mirrors `LoginForm`'s two-pane layout |
| `src/app/student/actions.ts` | `logoutStudent` |
| `src/app/student/login/page.tsx` | Student login route |
| `src/app/student/login/actions.ts` | `loginStudent` |
| `src/app/student/register/page.tsx` | Student registration route |
| `src/app/student/register/actions.ts` | `registerStudentAction` |
| `src/components/dashboard/student/student-shell.tsx` | Navbar-based dashboard shell (desktop inline nav + mobile `Sheet`) |
| `src/app/student/page.tsx` | Overview page |
| `src/app/student/messages/page.tsx` | Inbox list page |
| `src/components/dashboard/student/student-messages-list.tsx` | Inbox list UI + "New message" trigger |
| `src/components/dashboard/student/new-message-dialog.tsx` | New-enquiry dialog (course picker + message) |
| `src/app/student/messages/actions.ts` | `createEnquiryAction`, `sendStudentReplyAction` |
| `src/app/student/messages/[id]/page.tsx` | Thread detail route |
| `src/components/dashboard/student/student-enquiry-detail.tsx` | Thread UI (bubbles + reply box) |
| `src/app/student/profile/page.tsx` | Profile route |
| `src/components/dashboard/student/student-profile-form.tsx` | Profile form UI |
| `src/app/student/profile/actions.ts` | `updateStudentProfileAction` |

**Modified files:**

| File | Change |
|---|---|
| `src/lib/auth.ts` | `Role` gains `"student"`; role-check becomes a membership test; `DEMO_CREDENTIALS` gains a `student` entry |
| `src/lib/enquiries.ts` | `Enquiry` gains `studentEmail`; seed array moves behind `listEnquiries`/`getEnquiryById`/`getEnquiriesForStudent`/`appendMessage`/`createEnquiry`; one new seed enquiry (`enq-9`) added |
| `src/app/trainer/page.tsx` | `DEMO_ENQUIRIES` → `listEnquiries()` |
| `src/app/trainer/availability/page.tsx` | `DEMO_ENQUIRIES` → `listEnquiries()` |
| `src/app/trainer/enquiries/page.tsx` | `DEMO_ENQUIRIES` → `listEnquiries()` |
| `src/app/trainer/enquiries/[id]/page.tsx` | `DEMO_ENQUIRIES.find(...)` → `getEnquiryById(id)` |
| `src/components/dashboard/enquiries/enquiry-detail.tsx` | `sendReply()` also persists via a new server action |
| `src/app/trainer/enquiries/[id]/actions.ts` *(new)* | `sendTrainerReplyAction` |
| `src/components/dashboard/nav-config.ts` | `STUDENT_NAV` added; `navForRole` becomes an explicit three-way switch |
| `src/components/auth/login-form.tsx` | Optional `footerLink` prop (unused by existing trainer/admin call sites) |

---

### Task 1: Student role + account store

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/lib/students.ts`

**Interfaces:**
- Produces: `Role = "admin" | "trainer" | "student"`; `findStudentAccount(email: string, password: string): Session | null`; `registerStudent(input: { name: string; email: string; password: string }): { session: Session } | { error: string }`; `updateStudentAccount(currentEmail: string, updates: { name: string; email: string; password?: string }): { session: Session } | { error: string }`

- [ ] **Step 1: Extend `Role` and the session role-check in `src/lib/auth.ts`**

```ts
export type Role = "admin" | "trainer" | "student";
const VALID_ROLES: Role[] = ["admin", "trainer", "student"];
```

Replace the body of `getSession()`'s validation:

```ts
    const parsed = JSON.parse(raw) as Session;
    if (!VALID_ROLES.includes(parsed.role)) return null;
    return parsed;
```

Add a `student` entry to `DEMO_CREDENTIALS` (keep `admin`/`trainer` as-is):

```ts
export const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@ath.demo", password: "admin123" },
  trainer: { email: "trainer@ath.demo", password: "trainer123" },
  student: { email: "student@ath.demo", password: "student123" },
};
```

- [ ] **Step 2: Create `src/lib/students.ts`**

```ts
import type { Session } from "./auth";

export interface StudentAccount {
  name: string;
  email: string;
  password: string;
}

// Mutable — unlike DEMO_ACCOUNTS in auth.ts, registration needs to add to
// this at runtime. Resets on server restart, same as every other mock
// store in this app (see enquiries.ts).
let students: StudentAccount[] = [
  { name: "Freya Marsh", email: "student@ath.demo", password: "student123" },
];

export function findStudentAccount(
  email: string,
  password: string,
): Session | null {
  const match = students.find(
    (s) =>
      s.email.toLowerCase() === email.trim().toLowerCase() &&
      s.password === password,
  );
  return match ? { role: "student", name: match.name, email: match.email } : null;
}

export function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): { session: Session } | { error: string } {
  const email = input.email.trim().toLowerCase();
  if (students.some((s) => s.email.toLowerCase() === email)) {
    return { error: "An account with this email already exists." };
  }
  const account: StudentAccount = {
    name: input.name.trim(),
    email,
    password: input.password,
  };
  students = [...students, account];
  return { session: { role: "student", name: account.name, email: account.email } };
}

/** Renames a student may make to their own profile. `updates.password`
 * blank/undefined keeps the existing password (matches the "optional to
 * change" convention on most account-settings forms in this app). */
export function updateStudentAccount(
  currentEmail: string,
  updates: { name: string; email: string; password?: string },
): { session: Session } | { error: string } {
  const index = students.findIndex(
    (s) => s.email.toLowerCase() === currentEmail.trim().toLowerCase(),
  );
  if (index === -1) return { error: "Account not found." };

  const nextEmail = updates.email.trim().toLowerCase();
  const emailTaken = students.some(
    (s, i) => i !== index && s.email.toLowerCase() === nextEmail,
  );
  if (emailTaken) {
    return { error: "An account with this email already exists." };
  }

  const current = students[index];
  const updated: StudentAccount = {
    name: updates.name.trim(),
    email: nextEmail,
    password: updates.password ? updates.password : current.password,
  };
  students = [...students.slice(0, index), updated, ...students.slice(index + 1)];
  return { session: { role: "student", name: updated.name, email: updated.email } };
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/auth.ts src/lib/students.ts
git commit -m "feat: add student role and account store"
```

---

### Task 2: Enquiries become a shared mutable store

**Files:**
- Modify: `src/lib/enquiries.ts`
- Modify: `src/app/trainer/page.tsx`
- Modify: `src/app/trainer/availability/page.tsx`
- Modify: `src/app/trainer/enquiries/page.tsx`
- Modify: `src/app/trainer/enquiries/[id]/page.tsx`

**Interfaces:**
- Consumes: nothing new
- Produces: `Enquiry.studentEmail: string`; `listEnquiries(): Enquiry[]`; `getEnquiryById(id: string): Enquiry | undefined`; `getEnquiriesForStudent(email: string): Enquiry[]`; `appendMessage(id: string, message: EnquiryMessage): Enquiry | undefined`; `createEnquiry(input: { studentName: string; studentEmail: string; courseTitle: string; body: string; now: Date }): Enquiry`

- [ ] **Step 1: Add `studentEmail` to the `Enquiry` interface**

In `src/lib/enquiries.ts`, add one field:

```ts
export interface Enquiry {
  id: string;
  studentName: string;
  studentEmail: string; // links an enquiry to a student account
  courseTitle: string;
  receivedAt: string; // ISO date
  messages: EnquiryMessage[];
  bookedDate: string | null; // agreed date, set via "Mark as booked"
  archived: boolean;
}
```

- [ ] **Step 2: Add `studentEmail` to every seed entry, and add `enq-9`**

Rename the exported `DEMO_ENQUIRIES` constant to a module-private `let seedEnquiries`, adding `studentEmail` to each of the 8 existing entries (`enq-1` through `enq-8`, in order): `"student@ath.demo"`, `"callum.reid@example.com"`, `"priti.anand@example.com"`, `"owen.blackwood@example.com"`, `"nadia.hussein@example.com"`, `"ben.okoro@example.com"`, `"sadia.karim@example.com"`, `"tomasz.nowak@example.com"`.

Only `enq-1` (Freya Marsh) uses the demo student's email — this links the existing seed data to the demo account without renaming anyone.

Add a ninth entry, giving the demo student a second thread that already has a trainer reply (so both an unreplied and a replied thread are viewable):

```ts
  {
    id: "enq-9",
    studentName: "Freya Marsh",
    studentEmail: "student@ath.demo",
    courseTitle: "Jawline & Chin Definition",
    receivedAt: "2026-07-05",
    messages: [
      {
        from: "student",
        body: "Hi, I saw you also run Jawline & Chin Definition — do you have anything in September, and does it suit someone who's only done anti-wrinkle so far?",
        sentAt: "2026-07-05T11:20:00",
      },
      {
        from: "trainer",
        body: "Hi Freya, yes — I've got a small-group date opening up in September. It's aimed at practitioners with at least foundation-level injecting experience, so anti-wrinkle alone should be fine as long as you're comfortable with needle handling.",
        sentAt: "2026-07-05T15:40:00",
      },
    ],
    bookedDate: null,
    archived: false,
  },
```

- [ ] **Step 3: Replace the flat export with a mutable store + accessors**

At the bottom of `src/lib/enquiries.ts`, after the seed array declaration (now `let seedEnquiries: Enquiry[] = [...]`):

```ts
let enquiries: Enquiry[] = seedEnquiries;

export function listEnquiries(): Enquiry[] {
  return enquiries;
}

export function getEnquiryById(id: string): Enquiry | undefined {
  return enquiries.find((e) => e.id === id);
}

export function getEnquiriesForStudent(email: string): Enquiry[] {
  const target = email.trim().toLowerCase();
  return enquiries.filter((e) => e.studentEmail.toLowerCase() === target);
}

export function appendMessage(
  id: string,
  message: EnquiryMessage,
): Enquiry | undefined {
  const index = enquiries.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const updated: Enquiry = {
    ...enquiries[index],
    messages: [...enquiries[index].messages, message],
  };
  enquiries = [
    ...enquiries.slice(0, index),
    updated,
    ...enquiries.slice(index + 1),
  ];
  return updated;
}

export function createEnquiry(input: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  body: string;
  now: Date;
}): Enquiry {
  const enquiry: Enquiry = {
    id: `enq-${input.now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    courseTitle: input.courseTitle,
    receivedAt: input.now.toISOString().slice(0, 10),
    messages: [{ from: "student", body: input.body, sentAt: input.now.toISOString() }],
    bookedDate: null,
    archived: false,
  };
  enquiries = [enquiry, ...enquiries];
  return enquiry;
}
```

Remove the old `export const DEMO_ENQUIRIES` line (it's now `let seedEnquiries`, module-private, feeding `enquiries` above). Update the file's header comment to reflect that this is now a live (if in-memory) store, not a pure placeholder:

```ts
// src/lib/enquiries.ts
//
// Trainer enquiry inbox + student messaging thread, backed by a mutable
// in-memory store (same "mock now, wire up later" seam as students.ts) —
// there is still no real backend, but replies from either side now
// persist for the lifetime of the running server. The public-facing
// EnquiryDialog (src/components/trainer/enquiry-dialog.tsx) remains
// unconnected to this store — out of scope, see
// docs/superpowers/specs/2026-07-29-student-module-design.md.
```

- [ ] **Step 4: Update the four trainer pages that imported `DEMO_ENQUIRIES` directly**

`src/app/trainer/page.tsx` — change the import and the two direct uses:

```ts
import { enquiryStatus, listEnquiries } from "@/lib/enquiries";
```

```ts
  const newEnquiryCount = listEnquiries().filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;
  const awaitingReply = getAwaitingReply(listEnquiries());
  const upcomingBookings = getUpcomingBookings(listEnquiries(), now);
  const enquiryActivity = getEnquiryActivity(listEnquiries(), now);
  const enquiryFunnel = getEnquiryFunnel(listEnquiries(), now);
```

`src/app/trainer/availability/page.tsx`:

```ts
import { listEnquiries } from "@/lib/enquiries";
```

```ts
  const upcomingBookings = getUpcomingBookings(listEnquiries(), new Date());
```

`src/app/trainer/enquiries/page.tsx`:

```ts
import { listEnquiries } from "@/lib/enquiries";
```

```tsx
        <EnquiriesList enquiries={listEnquiries()} now={now} />
```

`src/app/trainer/enquiries/[id]/page.tsx`:

```ts
import { getEnquiryById } from "@/lib/enquiries";
```

```ts
  const { id } = await params;
  const enquiry = getEnquiryById(id);
  if (!enquiry) notFound();
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors (this will fail loudly if any leftover `DEMO_ENQUIRIES` reference remains — grep for `DEMO_ENQUIRIES` across `src/` to confirm zero matches before moving on).

- [ ] **Step 6: Manual check**

Run `npm run dev`, log in as `trainer@ath.demo` / `trainer123`, confirm `/trainer`, `/trainer/enquiries`, `/trainer/enquiries/enq-1`, and `/trainer/availability` all render exactly as before (9 enquiries now in the list instead of 8).

- [ ] **Step 7: Commit**

```bash
git add src/lib/enquiries.ts src/app/trainer/page.tsx src/app/trainer/availability/page.tsx src/app/trainer/enquiries/page.tsx "src/app/trainer/enquiries/[id]/page.tsx"
git commit -m "feat: turn enquiries into a shared mutable store"
```

---

### Task 3: Trainer replies persist to the shared store

**Files:**
- Modify: `src/components/dashboard/enquiries/enquiry-detail.tsx`
- Create: `src/app/trainer/enquiries/[id]/actions.ts`

**Interfaces:**
- Consumes: `appendMessage(id, message)` from Task 2
- Produces: `sendTrainerReplyAction(enquiryId: string, body: string): Promise<void>`

- [ ] **Step 1: Create the server action**

```ts
// src/app/trainer/enquiries/[id]/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { appendMessage } from "@/lib/enquiries";

export async function sendTrainerReplyAction(enquiryId: string, body: string) {
  const session = await getSession();
  if (!session || session.role !== "trainer") return;

  const trimmed = body.trim();
  if (!trimmed) return;

  appendMessage(enquiryId, {
    from: "trainer",
    body: trimmed,
    sentAt: new Date().toISOString(),
  });

  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath("/student");
}
```

- [ ] **Step 2: Call it from `enquiry-detail.tsx`'s `sendReply()`**

Add the import:

```ts
import { sendTrainerReplyAction } from "@/app/trainer/enquiries/[id]/actions";
```

Change `sendReply` to also persist (the local `setMessages` call stays, so the UI still updates instantly — the server action is fire-and-forget from the component's point of view since the local state is already the source of truth for this render):

```ts
  function sendReply() {
    const body = reply.trim();
    if (!body) return;
    const sentAt = now.toISOString();
    setMessages((prev) => [...prev, { from: "trainer", body, sentAt }]);
    setReply("");
    void sendTrainerReplyAction(enquiry.id, body);
  }
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check**

Log in as the trainer, open `/trainer/enquiries/enq-1`, send a reply, reload the page — the reply is still there (previously it would have vanished on reload).

- [ ] **Step 5: Commit**

```bash
git add "src/app/trainer/enquiries/[id]/actions.ts" src/components/dashboard/enquiries/enquiry-detail.tsx
git commit -m "feat: persist trainer enquiry replies to the shared store"
```

---

### Task 4: Student nav config

**Files:**
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Produces: `STUDENT_NAV: NavItem[]`; `navForRole(role: Role): NavItem[]` now covers all three roles explicitly

- [ ] **Step 1: Add `STUDENT_NAV` and fix `navForRole`**

`LayoutGrid`, `MessageSquare`, and `User` are already imported in this file (used by `TRAINER_NAV`/`ADMIN_NAV`) — no new icon imports needed.

```ts
export const STUDENT_NAV: NavItem[] = [
  { label: "Overview", href: "/student", icon: LayoutGrid },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Profile", href: "/student/profile", icon: User },
];

export function navForRole(role: Role): NavItem[] {
  if (role === "admin") return ADMIN_NAV;
  if (role === "student") return STUDENT_NAV;
  return TRAINER_NAV;
}
```

(This replaces the previous `role === "admin" ? ADMIN_NAV : TRAINER_NAV` ternary, which silently gave any non-admin role the trainer nav.)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/nav-config.ts
git commit -m "feat: add student nav config"
```

---

### Task 5: Student login

**Files:**
- Modify: `src/components/auth/login-form.tsx`
- Create: `src/app/student/actions.ts`
- Create: `src/app/student/login/page.tsx`
- Create: `src/app/student/login/actions.ts`

**Interfaces:**
- Consumes: `findStudentAccount` (Task 1), `LoginForm` (existing), `LOGIN_SHOWCASE_QUOTES` (existing, `src/lib/testimonials.ts`)
- Produces: `logoutStudent(): Promise<void>`; `loginStudent(state, formData): Promise<LoginFormState>`

- [ ] **Step 1: Add an optional footer link to `LoginForm`**

In `src/components/auth/login-form.tsx`, add to `LoginFormProps`:

```ts
  footerLink?: { label: string; question: string; href: string };
```

Destructure it in the component signature (`footerLink` added to the prop list), and render it directly below the demo-autofill button (inside the same `div.rounded-card` wrapper, after the closing `</button>` of the demo-autofill block):

```tsx
            {footerLink && (
              <p className="mt-6 text-center text-small text-ink-soft">
                {footerLink.question}{" "}
                <Link href={footerLink.href} className="font-medium text-ink underline underline-offset-2">
                  {footerLink.label}
                </Link>
              </p>
            )}
```

`Link` is already imported in this file. Existing trainer/admin call sites don't pass `footerLink`, so nothing renders for them — no visual change there.

While in this file, also extend the eyebrow role label (currently `role === "admin" ? "Admin" : "Trainer"`) to cover the new role:

```tsx
            <p className="eyebrow !text-stone">
              {role === "admin" ? "Admin" : role === "student" ? "Student" : "Trainer"} sign in
            </p>
```

- [ ] **Step 2: `src/app/student/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/auth";

export async function logoutStudent() {
  await clearSession();
  redirect("/student/login");
}
```

- [ ] **Step 3: `src/app/student/login/actions.ts`**

```ts
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
```

- [ ] **Step 4: `src/app/student/login/page.tsx`**

```tsx
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { DEMO_CREDENTIALS } from "@/lib/auth";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { loginStudent } from "./actions";

export const metadata: Metadata = {
  title: "Student sign in",
};

export default function StudentLoginPage() {
  return (
    <LoginForm
      role="student"
      heading="Student sign in"
      subheading="View your enquiries and message your trainer."
      demoEmail={DEMO_CREDENTIALS.student.email}
      demoPassword={DEMO_CREDENTIALS.student.password}
      action={loginStudent}
      footerLink={{
        question: "New here?",
        label: "Create an account",
        href: "/student/register",
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

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual check**

Visit `/student/login`, click "Tap to autofill", sign in — redirects to `/student` (a 404 until Task 8, which is expected at this point in the plan; confirm the redirect target is at least correct by checking the URL bar).

- [ ] **Step 7: Commit**

```bash
git add src/components/auth/login-form.tsx src/app/student/actions.ts src/app/student/login
git commit -m "feat: add student login"
```

---

### Task 6: Student registration

**Files:**
- Create: `src/components/auth/register-form.tsx`
- Create: `src/app/student/register/page.tsx`
- Create: `src/app/student/register/actions.ts`

**Interfaces:**
- Consumes: `registerStudent` (Task 1), `LoginShowcase` (existing), `LOGIN_SHOWCASE_QUOTES` (existing)
- Produces: `RegisterFormState { error?: string }`; `registerStudentAction(state, formData): Promise<RegisterFormState>`

- [ ] **Step 1: `src/components/auth/register-form.tsx`**

Mirrors `LoginForm`'s two-pane structure with three fields and no demo-autofill block:

```tsx
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
}

export function RegisterForm({ action, showcase }: RegisterFormProps) {
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
                href="/student/login"
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
```

- [ ] **Step 2: `src/app/student/register/actions.ts`**

```ts
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
```

- [ ] **Step 3: `src/app/student/register/page.tsx`**

```tsx
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";
import { LOGIN_SHOWCASE_QUOTES } from "@/lib/testimonials";
import { registerStudentAction } from "./actions";

export const metadata: Metadata = {
  title: "Create your student account",
};

export default function StudentRegisterPage() {
  return (
    <RegisterForm
      action={registerStudentAction}
      showcase={{
        imageSrc: "/images/how-it-works-hero.jpeg",
        imageAlt: "A practitioner practising an injectable technique during training",
        quotes: LOGIN_SHOWCASE_QUOTES,
      }}
    />
  );
}
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual check**

Visit `/student/register`, submit with a short password → inline error, no navigation. Submit with a new email/name/valid password → redirected to `/student` (404 until Task 8, expected). Try registering the same email twice (revisit `/student/register`) → "An account with this email already exists."

- [ ] **Step 6: Commit**

```bash
git add src/components/auth/register-form.tsx src/app/student/register
git commit -m "feat: add student registration"
```

---

### Task 7: Navbar dashboard shell

**Files:**
- Create: `src/components/dashboard/student/student-shell.tsx`

**Interfaces:**
- Consumes: `navForRole` (Task 4), `Session` (existing), `InitialsAvatar` (existing), `logoutStudent` (Task 5)
- Produces: `<StudentShell session={session}>{children}</StudentShell>`

- [ ] **Step 1: Build the shell**

```tsx
// src/components/dashboard/student/student-shell.tsx
"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { navForRole } from "@/components/dashboard/nav-config";
import { logoutStudent } from "@/app/student/actions";
import type { Session } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function StudentShell({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const navItems = navForRole(session.role);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <header className="sticky top-0 z-10 border-b border-linen bg-ivory/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-6 sm:px-10 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Aesthetic Training Hub — home">
              <Image
                src="/logos/wordmark-ink.png"
                alt="Aesthetic Training Hub"
                width={123}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-small font-medium transition-colors",
                      active
                        ? "bg-linen text-ink"
                        : "text-ink-soft hover:bg-linen/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-linen lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 text-left transition-colors outline-none hover:bg-linen focus-visible:bg-linen">
                <InitialsAvatar name={session.name} />
                <span className="hidden sm:block">
                  <span className="block text-small font-medium leading-none text-ink">
                    {session.name}
                  </span>
                  <span className="mt-1 block truncate text-micro leading-none text-stone">
                    {session.email}
                  </span>
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-stone" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <p className="font-medium text-ink">{session.name}</p>
                  <p className="mt-0.5 truncate text-micro font-normal text-stone">
                    {session.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    void logoutStudent();
                  }}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-small font-medium transition-colors",
                    active
                      ? "bg-linen text-ink"
                      : "text-ink-soft hover:bg-linen/60 hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (this component isn't rendered by any page yet, but it must compile standalone).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/student/student-shell.tsx
git commit -m "feat: add navbar-based student dashboard shell"
```

---

### Task 8: Student Overview page

**Files:**
- Create: `src/app/student/page.tsx`

**Interfaces:**
- Consumes: `getSession` (existing), `getEnquiriesForStudent`/`enquiryStatus`/`STATUS_BADGE` (Task 2/existing), `StudentShell` (Task 7)

- [ ] **Step 1: Build the page**

```tsx
// src/app/student/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  enquiryStatus,
  getEnquiriesForStudent,
  STATUS_BADGE,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Your dashboard",
};

function latestMessageSnippet(body: string): string {
  const trimmed = body.trim();
  return trimmed.length > 90 ? `${trimmed.slice(0, 90)}…` : trimmed;
}

export default async function StudentOverviewPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const openCount = enquiries.filter(
    (e) => enquiryStatus(e, now) !== "archived",
  ).length;

  const recent = [...enquiries]
    .sort((a, b) => {
      const aLatest = a.messages[a.messages.length - 1]?.sentAt ?? a.receivedAt;
      const bLatest = b.messages[b.messages.length - 1]?.sentAt ?? b.receivedAt;
      return bLatest.localeCompare(aLatest);
    })
    .slice(0, 3);

  return (
    <StudentShell session={session}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">
            Welcome back, {session.name}
          </h1>
          <p className="mt-1.5 text-body text-ink-soft">
            {openCount > 0
              ? `You have ${openCount} open ${openCount === 1 ? "enquiry" : "enquiries"}.`
              : "You're all caught up."}
          </p>
        </div>
        <Button asChild>
          <Link href="/student/messages">Go to messages</Link>
        </Button>
      </div>

      <h2 className="mt-10 font-display text-title text-ink">
        Recent activity
      </h2>
      <div className="mt-4">
        {recent.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start a conversation with your trainer from the Messages page."
            action={
              <Button asChild>
                <Link href="/student/messages">Send a message</Link>
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {recent.map((enquiry) => {
              const badge = STATUS_BADGE[enquiryStatus(enquiry, now)];
              const latest = enquiry.messages[enquiry.messages.length - 1];
              return (
                <Link key={enquiry.id} href={`/student/messages/${enquiry.id}`}>
                  <Card className="rounded-2xl p-0 transition-colors hover:border-stone/40">
                    <CardContent className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-ink">
                            {enquiry.courseTitle}
                          </p>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        {latest && (
                          <p className="mt-0.5 truncate text-small text-ink-soft">
                            {latestMessageSnippet(latest.body)}
                          </p>
                        )}
                      </div>
                      <p className="shrink-0 whitespace-nowrap text-micro text-stone">
                        {formatShortDate(enquiry.receivedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Log in as `student@ath.demo` / `student123` → `/student` shows "You have 2 open enquiries." and two recent-activity cards (`enq-1`, `enq-9`). Log out and hit `/student` directly → redirected to `/student/login`.

- [ ] **Step 4: Commit**

```bash
git add src/app/student/page.tsx
git commit -m "feat: add student overview page"
```

---

### Task 9: Messages list + new-message dialog

**Files:**
- Create: `src/app/student/messages/actions.ts`
- Create: `src/components/dashboard/student/new-message-dialog.tsx`
- Create: `src/components/dashboard/student/student-messages-list.tsx`
- Create: `src/app/student/messages/page.tsx`

**Interfaces:**
- Consumes: `createEnquiry`, `appendMessage` (Task 2); `getRepository` (existing, `src/lib/repository.ts`)
- Produces: `createEnquiryAction(input: { courseTitle: string; body: string }): Promise<void>`; `sendStudentReplyAction(enquiryId: string, body: string): Promise<void>`

- [ ] **Step 1: `src/app/student/messages/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { appendMessage, createEnquiry } from "@/lib/enquiries";

export async function createEnquiryAction(input: {
  courseTitle: string;
  body: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const body = input.body.trim();
  if (!body) return;

  const enquiry = createEnquiry({
    studentName: session.name,
    studentEmail: session.email,
    courseTitle: input.courseTitle,
    body,
    now: new Date(),
  });

  revalidatePath("/student/messages");
  revalidatePath("/student");
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  redirect(`/student/messages/${enquiry.id}`);
}

export async function sendStudentReplyAction(enquiryId: string, body: string) {
  const session = await getSession();
  if (!session || session.role !== "student") return;

  const trimmed = body.trim();
  if (!trimmed) return;

  appendMessage(enquiryId, {
    from: "student",
    body: trimmed,
    sentAt: new Date().toISOString(),
  });

  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
}
```

- [ ] **Step 2: `src/components/dashboard/student/new-message-dialog.tsx`**

```tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { createEnquiryAction } from "@/app/student/messages/actions";

export function NewMessageDialog({
  courseTitles,
}: {
  courseTitles: string[];
}) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState(courseTitles[0] ?? "General enquiry");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createEnquiryAction({ courseTitle: course, body: trimmed });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New message</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <DialogTitle className="text-title">Message your trainer</DialogTitle>
        <DialogDescription className="mt-1">
          Starts a new conversation with Dr Amara Okafor.
        </DialogDescription>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="new-message-course" className="eyebrow mb-2 block">
              Course
            </label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger id="new-message-course" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
                <SelectItem value="General enquiry">General enquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="new-message-body" className="eyebrow mb-2 block">
              Message
            </label>
            <Textarea
              id="new-message-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="I'd like to ask about…"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={submit}
            disabled={pending || body.trim() === ""}
            className="w-full sm:w-auto"
          >
            {pending ? "Sending…" : "Send message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: `src/components/dashboard/student/student-messages-list.tsx`**

```tsx
"use client";

import Link from "next/link";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { NewMessageDialog } from "./new-message-dialog";

function latestMessageSnippet(enquiry: Enquiry): string {
  const latest = enquiry.messages[enquiry.messages.length - 1];
  if (!latest) return "";
  const body = latest.body.trim();
  return body.length > 90 ? `${body.slice(0, 90)}…` : body;
}

export function StudentMessagesList({
  enquiries,
  courseTitles,
  now,
}: {
  enquiries: Enquiry[];
  courseTitles: string[];
  now: Date;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Messages</h1>
          <p className="mt-1.5 text-body text-ink-soft">
            Your conversations with your trainer.
          </p>
        </div>
        <NewMessageDialog courseTitles={courseTitles} />
      </div>

      <div className="mt-8">
        {enquiries.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Send your first message to get started."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {enquiries.map((enquiry) => {
              const badge = STATUS_BADGE[enquiryStatus(enquiry, now)];
              return (
                <Link key={enquiry.id} href={`/student/messages/${enquiry.id}`}>
                  <Card className="rounded-2xl p-0 transition-colors hover:border-stone/40">
                    <CardContent className="flex items-center gap-4 px-5 py-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium text-ink">
                            {enquiry.courseTitle}
                          </p>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </div>
                        <p className="mt-0.5 truncate text-small text-ink-soft">
                          {latestMessageSnippet(enquiry)}
                        </p>
                      </div>
                      <p className="shrink-0 whitespace-nowrap text-micro text-stone">
                        {formatShortDate(enquiry.receivedAt)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 4: `src/app/student/messages/page.tsx`**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnquiriesForStudent } from "@/lib/enquiries";
import { getRepository } from "@/lib/repository";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentMessagesList } from "@/components/dashboard/student/student-messages-list";

export const metadata: Metadata = {
  title: "Messages",
};

const DEMO_TRAINER_SLUG = "dr-amara-okafor";

export default async function StudentMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const trainer = await getRepository().getBySlug(DEMO_TRAINER_SLUG);
  const courseTitles = trainer?.courses.map((c) => c.title) ?? [];

  return (
    <StudentShell session={session}>
      <StudentMessagesList
        enquiries={enquiries}
        courseTitles={courseTitles}
        now={now}
      />
    </StudentShell>
  );
}
```

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Manual check**

Log in as the demo student, visit `/student/messages` → two cards (`enq-1`, `enq-9`). Click "New message", pick a course, type a message, send → redirected to a new `/student/messages/[id]` (404 until Task 10, expected) and the new thread now appears back on `/student/messages` if you navigate there again.

- [ ] **Step 7: Commit**

```bash
git add src/app/student/messages/actions.ts src/components/dashboard/student/new-message-dialog.tsx src/components/dashboard/student/student-messages-list.tsx src/app/student/messages/page.tsx
git commit -m "feat: add student messages list and new-message dialog"
```

---

### Task 10: Message thread detail

**Files:**
- Create: `src/components/dashboard/student/student-enquiry-detail.tsx`
- Create: `src/app/student/messages/[id]/page.tsx`

**Interfaces:**
- Consumes: `getEnquiryById` (Task 2), `sendStudentReplyAction` (Task 9)

- [ ] **Step 1: `src/components/dashboard/student/student-enquiry-detail.tsx`**

Mirror of the trainer's `enquiry-detail.tsx` thread UI, but mirrored (student messages right-aligned since this is the student's own view), no booking block, no archive control:

```tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryMessage,
} from "@/lib/enquiries";
import { cn, formatLongDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendStudentReplyAction } from "@/app/student/messages/actions";

export function StudentEnquiryDetail({
  enquiry,
  now,
}: {
  enquiry: Enquiry;
  now: Date;
}) {
  const [messages, setMessages] = useState<EnquiryMessage[]>(enquiry.messages);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();

  const status = enquiryStatus(enquiry, now);
  const badge = STATUS_BADGE[status];

  function sendReply() {
    const body = reply.trim();
    if (!body) return;
    const sentAt = new Date().toISOString();
    setMessages((prev) => [...prev, { from: "student", body, sentAt }]);
    setReply("");
    startTransition(async () => {
      await sendStudentReplyAction(enquiry.id, body);
    });
  }

  return (
    <>
      <Link
        href="/student/messages"
        className="inline-flex min-h-10 items-center gap-1.5 text-small font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md text-ink">
          {enquiry.courseTitle}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-1.5 text-body text-ink-soft">
        With Dr Amara Okafor · Started {formatLongDate(enquiry.receivedAt)}
      </p>

      <Card className="mt-8 gap-0 rounded-2xl p-0">
        <CardContent
          role="log"
          aria-label="Conversation with your trainer"
          className="flex max-h-[420px] flex-col gap-4 overflow-y-auto p-6"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-3",
                m.from === "student"
                  ? "ml-auto rounded-br-sm bg-ink text-ivory"
                  : "mr-auto rounded-bl-sm bg-linen text-ink",
              )}
            >
              <p className="text-small leading-relaxed">{m.body}</p>
              <p
                className={cn(
                  "mt-1.5 text-micro",
                  m.from === "student" ? "text-ivory/65" : "text-stone",
                )}
              >
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.sentAt))}
              </p>
            </div>
          ))}
        </CardContent>

        {status === "archived" ? (
          <p className="border-t border-linen p-6 text-small text-ink-soft">
            This conversation has been archived by your trainer.
          </p>
        ) : (
          <div className="border-t border-linen p-6">
            <label htmlFor="student-reply" className="mb-2 block text-small font-medium text-ink-soft">
              Reply
            </label>
            <Textarea
              id="student-reply"
              placeholder="Write a message…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[130px]"
            />
            <div className="mt-3 flex items-center justify-end">
              <Button disabled={reply.trim() === "" || pending} onClick={sendReply}>
                {pending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
```

- [ ] **Step 2: `src/app/student/messages/[id]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnquiryById } from "@/lib/enquiries";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentEnquiryDetail } from "@/components/dashboard/student/student-enquiry-detail";

export const metadata: Metadata = {
  title: "Message",
};

export default async function StudentMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const { id } = await params;
  const enquiry = getEnquiryById(id);
  if (!enquiry) notFound();

  // Access control between students — an id that exists but belongs to
  // someone else is treated the same as "go back to your inbox", not a
  // 404 (which would reveal the id exists) or a 403.
  if (enquiry.studentEmail.toLowerCase() !== session.email.toLowerCase()) {
    redirect("/student/messages");
  }

  const now = new Date();

  return (
    <StudentShell session={session}>
      <StudentEnquiryDetail enquiry={enquiry} now={now} />
    </StudentShell>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Manual check — the core round trip**

1. Log in as the trainer, open `/trainer/enquiries/enq-1`, send a reply ("Looking forward to it!").
2. Log out, log back in as the demo student, open `/student/messages/enq-1` → the trainer's reply is visible.
3. Reply as the student ("Great, see you then!").
4. Log out, log back in as the trainer, open `/trainer/enquiries/enq-1` → the student's reply is visible.
5. As the student, open `/student/messages/enq-3` directly by URL (an enquiry belonging to a different, unrelated seed student) → redirected back to `/student/messages`, not shown.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/student/student-enquiry-detail.tsx "src/app/student/messages/[id]/page.tsx"
git commit -m "feat: add student message thread detail page"
```

---

### Task 11: Student profile

**Files:**
- Create: `src/app/student/profile/actions.ts`
- Create: `src/components/dashboard/student/student-profile-form.tsx`
- Create: `src/app/student/profile/page.tsx`

**Interfaces:**
- Consumes: `updateStudentAccount` (Task 1)
- Produces: `ProfileFormState { error?: string; success?: boolean }`; `updateStudentProfileAction(state, formData): Promise<ProfileFormState>`

- [ ] **Step 1: `src/app/student/profile/actions.ts`**

```ts
"use server";

import { redirect } from "next/navigation";
import { getSession, setSession } from "@/lib/auth";
import { updateStudentAccount } from "@/lib/students";

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateStudentProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Name and email can't be empty." };
  }
  if (password && password.length < 8) {
    return { error: "New password needs at least 8 characters." };
  }

  const result = updateStudentAccount(session.email, {
    name,
    email,
    password: password || undefined,
  });
  if ("error" in result) {
    return { error: result.error };
  }

  await setSession(result.session);
  return { success: true };
}
```

- [ ] **Step 2: `src/components/dashboard/student/student-profile-form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Session } from "@/lib/auth";
import { updateStudentProfileAction } from "@/app/student/profile/actions";

export function StudentProfileForm({ session }: { session: Session }) {
  const [state, formAction, pending] = useActionState(
    updateStudentProfileAction,
    {},
  );

  return (
    <Card className="gap-0 rounded-2xl p-0">
      <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
        <h2 className="font-display text-title text-ink">Your details</h2>
        <p className="text-small text-ink-soft">
          Update the name, email, and password used to sign in.
        </p>
      </CardHeader>
      <CardContent className="px-7 pt-6 pb-7">
        <form action={formAction} className="flex flex-col gap-5" noValidate>
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-small font-medium text-ink-soft">
              Full name
            </label>
            <Input id="profile-name" name="name" defaultValue={session.name} required />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-small font-medium text-ink-soft">
              Email
            </label>
            <Input id="profile-email" name="email" type="email" defaultValue={session.email} required />
          </div>
          <div>
            <label htmlFor="profile-password" className="mb-2 block text-small font-medium text-ink-soft">
              New password
            </label>
            <Input
              id="profile-password"
              name="password"
              type="password"
              placeholder="Leave blank to keep your current password"
              minLength={8}
            />
          </div>

          {state.error && (
            <p role="alert" className="text-micro text-error">
              {state.error}
            </p>
          )}

          <div className="flex items-center gap-3 border-t border-linen pt-6">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            {state.success && !pending && (
              <span className="flex items-center gap-1.5 text-small font-medium text-success">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: `src/app/student/profile/page.tsx`**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentProfileForm } from "@/components/dashboard/student/student-profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Profile</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Manage your account details.
      </p>
      <div className="mt-8 max-w-lg">
        <StudentProfileForm session={session} />
      </div>
    </StudentShell>
  );
}
```

Note: changing the email here does not retroactively update `studentEmail` on any existing `Enquiry` rows — an accepted limitation for this mock store, not addressed by this plan.

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Manual check**

Log in as the demo student, visit `/student/profile`, change the name, save → "Saved" confirmation appears, and the navbar's avatar dropdown (top right) reflects the new name after the page revalidates (session cookie re-issued).

- [ ] **Step 6: Commit**

```bash
git add src/app/student/profile
git commit -m "feat: add student profile page"
```

---

### Task 12: Final integration pass

**Files:** none (verification only)

- [ ] **Step 1: Full lint + build**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: all three succeed with no errors or warnings introduced by this work.

- [ ] **Step 2: Full manual walkthrough**

Using `npm run dev`:

1. Register a new student account at `/student/register` → lands on `/student` with an empty inbox (openCount 0, "No messages yet" empty state). Attempt to register the same email again → inline error, no duplicate created.
2. Log out, log in as `student@ath.demo` / `student123` (via "Tap to autofill") → `/student` shows 2 open enquiries and both `enq-1`/`enq-9` in "Recent activity".
3. From `/student/messages`, click "New message", pick a course, send → new thread appears in the list and at `/student/messages/[new-id]`.
4. Log in as `trainer@ath.demo` / `trainer123`, open `/trainer/enquiries` → the new thread from step 3 is visible in the trainer's inbox.
5. Reply as the trainer → log back in as the student and confirm the reply is visible in that thread (the shared-store round trip).
6. As the student, attempt to open another student's enquiry id directly (e.g. `/student/messages/enq-2`) → redirected to `/student/messages`.
7. Log out and hit `/student`, `/student/messages`, `/student/profile` directly → each redirects to `/student/login`.
8. Resize the browser to mobile width on any `/student/*` page → hamburger menu appears, `Sheet` opens with working nav links, no horizontal overflow. Resize to desktop → inline nav links with correct active-state highlighting per route.
9. Confirm `/trainer/*` and `/admin/*` pages are visually unchanged (sidebar layout, login screens) — this work must not have altered them beyond the `DEMO_ENQUIRIES` → `listEnquiries()` swap and the trainer reply persistence.

- [ ] **Step 3: Commit (if step 2 surfaced any fixes)**

```bash
git add -A
git commit -m "fix: address issues found in student module integration pass"
```

(Skip this commit if step 2 required no changes.)
