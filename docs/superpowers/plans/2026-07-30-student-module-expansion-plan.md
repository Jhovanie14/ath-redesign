# Student Module Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich the student dashboard — which today has only 3 nav items and a nearly-empty Overview page — with saved trainers, student-authored reviews, a settings page, and a richer Overview, using only data that already exists in the mock model (enquiries, courses, the existing fake Save button) plus two new small mock stores that follow the codebase's existing "mutable in-memory array" convention.

**Architecture:** Two new `src/lib/*.ts` mock stores (`favorites.ts`, `student-reviews.ts`) mirror the existing pattern in `enquiries.ts`/`students.ts` — a mutable array plus plain functions keyed by student email. The trainer profile's existing (currently fake, client-only) Save button is wired to real data via a new server action. Three new pages (`/student/saved`, `/student/reviews`, `/student/settings`) join the student dashboard's existing `StudentShell` layout and `STUDENT_NAV` config, the same way every existing student page does. The Overview page gains a stat row (reusing the existing `StatCard` component) and a conditional "upcoming session" card, derived from data the existing `Enquiry` type and `enquiryStatus()` helper already expose.

**Tech Stack:** Next.js 16 (App Router, Server Components + Server Actions), React 19, TypeScript, existing shadcn/ui primitives (`Dialog`, `Textarea`, `Switch`, `Card`).

## Global Constraints

- No database and no test runner exist in this repo — every "test" step in this plan is `npx tsc --noEmit`, `npm run lint`, and a concrete manual dev-server check, matching the convention used in every prior plan in `docs/superpowers/plans/`.
- Reuse existing design tokens only (`ink`, `ink-soft`, `stone`, `linen`, `paper`, `gold`, `error`) — no new colors or raw Tailwind grays.
- Exactly one demo trainer exists (`dr-amara-okafor`) — `favorites.ts`/`student-reviews.ts` inherit this same known limitation already documented in `enquiries.ts`; this plan does not change that.
- The `Session`/`Booking`/venue rearchitecture from `docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md` is explicitly out of scope.
- Student reviews are student-only — never merged into `Trainer.reviews`, the public profile, or admin's review moderation page.
- Trainer and Admin modules are not touched by this plan.

---

## File Structure

**New files:**

| File | Responsibility |
|---|---|
| `src/lib/favorites.ts` | `SavedTrainer` mock store — get/check/toggle per student email |
| `src/lib/student-reviews.ts` | `StudentReview` mock store — get/check/create per student email |
| `src/app/student/saved/actions.ts` | `toggleSavedTrainerAction` server action |
| `src/app/student/saved/page.tsx` | Saved-trainers dashboard page |
| `src/components/dashboard/student/saved-trainer-card.tsx` | `TrainerCard` + an "Unsave" overlay button |
| `src/app/student/reviews/actions.ts` | `submitStudentReviewAction` server action |
| `src/app/student/reviews/page.tsx` | Reviews dashboard page (reviewable list + past reviews) |
| `src/components/dashboard/student/leave-review-dialog.tsx` | Star-rating + body dialog, submits via the reviews action |
| `src/app/student/settings/page.tsx` | Settings dashboard page (notification preferences only) |

**Modified files:**

| File | Change |
|---|---|
| `src/lib/enquiries.ts` | Add two seed enquiries for the demo student (one `booked`, one `attended`) |
| `src/components/trainer/profile-hero.tsx` | Wire the existing fake Save button to real per-student data |
| `src/app/trainer/[slug]/page.tsx` | Compute `saved` via `isTrainerSaved`, pass into `ProfileHero` |
| `src/components/dashboard/nav-config.ts` | `STUDENT_NAV` grows from 3 to 6 items (Saved, Reviews, Settings added across Tasks 2–4) |
| `src/components/dashboard/settings/notification-preferences-card.tsx` | Add `STUDENT_NOTIFICATION_ROWS` |
| `src/app/student/page.tsx` | Add stat row + conditional upcoming-session card |

---

### Task 1: Seed data for the demo student

**Files:**
- Modify: `src/lib/enquiries.ts`

**Interfaces:**
- Produces: two new `Enquiry` records for `student@ath.demo` — one with a future `bookedDate` (status `booked`), one with a past `bookedDate` (status `attended`) — that Tasks 3 and 5 depend on to have something to render.

- [ ] **Step 1: Add two seed enquiries**

