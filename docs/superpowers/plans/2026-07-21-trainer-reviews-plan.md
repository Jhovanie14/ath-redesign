# Trainer Reviews Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer view their own reviews — with search and a rating filter — from a new `/trainer/reviews` dashboard page, enabling the currently-disabled nav entry.

**Architecture:** One new client component (`TrainerReviewsList`) holding local search/rating-filter `useState`, one new server page following the exact auth-guard/fetch/notFound pattern already used by `src/app/trainer/courses/page.tsx`, plus a one-line nav-config change. No data model change — `Trainer.reviews`, `Trainer.rating`, `Trainer.reviewCount` already exist.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, and manual browser walkthrough, matching the precedent set by Courses/Enquiries/Availability.

## Global Constraints

- Read-only, no mutation — this page only reads `trainer.reviews` and filters client-side. There is no save/edit state at all (unlike Availability/Courses).
- Reuse existing `Input`/`Select`/`RatingStars`/`VerifiedSeal` components from `src/components/` — no new form/schema library, no new star-rating or verification-badge implementation.
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"` (matches `review-list.tsx:34`).
- Body text: exactly `className="mt-3 text-body leading-relaxed text-ink-soft"` (matches `review-list.tsx:37-39`).
- Footer row: exactly `className="mt-4 flex flex-wrap items-center justify-between gap-3"`, left span `className="font-data text-micro text-stone"`, right span `className="inline-flex items-center gap-1.5 text-micro font-medium text-ink-soft"` (matches `review-list.tsx:40-49` exactly).
- No pagination — this page shows one trainer's own 3 seed reviews, unlike the admin `ReviewsTable` which aggregates across every trainer. Deliberate scope difference, not an oversight.
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`, `notFound()` if null (exact pattern in `src/app/trainer/courses/page.tsx:19-20`).
- Heading lives inside the client component (matches `CoursesList`/`AvailabilityForm`'s pattern), not in the server page.

---

### Task 1: `TrainerReviewsList` client component

**Files:**
- Create: `src/components/dashboard/trainer-reviews/reviews-list.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task).
- Produces: `export function TrainerReviewsList({ rating, reviewCount, reviews }: { rating: number; reviewCount: number; reviews: Review[] })` — a self-contained client component with no other props. Task 2 imports this exact named export from this exact path. `Review` is imported from `@/lib/types`.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RatingStars } from "@/components/rating-stars";
import { VerifiedSeal } from "@/components/verified-seal";

type RatingFilter = 1 | 2 | 3 | 4 | 5 | "all";

export function TrainerReviewsList({
  rating,
  reviewCount,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}) {
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.studentInitials.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q);
      const matchesRating =
        ratingFilter === "all" || r.rating === ratingFilter;
      return matchesQuery && matchesRating;
    });
  }, [reviews, query, ratingFilter]);

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Reviews</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          What students have said about your courses.
        </p>
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-data text-display-md font-medium text-ink">
          {rating.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <RatingStars rating={rating} size={16} />
          <span className="font-data text-micro text-stone">
            {reviewCount} reviews
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by reviewer or course"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={String(ratingFilter)}
          onValueChange={(v) =>
            setRatingFilter(
              v === "all" ? "all" : (Number(v) as 1 | 2 | 3 | 4 | 5),
            )
          }
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
            <SelectItem value="4">4 stars</SelectItem>
            <SelectItem value="3">3 stars</SelectItem>
            <SelectItem value="2">2 stars</SelectItem>
            <SelectItem value="1">1 star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No reviews yet</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Student reviews will appear here once bookings start coming in.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No matches</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Try a different search term or rating filter.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {filtered.map((review) => (
            <li
              key={review.id}
              className="rounded-card border border-linen bg-paper p-6"
            >
              <RatingStars rating={review.rating} size={14} />
              <p className="mt-3 text-body leading-relaxed text-ink-soft">
                {review.body}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-data text-micro text-stone">
                  {review.studentInitials} · {review.courseTitle} ·{" "}
                  {formatMonthYear(review.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-micro font-medium text-ink-soft">
                  <VerifiedSeal size={16} />
                  Booking verified
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/trainer-reviews/reviews-list.tsx`
Expected: clean (no warnings/errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/trainer-reviews/reviews-list.tsx
git commit -m "feat: add trainer TrainerReviewsList component"
```

---

### Task 2: Trainer Reviews page + nav integration

**Files:**
- Create: `src/app/trainer/reviews/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts:30`

**Interfaces:**
- Consumes: `TrainerReviewsList` from `@/components/dashboard/trainer-reviews/reviews-list` (Task 1) — exact props `{ rating: number; reviewCount: number; reviews: Review[] }`.
- Produces: nothing further downstream (last code task).

- [ ] **Step 1: Write the server page**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { TrainerReviewsList } from "@/components/dashboard/trainer-reviews/reviews-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Reviews",
};

export default async function TrainerReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <TrainerReviewsList
        rating={trainer.rating}
        reviewCount={trainer.reviewCount}
        reviews={trainer.reviews}
      />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Enable the nav entry**

In `src/components/dashboard/nav-config.ts`, change line 30 from:

```ts
  { label: "Reviews", href: "/trainer/reviews", icon: Star, disabled: true },
```

to:

```ts
  { label: "Reviews", href: "/trainer/reviews", icon: Star },
```

Do not change any other `TRAINER_NAV` entry — Profile, Documents, and Billing all keep `disabled: true`.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/trainer/reviews/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/reviews/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer reviews page, enable nav entry"
```

---

### Task 3: Manual verification

**Files:** none (verification only, no code changes).

**Interfaces:** none — this task exercises the running app built by Tasks 1-2.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background)
Expected: `✓ Ready` on `localhost:3000` (or the next available port if 3000 is in use).

- [ ] **Step 2: Log in and open the page**

Navigate to `/trainer/login`, sign in as the demo trainer, then open
`/trainer/reviews` from the sidebar nav (the Reviews entry should now be a
clickable link, not a disabled "Soon" item).

Expected: header shows the real `dr-amara-okafor` rating (4.9) via
`RatingStars` and review count (41). All 3 seed reviews render as cards
below, each with correct star rating, body text, reviewer initials, course
title, formatted date (e.g. "June 2026"), and a "Booking verified" seal.

- [ ] **Step 3: Search filter**

Type "Jawline" into the search box.

Expected: only the "Jawline & Chin Definition" review card remains
visible.

- [ ] **Step 4: Rating filter**

Clear the search box. Set the rating filter to "5 stars".

Expected: only the two 5-star reviews remain visible (the seed data for
`dr-amara-okafor` has ratings 5, 5, 4).

- [ ] **Step 5: No-matches empty state**

Set the rating filter to "1 star".

Expected: "No matches" empty state appears with the "Try a different
search term or rating filter." copy.

- [ ] **Step 6: Reset**

Set the rating filter back to "All ratings".

Expected: all 3 reviews reappear.

- [ ] **Step 7: Confirm the public profile is unaffected**

Navigate to `/trainer/dr-amara-okafor`.

Expected: the reviews section still shows the same rating, review count,
and 3 reviews (expected — read-only, shared source data, not a copy).

- [ ] **Step 8: Final full-project check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

Run: `npx eslint src`
Expected: exit code 0, no errors/warnings introduced by this feature (any
pre-existing unrelated warnings in the codebase are out of scope).