In `src/lib/enquiries.ts`, inside the `seedEnquiries` array, insert these two objects immediately after the `enq-9` object's closing `},` and before the array's closing `];` (i.e. they become `enq-10` and `enq-11`, the last two entries):

```ts
  {
    id: "enq-10",
    studentName: "Freya Marsh",
    studentEmail: "student@ath.demo",
    courseTitle: "Lip Filler Refinement",
    receivedAt: "2026-07-22",
    messages: [
      {
        from: "student",
        body: "Hi, I'd love to join the next Lip Filler Refinement date if there's space — I did the foundation course with another trainer last year.",
        sentAt: "2026-07-22T10:05:00",
      },
      {
        from: "trainer",
        body: "Hi Freya, that experience is perfect for this one. I've got a small-group date on the 20th of August if that works for you?",
        sentAt: "2026-07-22T14:30:00",
      },
    ],
    bookedDate: "2026-08-20",
    archived: false,
  },
  {
    id: "enq-11",
    studentName: "Freya Marsh",
    studentEmail: "student@ath.demo",
    courseTitle: "Masterclass: Full-Face Assessment",
    receivedAt: "2026-06-01",
    messages: [
      {
        from: "student",
        body: "Is there space on your Full-Face Assessment masterclass in June? I've been wanting to build a more structured consult process.",
        sentAt: "2026-06-01T09:00:00",
      },
      {
        from: "trainer",
        body: "Yes — I've got the 15th of June free, small group of four. I'll send over the pre-reading beforehand.",
        sentAt: "2026-06-01T13:20:00",
      },
    ],
    bookedDate: "2026-06-15",
    archived: false,
  },
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev` (skip if already running). Log in at `http://localhost:3000/student/login` with `student@ath.demo` / `student123`, visit `http://localhost:3000/student/messages`.
Expected: 4 threads total. "Lip Filler Refinement" shows a **Booked** badge; "Masterclass: Full-Face Assessment" shows an **Attended** badge; the original two ("Advanced Cheek & Midface Filler", "Jawline & Chin Definition") still show **New**.

- [ ] **Step 4: Commit**

```bash
git add src/lib/enquiries.ts
git commit -m "feat: add seed enquiries with booked/attended status for the demo student"
```

---

### Task 2: Saved trainers

**Files:**
- Create: `src/lib/favorites.ts`
- Create: `src/app/student/saved/actions.ts`
- Create: `src/app/student/saved/page.tsx`
- Create: `src/components/dashboard/student/saved-trainer-card.tsx`
- Modify: `src/components/trainer/profile-hero.tsx`
- Modify: `src/app/trainer/[slug]/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `Trainer` type from `src/lib/types.ts`; `Session` type and `getSession()` from `src/lib/auth.ts`; `getRepository()` from `src/lib/repository.ts` (`getBySlug(slug): Promise<Trainer | null>`); `TrainerCard` from `src/components/trainer-card.tsx`; `EmptyState` from `src/components/empty-state.tsx`; `resolveImage` from `src/lib/media.ts`
- Produces: `getSavedTrainersForStudent(email: string): SavedTrainer[]`, `isTrainerSaved(email: string, trainerSlug: string): boolean`, `toggleSavedTrainer(email: string, trainerSlug: string, savedAt: string): boolean` (all from `src/lib/favorites.ts`); `toggleSavedTrainerAction(trainerSlug: string): Promise<void>` (from `src/app/student/saved/actions.ts`); `ProfileHero` now requires a `saved: boolean` prop

- [ ] **Step 1: Create the favorites store**

Create `src/lib/favorites.ts`:

```ts
// src/lib/favorites.ts
//
// A student's saved/bookmarked trainers, backed by a mutable in-memory
// store — same "mock now, wire up later" seam as students.ts and
// enquiries.ts. Resets on server restart.
//
// trainerSlug is effectively always the one demo trainer account today —
// same known limitation Enquiry.courseTitle already documents in
// enquiries.ts. Revisit both together once there's more than one trainer
// account to route between.

export interface SavedTrainer {
  studentEmail: string;
  trainerSlug: string;
  savedAt: string; // ISO datetime
}

let savedTrainers: SavedTrainer[] = [];

export function getSavedTrainersForStudent(email: string): SavedTrainer[] {
  const target = email.trim().toLowerCase();
  return savedTrainers.filter((s) => s.studentEmail.toLowerCase() === target);
}

export function isTrainerSaved(email: string, trainerSlug: string): boolean {
  const target = email.trim().toLowerCase();
  return savedTrainers.some(
    (s) => s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug,
  );
}

/** Adds or removes the (student, trainer) pair. Returns the new saved state. */
export function toggleSavedTrainer(
  email: string,
  trainerSlug: string,
  savedAt: string,
): boolean {
  const target = email.trim().toLowerCase();
  const exists = savedTrainers.some(
    (s) => s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug,
  );
  if (exists) {
    savedTrainers = savedTrainers.filter(
      (s) => !(s.studentEmail.toLowerCase() === target && s.trainerSlug === trainerSlug),
    );
    return false;
  }
  savedTrainers = [...savedTrainers, { studentEmail: target, trainerSlug, savedAt }];
  return true;
}
```

- [ ] **Step 2: Create the toggle server action**

Create `src/app/student/saved/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { toggleSavedTrainer } from "@/lib/favorites";

export async function toggleSavedTrainerAction(trainerSlug: string) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  toggleSavedTrainer(session.email, trainerSlug, new Date().toISOString());

  revalidatePath(`/trainer/${trainerSlug}`);
  revalidatePath("/student/saved");
  revalidatePath("/student");
}
```

- [ ] **Step 3: Wire the existing Save button in `ProfileHero`**

Replace the full contents of `src/components/trainer/profile-hero.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin } from "lucide-react";
import type { Trainer } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { cn, formatGBP, initials } from "@/lib/utils";
import { toggleSavedTrainerAction } from "@/app/student/saved/actions";
import { DuotoneCover } from "@/components/duotone-cover";
import { TierBadge } from "@/components/tier-badge";
import { RatingStars } from "@/components/rating-stars";
import { Stat } from "@/components/stat";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { EnquiryDialog } from "./enquiry-dialog";

export function ProfileHero({
  trainer,
  coverSrc,
  headshotSrc,
  session,
  saved,
}: {
  trainer: Trainer;
  /** Resolved server-side — ProfileHero is a client component and can't read /public itself. */
  coverSrc?: string;
  /** A real face portrait, distinct from `coverSrc` — the avatar shown beside the trainer's name. */
  headshotSrc?: string;
  session: Session | null;
  /** Whether the current student has already saved this trainer. */
  saved: boolean;
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [, startTransition] = useTransition();
  const isPremium = trainer.tier === "premium";
  const canSave = session?.role === "student";

  function handleSaveClick() {
    setIsSaved((s) => !s);
    startTransition(() => {
      void toggleSavedTrainerAction(trainer.slug);
    });
  }

  return (
    <section>
      <DuotoneCover
        name={trainer.name}
        className="h-64 rounded-card sm:h-80"
        initialsSize={220}
        src={coverSrc}
        alt={`${trainer.name} — training environment`}
        priority
      />

      <div className="relative z-10 px-0 sm:px-6">
        <div className="-mt-16 rounded-card border border-linen bg-paper p-6 sm:-mt-20 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-5 sm:gap-6">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full bg-linen ring-4 ring-paper sm:h-28 sm:w-28">
                {headshotSrc ? (
                  <Image
                    src={headshotSrc}
                    alt={`${trainer.name} — portrait`}
                    width={112}
                    height={112}
                    priority
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-display text-title text-ink/70">
                      {initials(trainer.name)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {isPremium && <TierBadge type="premium" />}
                  <TierBadge type="verified" />
                </div>
                <h1 className="mt-2.5 font-display text-display-lg text-ink">
                  {trainer.name}
                </h1>
                <p className="mt-1 text-body text-stone">{trainer.headline}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-ink-soft">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-stone" />
                    {trainer.city}
                  </span>
                  <span aria-hidden className="text-stone">
                    ·
                  </span>
                  <span className="font-data text-stone">
                    {trainer.availabilityNote}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-2.5 sm:self-center">
              <EnquiryDialog trainer={trainer} session={session}>
                <Button>Enquire</Button>
              </EnquiryDialog>
              {canSave ? (
                <Button
                  type="button"
                  variant="outline"
                  aria-pressed={isSaved}
                  onClick={handleSaveClick}
                >
                  <Heart
                    className={cn("h-4 w-4", isSaved && "fill-error text-error")}
                  />
                  {isSaved ? "Saved" : "Save"}
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link
                    href={`/student/login?next=${encodeURIComponent(`/trainer/${trainer.slug}`)}`}
                  >
                    <Heart className="h-4 w-4" />
                    Save
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <RatingStars rating={trainer.rating} size={17} />
              <span className="font-data text-body font-medium text-ink">
                {trainer.rating.toFixed(1)}
              </span>
              <span className="font-data text-small text-stone">
                {trainer.reviewCount} reviews
              </span>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <Stat
                value={`${trainer.yearsExperience} yrs`}
                label="Experience"
                size="sm"
              />
              <div className="sm:border-l sm:border-linen sm:pl-8">
                <Stat
                  value={`${trainer.studentsTrained}+`}
                  label="Students trained"
                  size="sm"
                />
              </div>
              <div className="sm:border-l sm:border-linen sm:pl-8">
                <Stat
                  value={formatGBP(trainer.fromPriceGBP)}
                  label="From"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Compute and pass `saved` from the trainer page**

In `src/app/trainer/[slug]/page.tsx`, add the import (alongside the existing `getSession` import):

```ts
import { isTrainerSaved } from "@/lib/favorites";
```

Immediately after the existing `const session = await getSession();` line, add:

```tsx
  const saved =
    session?.role === "student" ? isTrainerSaved(session.email, trainer.slug) : false;
```

Update the `ProfileHero` call site to pass it through:

```tsx
          <ProfileHero
            trainer={trainer}
            coverSrc={resolveImage(`trainers/${trainer.slug}`)}
            headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
            session={session}
            saved={saved}
          />
```

- [ ] **Step 5: Create the saved-trainer card wrapper**

Create `src/components/dashboard/student/saved-trainer-card.tsx`:

```tsx
"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { toggleSavedTrainerAction } from "@/app/student/saved/actions";
import { TrainerCard } from "@/components/trainer-card";

export function SavedTrainerCard({
  trainer,
  coverSrc,
  headshotSrc,
}: {
  trainer: Trainer;
  coverSrc?: string;
  headshotSrc?: string;
}) {
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();

  if (hidden) return null;

  function handleUnsave() {
    setHidden(true);
    startTransition(() => {
      void toggleSavedTrainerAction(trainer.slug);
    });
  }

  return (
    <div className="relative">
      <TrainerCard trainer={trainer} coverSrc={coverSrc} headshotSrc={headshotSrc} />
      <button
        type="button"
        onClick={handleUnsave}
        disabled={pending}
        aria-label={`Unsave ${trainer.name}`}
        className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-paper/90 text-error backdrop-blur-sm transition-colors hover:bg-paper"
      >
        <Heart className="h-4 w-4 fill-error" />
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Create the `/student/saved` page**

Create `src/app/student/saved/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSavedTrainersForStudent } from "@/lib/favorites";
import { getRepository } from "@/lib/repository";
import { resolveImage } from "@/lib/media";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { SavedTrainerCard } from "@/components/dashboard/student/saved-trainer-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Saved trainers",
};

export default async function StudentSavedPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const saved = getSavedTrainersForStudent(session.email);
  const repo = getRepository();
  const resolved = await Promise.all(saved.map((s) => repo.getBySlug(s.trainerSlug)));
  const trainers = resolved.filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Saved trainers</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Trainers you&rsquo;ve bookmarked from their public profile.
      </p>

      <div className="mt-8">
        {trainers.length === 0 ? (
          <EmptyState
            title="No saved trainers yet"
            description="Save a trainer from their profile page to find them here later."
            action={
              <Button asChild>
                <Link href="/search">Browse trainers</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((trainer) => (
              <SavedTrainerCard
                key={trainer.slug}
                trainer={trainer}
                coverSrc={resolveImage(`trainers/${trainer.slug}`)}
                headshotSrc={resolveImage(`trainers/headshots/${trainer.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
```

- [ ] **Step 7: Add "Saved" to the student nav**

In `src/components/dashboard/nav-config.ts`, add `Heart` to the existing `lucide-react` import (alphabetically, between `FileText` and `LayoutGrid`):

```ts
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Heart,
  LayoutGrid,
  MessageSquare,
  Settings,
  Star,
  User,
  UserCog,
  Users,
} from "lucide-react";
```

Update `STUDENT_NAV` to insert a "Saved" entry between "Messages" and "Profile":

```ts
export const STUDENT_NAV: NavItem[] = [
  { label: "Overview", href: "/student", icon: LayoutGrid },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Saved", href: "/student/saved", icon: Heart },
  { label: "Profile", href: "/student/profile", icon: User },
];
```

- [ ] **Step 8: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 9: Manual check — save, view, unsave**

Run: `npm run dev` (skip if already running). Log in as `student@ath.demo` / `student123`, visit `http://localhost:3000/trainer/dr-amara-okafor`.

Click **Save**.
Expected: button flips to "Saved" with a filled red heart, immediately (no page reload).

Visit `http://localhost:3000/student/saved`.
Expected: the trainer's card appears in the grid.

Reload the page.
Expected: the card is still there (persisted server-side, not just local state).

Click the heart overlay button on the card to unsave.
Expected: the card disappears from the grid.

Reload `http://localhost:3000/student/saved` again.
Expected: empty state ("No saved trainers yet") — confirms the unsave persisted too.

- [ ] **Step 10: Manual check — gated when not eligible**

Open a private/incognito window (no session cookie), visit `http://localhost:3000/trainer/dr-amara-okafor`, click **Save**.
Expected: navigates to `/student/login?next=%2Ftrainer%2Fdr-amara-okafor`.

Log in as the trainer demo account (`trainer@ath.demo` / `trainer123`) in a normal window, visit the same trainer profile, click **Save**.
Expected: navigates to the same student-login URL (wrong-role session treated the same as no session).

- [ ] **Step 11: Commit**

```bash
git add src/lib/favorites.ts src/app/student/saved src/components/dashboard/student/saved-trainer-card.tsx src/components/trainer/profile-hero.tsx "src/app/trainer/[slug]/page.tsx" src/components/dashboard/nav-config.ts
git commit -m "feat: wire the trainer profile Save button to persisted per-student favorites"
```

---

### Task 3: Student reviews

**Files:**
- Create: `src/lib/student-reviews.ts`
- Create: `src/app/student/reviews/actions.ts`
- Create: `src/app/student/reviews/page.tsx`
- Create: `src/components/dashboard/student/leave-review-dialog.tsx`
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `Enquiry`, `enquiryStatus()`, `getEnquiriesForStudent()`, `getEnquiryById()` from `src/lib/enquiries.ts`; `getSession()` from `src/lib/auth.ts`; `getRepository()` from `src/lib/repository.ts`; `formatShortDate` from `src/lib/utils.ts`; `RatingStars` from `src/components/rating-stars.tsx`; the seed data from Task 1 (needs an `attended` enquiry to exercise the flow)
- Produces: `getReviewsForStudent(email: string): StudentReview[]`, `getReviewForEnquiry(enquiryId: string): StudentReview | undefined`, `createStudentReview(input): StudentReview` (all from `src/lib/student-reviews.ts`); `submitStudentReviewAction(prevState: SubmitReviewState, formData: FormData): Promise<SubmitReviewState>` and `SubmitReviewState` type (from `src/app/student/reviews/actions.ts`)

- [ ] **Step 1: Create the student reviews store**

Create `src/lib/student-reviews.ts`:

```ts
// src/lib/student-reviews.ts
//
// A student's own reviews of attended courses, backed by a mutable
// in-memory store — same "mock now, wire up later" seam as
// enquiries.ts. Resets on server restart.
//
// These reviews are student-facing only: they are never merged into
// Trainer.reviews (src/lib/types.ts), so they don't appear on the public
// trainer profile, change the trainer's rating average, or show up on
// admin's review moderation page. That's an explicit, accepted scope
// decision — see
// docs/superpowers/specs/2026-07-30-student-module-expansion-design.md —
// not a bug to fix later.

export interface StudentReview {
  id: string;
  enquiryId: string; // one review per enquiry, enforced at write time
  studentEmail: string;
  trainerSlug: string;
  trainerName: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: string; // ISO datetime
}

let studentReviews: StudentReview[] = [];

export function getReviewsForStudent(email: string): StudentReview[] {
  const target = email.trim().toLowerCase();
  return studentReviews.filter((r) => r.studentEmail.toLowerCase() === target);
}

export function getReviewForEnquiry(enquiryId: string): StudentReview | undefined {
  return studentReviews.find((r) => r.enquiryId === enquiryId);
}

export function createStudentReview(input: {
  enquiryId: string;
  studentEmail: string;
  trainerSlug: string;
  trainerName: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  now: Date;
}): StudentReview {
  const review: StudentReview = {
    id: `rev-${input.now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    enquiryId: input.enquiryId,
    studentEmail: input.studentEmail,
    trainerSlug: input.trainerSlug,
    trainerName: input.trainerName,
    courseTitle: input.courseTitle,
    rating: input.rating,
    body: input.body,
    createdAt: input.now.toISOString(),
  };
  studentReviews = [review, ...studentReviews];
  return review;
}
```

- [ ] **Step 2: Create the submit-review server action**

Create `src/app/student/reviews/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { enquiryStatus, getEnquiryById } from "@/lib/enquiries";
import { createStudentReview, getReviewForEnquiry } from "@/lib/student-reviews";
import { getRepository } from "@/lib/repository";

const DEMO_TRAINER_SLUG = "dr-amara-okafor";

export interface SubmitReviewState {
  error?: string;
  success?: boolean;
}

export async function submitStudentReviewAction(
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const enquiryId = String(formData.get("enquiryId") ?? "");
  const ratingRaw = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  const enquiry = getEnquiryById(enquiryId);
  if (!enquiry || enquiry.studentEmail.toLowerCase() !== session.email.toLowerCase()) {
    return { error: "That enquiry couldn't be found." };
  }
  if (enquiryStatus(enquiry, new Date()) !== "attended") {
    return { error: "You can only review a course you've attended." };
  }
  if (getReviewForEnquiry(enquiryId)) {
    return { error: "You've already reviewed this course." };
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Choose a rating from 1 to 5 stars." };
  }
  if (!body) {
    return { error: "Add a few words about the course." };
  }

  const trainer = await getRepository().getBySlug(DEMO_TRAINER_SLUG);

  createStudentReview({
    enquiryId,
    studentEmail: session.email,
    trainerSlug: DEMO_TRAINER_SLUG,
    trainerName: trainer?.name ?? "Your trainer",
    courseTitle: enquiry.courseTitle,
    rating: ratingRaw as 1 | 2 | 3 | 4 | 5,
    body,
    now: new Date(),
  });

  revalidatePath("/student/reviews");
  return { success: true };
}
```

- [ ] **Step 3: Create the leave-review dialog**

Create `src/components/dashboard/student/leave-review-dialog.tsx`:

```tsx
"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  submitStudentReviewAction,
  type SubmitReviewState,
} from "@/app/student/reviews/actions";

const INITIAL_STATE: SubmitReviewState = {};

export function LeaveReviewDialog({
  enquiryId,
  courseTitle,
}: {
  enquiryId: string;
  courseTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(
    submitStudentReviewAction,
    INITIAL_STATE,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Leave a review</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <DialogTitle className="text-title">Leave a review</DialogTitle>
        <DialogDescription className="mt-1">{courseTitle}</DialogDescription>

        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="enquiryId" value={enquiryId} />
          <input type="hidden" name="rating" value={rating} />

          <div>
            <p className="eyebrow mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value === 1 ? "" : "s"}`}
                  aria-pressed={rating === value}
                  className="p-0.5"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      value <= rating ? "fill-gold text-gold" : "text-linen",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="review-body" className="eyebrow mb-2 block">
              Your review
            </label>
            <Textarea
              id="review-body"
              name="body"
              rows={4}
              placeholder="What stood out about the course?"
              required
            />
          </div>

          {state.error && (
            <p role="alert" className="text-micro text-error">
              {state.error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Submitting…" : "Submit review"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 4: Create the `/student/reviews` page**

Create `src/app/student/reviews/page.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { enquiryStatus, getEnquiriesForStudent } from "@/lib/enquiries";
import { getReviewForEnquiry, getReviewsForStudent } from "@/lib/student-reviews";
import { formatShortDate } from "@/lib/utils";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { LeaveReviewDialog } from "@/components/dashboard/student/leave-review-dialog";
import { RatingStars } from "@/components/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Reviews",
};

export default async function StudentReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const reviewable = enquiries.filter(
    (e) => enquiryStatus(e, now) === "attended" && !getReviewForEnquiry(e.id),
  );
  const reviews = getReviewsForStudent(session.email);

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Reviews</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Share feedback on courses you&rsquo;ve attended.
      </p>

      <h2 className="mt-10 font-display text-title text-ink">
        Courses you can review
      </h2>
      <div className="mt-4">
        {reviewable.length === 0 ? (
          <EmptyState
            title="Nothing to review yet"
            description="Once a booked course date has passed, it'll show up here for you to review."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {reviewable.map((enquiry) => (
              <Card key={enquiry.id} className="rounded-2xl p-0">
                <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {enquiry.courseTitle}
                    </p>
                    {enquiry.bookedDate && (
                      <p className="mt-0.5 text-small text-ink-soft">
                        Attended {formatShortDate(enquiry.bookedDate)}
                      </p>
                    )}
                  </div>
                  <LeaveReviewDialog
                    enquiryId={enquiry.id}
                    courseTitle={enquiry.courseTitle}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-10 font-display text-title text-ink">Your reviews</h2>
      <div className="mt-4">
        {reviews.length === 0 ? (
          <EmptyState
            title="You haven't left any reviews"
            description="Reviews you submit for attended courses will appear here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {reviews.map((review) => (
              <Card key={review.id} className="rounded-2xl p-0">
                <CardContent className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-ink">{review.courseTitle}</p>
                    <p className="shrink-0 whitespace-nowrap text-micro text-stone">
                      {formatShortDate(review.createdAt)}
                    </p>
                  </div>
                  <RatingStars rating={review.rating} size={14} className="mt-2" />
                  <p className="mt-2 text-small text-ink-soft">{review.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
```

- [ ] **Step 5: Add "Reviews" to the student nav**

In `src/components/dashboard/nav-config.ts`, update `STUDENT_NAV` to insert a "Reviews" entry between "Saved" and "Profile" (`Star` is already imported for `TRAINER_NAV`):

```ts
export const STUDENT_NAV: NavItem[] = [
  { label: "Overview", href: "/student", icon: LayoutGrid },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Saved", href: "/student/saved", icon: Heart },
  { label: "Reviews", href: "/student/reviews", icon: Star },
  { label: "Profile", href: "/student/profile", icon: User },
];
```

- [ ] **Step 6: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Manual check — leave a review**

Run: `npm run dev` (skip if already running). Log in as `student@ath.demo` / `student123`, visit `http://localhost:3000/student/reviews`.
Expected: "Masterclass: Full-Face Assessment" (from Task 1's seed data) appears under "Courses you can review". "Lip Filler Refinement" (booked but not yet attended) and the two `new`-status enquiries do **not** appear there.

Click **Leave a review**, pick 4 stars, type "Really well structured, lots of hands-on practice.", submit.
Expected: the dialog's card disappears from "Courses you can review", and a new card appears under "Your reviews" showing the course title, 4-star rating, and the review body.

Reload the page.
Expected: same state persists (both lists still reflect the submission).

- [ ] **Step 8: Commit**

```bash
git add src/lib/student-reviews.ts src/app/student/reviews src/components/dashboard/student/leave-review-dialog.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add student-facing course reviews"
```

---

### Task 4: Settings page

**Files:**
- Modify: `src/components/dashboard/settings/notification-preferences-card.tsx`
- Create: `src/app/student/settings/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `NotificationPreferencesCard`, `NotificationRow` type from `src/components/dashboard/settings/notification-preferences-card.tsx`; `getSession()` from `src/lib/auth.ts`
- Produces: `STUDENT_NOTIFICATION_ROWS: NotificationRow[]` (from `notification-preferences-card.tsx`)

- [ ] **Step 1: Add `STUDENT_NOTIFICATION_ROWS`**

In `src/components/dashboard/settings/notification-preferences-card.tsx`, add this export after the existing `TRAINER_NOTIFICATION_ROWS` array:

```ts
export const STUDENT_NOTIFICATION_ROWS: NotificationRow[] = [
  {
    id: "replies",
    label: "Replies to your enquiries",
    description: "Get an email when a trainer replies to your message.",
    defaultOn: true,
  },
  {
    id: "sessions",
    label: "Session reminders",
    description: "Get an email reminder as a booked course date approaches.",
    defaultOn: true,
  },
  {
    id: "saved-trainers",
    label: "New courses from trainers you've saved",
    description: "Get an email when a saved trainer adds a new course.",
    defaultOn: false,
  },
  {
    id: "marketing",
    label: "Product updates & tips",
    description: "Occasional emails about new features and best practices.",
    defaultOn: false,
  },
];
```

- [ ] **Step 2: Create the `/student/settings` page**

Create `src/app/student/settings/page.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import {
  NotificationPreferencesCard,
  STUDENT_NOTIFICATION_ROWS,
} from "@/components/dashboard/settings/notification-preferences-card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function StudentSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Settings</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Choose which updates you receive by email.
      </p>
      <div className="mt-8 max-w-lg">
        <NotificationPreferencesCard rows={STUDENT_NOTIFICATION_ROWS} />
      </div>
    </StudentShell>
  );
}
```

- [ ] **Step 3: Add "Settings" to the student nav**

In `src/components/dashboard/nav-config.ts`, update `STUDENT_NAV` to append a "Settings" entry after "Profile" (`Settings` is already imported for `TRAINER_NAV`/`ADMIN_NAV`):

```ts
export const STUDENT_NAV: NavItem[] = [
  { label: "Overview", href: "/student", icon: LayoutGrid },
  { label: "Messages", href: "/student/messages", icon: MessageSquare },
  { label: "Saved", href: "/student/saved", icon: Heart },
  { label: "Reviews", href: "/student/reviews", icon: Star },
  { label: "Profile", href: "/student/profile", icon: User },
  { label: "Settings", href: "/student/settings", icon: Settings },
];
```

- [ ] **Step 4: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 5: Manual check**

Run: `npm run dev` (skip if already running). Log in as `student@ath.demo` / `student123`, visit `http://localhost:3000/student/settings`.
Expected: nav now shows 6 items (Overview, Messages, Saved, Reviews, Profile, Settings); the page shows a "Notification preferences" card with 4 toggle rows; clicking a toggle flips it (local UI state, no persistence expected — same as the trainer's existing notification card).

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/settings/notification-preferences-card.tsx src/app/student/settings src/components/dashboard/nav-config.ts
git commit -m "feat: add student settings page with notification preferences"
```

---

### Task 5: Overview page enrichment

**Files:**
- Modify: `src/app/student/page.tsx`

**Interfaces:**
- Consumes: `getSavedTrainersForStudent` from `src/lib/favorites.ts` (Task 2); `StatCard` from `src/components/dashboard/stat-card.tsx`; everything else already used by this page

- [ ] **Step 1: Rewrite the Overview page**

Replace the full contents of `src/app/student/page.tsx`:

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
import { getSavedTrainersForStudent } from "@/lib/favorites";
import { formatShortDate } from "@/lib/utils";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StatCard } from "@/components/dashboard/stat-card";
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
  const savedCount = getSavedTrainersForStudent(session.email).length;

  const upcoming = enquiries
    .filter((e) => enquiryStatus(e, now) === "booked")
    .sort((a, b) => (a.bookedDate ?? "").localeCompare(b.bookedDate ?? ""))[0];

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

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open enquiries"
          value={openCount}
          caption="Awaiting a reply or a date"
        />
        <StatCard
          label="Next session"
          value={upcoming?.bookedDate ? formatShortDate(upcoming.bookedDate) : "—"}
          caption={upcoming ? upcoming.courseTitle : "None scheduled"}
        />
        <StatCard
          label="Saved trainers"
          value={savedCount}
          caption={savedCount === 1 ? "Trainer you're following" : "Trainers you're following"}
        />
      </div>

      {upcoming && (
        <Card className="mt-6 rounded-2xl p-0">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="eyebrow !text-stone">Your next session</p>
              <p className="mt-1.5 font-display text-title text-ink">
                {upcoming.courseTitle}
              </p>
              {upcoming.bookedDate && (
                <p className="mt-1 text-small text-ink-soft">
                  {formatShortDate(upcoming.bookedDate)}
                </p>
              )}
            </div>
            <Button asChild variant="outline">
              <Link href={`/student/messages/${upcoming.id}`}>View thread</Link>
            </Button>
          </CardContent>
        </Card>
      )}

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

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Manual check**

Run: `npm run dev` (skip if already running). Log in as `student@ath.demo` / `student123`, visit `http://localhost:3000/student`.
Expected: a 3-card stat row appears above "Recent activity" — "Open enquiries" (4, from Task 1's seed data), "Next session" (20 Aug 2026, "Lip Filler Refinement"), "Saved trainers" (0, unless you saved one during Task 2's manual check — in which case 1). Below the stat row, an "Your next session" card appears showing "Lip Filler Refinement" and a "View thread" button linking to `/student/messages/enq-10`.

If you unsaved every trainer during Task 2's checks, save `dr-amara-okafor` again via `http://localhost:3000/trainer/dr-amara-okafor`, then reload `/student` and confirm "Saved trainers" becomes 1.

- [ ] **Step 4: Commit**

```bash
git add src/app/student/page.tsx
git commit -m "feat: enrich the student overview page with a stat row and upcoming session card"
```

---
