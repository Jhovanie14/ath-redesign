# Trainer Courses Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer view, add, edit, and archive their own courses at `/trainer/courses`, and stop the Overview "Active courses" stat and the public profile from disagreeing with real course data.

**Architecture:** Add an optional `archived` field to the existing `Course` type. Build two new client components (`CourseFormDialog`, `CoursesList`) mirroring the exact patterns already used by `enquiry-dialog.tsx` and `course-list.tsx`. Wire a new server page at `/trainer/courses` that fetches the one demo trainer (`dr-amara-okafor`) the same way every other trainer-dashboard page does. Fix the public profile and the Overview stat card to filter/derive from `archived` so nothing can silently drift.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-checkbox`) already wrapped in `src/components/ui/*`.

## Global Constraints

- No backend exists anywhere in this app. Every mutation in this feature (add/edit/archive a course) is local `useState`, seeded once from server props, and never written back — matches the existing Enquiries feature exactly. This is intentional, not a gap.
- `archived` is **optional** (`archived?: boolean`) on `Course`. Undefined and `false` both mean active. Do not touch any of the 22 other course entries across the other 7 trainers in `src/data/trainers.json`.
- The trainer dashboard has no per-session trainer identity. Every trainer-dashboard page hardcodes `getRepository().getBySlug("dr-amara-okafor")` (see `src/app/trainer/page.tsx`, `publicProfileHref="/trainer/dr-amara-okafor"`). Follow this exactly — do not invent a new lookup mechanism.
- Badge variant convention: `neutral` (category), `success` (CPD / positive), `outline` (archived marker). `gold` is reserved for Premium-tier subscription badges only — never use it here.
- Use `formatGBP` from `src/lib/utils.ts` for all price display. No ad hoc currency formatting.
- Validation follows `src/components/trainer/enquiry-dialog.tsx`'s inline-errors-object pattern exactly (a `Record<string, string>` populated on submit, `text-micro text-error` messages under each invalid field, `aria-invalid={Boolean(errors.x)}` on the input). No new form/schema library.
- No automated test framework exists in this repo (verified: `package.json` has no test script, no `*.test.*`/`*.spec.*` files anywhere). Verification for every task is `npx tsc --noEmit` + `npx eslint src` (both must produce no output), plus the manual browser walkthrough in the final task.
- Route `params` in Next 16 App Router are `Promise<{...}>` and must be `await`ed — not relevant to any new route in this plan (no dynamic segment), but do not regress this in any file you touch.

---

### Task 1: Add `archived` field to the `Course` type

**Files:**
- Modify: `src/lib/types.ts:12-21`

**Interfaces:**
- Produces: `Course.archived?: boolean` — consumed by every later task in this plan.

- [ ] **Step 1: Add the field**

In `src/lib/types.ts`, change:

```ts
export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  priceGBP: number;
  durationDays: number;
  cpdAccredited: boolean;
  maxDelegates: number;
  summary: string;
}
```

to:

```ts
export interface Course {
  id: string;
  title: string;
  category: CourseCategory;
  priceGBP: number;
  durationDays: number;
  cpdAccredited: boolean;
  maxDelegates: number;
  summary: string;
  archived?: boolean; // undefined/false = active. Optional so existing seed
                      // data across all trainers in trainers.json doesn't
                      // need to be touched.
}
```

- [ ] **Step 2: Verify the codebase still type-checks and lints clean**

Run: `npx tsc --noEmit`
Expected: no output (adding an optional field cannot break any existing object literal or reader).

Run: `npx eslint src`
Expected: no output (or only the pre-existing baseline errors already known from earlier work — do not introduce new ones).

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add optional archived field to Course type"
```

---

### Task 2: Filter archived courses out of the public profile

**Files:**
- Modify: `src/components/trainer/course-list.tsx`

**Interfaces:**
- Consumes: `Course.archived` (Task 1).

- [ ] **Step 1: Filter before rendering**

In `src/components/trainer/course-list.tsx`, change:

```tsx
export function CourseList({ trainer }: { trainer: Trainer }) {
  return (
    <section id="courses" className="scroll-mt-24">
      <SectionEyebrow>Courses</SectionEyebrow>
      <h2 className="mt-4 font-display text-display-md text-ink">
        Courses &amp; pricing
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        {trainer.courses.map((course) => (
```

to:

```tsx
export function CourseList({ trainer }: { trainer: Trainer }) {
  const activeCourses = trainer.courses.filter((course) => !course.archived);

  return (
    <section id="courses" className="scroll-mt-24">
      <SectionEyebrow>Courses</SectionEyebrow>
      <h2 className="mt-4 font-display text-display-md text-ink">
        Courses &amp; pricing
      </h2>

      <div className="mt-6 flex flex-col gap-4">
        {activeCourses.map((course) => (
```

No other line in the file changes (the rest of the `.map()` body stays exactly as-is — only the array being mapped over changes).

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors).

Since no seed course currently has `archived: true`, this change produces zero visible difference today — confirm that by reading the file back and checking `activeCourses` appears exactly twice (the `const` declaration and the `.map()` call) and `trainer.courses` no longer appears in the JSX.

- [ ] **Step 3: Commit**

```bash
git add src/components/trainer/course-list.tsx
git commit -m "fix: hide archived courses from the public profile"
```

---

### Task 3: `CourseFormDialog` component (add/edit form)

**Files:**
- Create: `src/components/dashboard/courses/course-form-dialog.tsx`

**Interfaces:**
- Consumes: `Course`, `CourseCategory`, `ALL_CATEGORIES`, `CATEGORY_LABELS` from `@/lib/types` (all exist today, verified in Task 1's file). `Button`, `Checkbox`, `Dialog`/`DialogContent`/`DialogDescription`/`DialogTitle`/`DialogTrigger`, `Input`, `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue`, `Textarea` from `@/components/ui/*` (all exist today).
- Produces: `CourseFormDialog({ course?: Course, onSave: (course: Course) => void, children: React.ReactNode })` — a self-contained dialog (manages its own open state internally, exactly like `enquiry-dialog.tsx`). `course` omitted = create mode; `course` provided = edit mode, prefilled. Consumed by Task 4 (`CoursesList`).

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/courses/course-form-dialog.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type Course,
  type CourseCategory,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CourseFormState {
  title: string;
  category: CourseCategory;
  priceGBP: string;
  durationDays: string;
  maxDelegates: string;
  cpdAccredited: boolean;
  summary: string;
}

function emptyForm(): CourseFormState {
  return {
    title: "",
    category: ALL_CATEGORIES[0],
    priceGBP: "",
    durationDays: "",
    maxDelegates: "",
    cpdAccredited: false,
    summary: "",
  };
}

function formFromCourse(course: Course): CourseFormState {
  return {
    title: course.title,
    category: course.category,
    priceGBP: String(course.priceGBP),
    durationDays: String(course.durationDays),
    maxDelegates: String(course.maxDelegates),
    cpdAccredited: course.cpdAccredited,
    summary: course.summary,
  };
}

export function CourseFormDialog({
  course,
  onSave,
  children,
}: {
  course?: Course;
  onSave: (course: Course) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CourseFormState>(
    course ? formFromCourse(course) : emptyForm(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(course ? formFromCourse(course) : emptyForm());
      setErrors({});
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Give the course a title.";
    if (!form.summary.trim())
      next.summary = "Add a short summary for students.";
    const price = Number(form.priceGBP);
    if (!form.priceGBP || Number.isNaN(price) || price <= 0)
      next.priceGBP = "Enter a price greater than £0.";
    const duration = Number(form.durationDays);
    if (!form.durationDays || Number.isNaN(duration) || duration <= 0)
      next.durationDays = "Enter a duration of at least 1 day.";
    const maxDelegates = Number(form.maxDelegates);
    if (!form.maxDelegates || Number.isNaN(maxDelegates) || maxDelegates <= 0)
      next.maxDelegates = "Enter at least 1 delegate.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      id: course?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      category: form.category,
      priceGBP: price,
      durationDays: duration,
      cpdAccredited: form.cpdAccredited,
      maxDelegates,
      summary: form.summary.trim(),
      archived: course?.archived ?? false,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <form onSubmit={submit} noValidate>
          <DialogTitle className="text-title">
            {course ? "Edit course" : "Add a course"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {course
              ? "Update the details students see on your listing."
              : "This appears on your public profile once saved."}
          </DialogDescription>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label htmlFor="course-title" className="eyebrow mb-2 block">
                Title
              </label>
              <Input
                id="course-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Advanced Cheek & Midface Filler"
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && (
                <p className="mt-1.5 text-micro text-error">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="course-category" className="eyebrow mb-2 block">
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as CourseCategory }))
                }
              >
                <SelectTrigger id="course-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="course-price" className="eyebrow mb-2 block">
                  Price (GBP)
                </label>
                <Input
                  id="course-price"
                  type="number"
                  min="1"
                  value={form.priceGBP}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceGBP: e.target.value }))
                  }
                  placeholder="1450"
                  aria-invalid={Boolean(errors.priceGBP)}
                />
                {errors.priceGBP && (
                  <p className="mt-1.5 text-micro text-error">
                    {errors.priceGBP}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="course-duration" className="eyebrow mb-2 block">
                  Duration (days)
                </label>
                <Input
                  id="course-duration"
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationDays: e.target.value }))
                  }
                  placeholder="2"
                  aria-invalid={Boolean(errors.durationDays)}
                />
                {errors.durationDays && (
                  <p className="mt-1.5 text-micro text-error">
                    {errors.durationDays}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="course-max-delegates"
                className="eyebrow mb-2 block"
              >
                Max delegates
              </label>
              <Input
                id="course-max-delegates"
                type="number"
                min="1"
                value={form.maxDelegates}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxDelegates: e.target.value }))
                }
                placeholder="4"
                aria-invalid={Boolean(errors.maxDelegates)}
              />
              {errors.maxDelegates && (
                <p className="mt-1.5 text-micro text-error">
                  {errors.maxDelegates}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2.5 text-small text-ink">
              <Checkbox
                checked={form.cpdAccredited}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, cpdAccredited: checked === true }))
                }
              />
              CPD accredited
            </label>

            <div>
              <label htmlFor="course-summary" className="eyebrow mb-2 block">
                Summary
              </label>
              <Textarea
                id="course-summary"
                rows={3}
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="What students will learn on this course…"
                aria-invalid={Boolean(errors.summary)}
              />
              {errors.summary && (
                <p className="mt-1.5 text-micro text-error">
                  {errors.summary}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full">
            {course ? "Save changes" : "Add course"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/courses/course-form-dialog.tsx
git commit -m "feat: add CourseFormDialog for adding and editing courses"
```

---

### Task 4: `CoursesList` component

**Files:**
- Create: `src/components/dashboard/courses/courses-list.tsx`

**Interfaces:**
- Consumes: `Course`, `CATEGORY_LABELS` from `@/lib/types`; `formatGBP` from `@/lib/utils`; `Badge`, `Button` from `@/components/ui/*`; `CourseFormDialog` from Task 3 (`./course-form-dialog`).
- Produces: `CoursesList({ courses: Course[] })` — consumed by Task 5 (the page).

- [ ] **Step 1: Create the component**

Create `src/components/dashboard/courses/courses-list.tsx`:

```tsx
"use client";

import { useState } from "react";
import { CATEGORY_LABELS, type Course } from "@/lib/types";
import { formatGBP } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseFormDialog } from "./course-form-dialog";

export function CoursesList({ courses: initialCourses }: { courses: Course[] }) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);

  function addCourse(course: Course) {
    setCourses((prev) => [...prev, course]);
  }

  function updateCourse(course: Course) {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)));
  }

  function toggleArchived(id: string) {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)),
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Courses</h1>
          <p className="mt-1.5 text-body text-ink-soft">
            What students see and book on your public listing.
          </p>
        </div>
        <CourseFormDialog onSave={addCourse}>
          <Button>Add course</Button>
        </CourseFormDialog>
      </div>

      {courses.length === 0 ? (
        <div className="mt-8 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No courses yet</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Add your first course to start appearing in student searches.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex flex-col rounded-card border border-linen bg-paper p-6"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">
                  {CATEGORY_LABELS[course.category]}
                </Badge>
                {course.cpdAccredited && (
                  <Badge variant="success">CPD accredited</Badge>
                )}
                {course.archived && <Badge variant="outline">Archived</Badge>}
              </div>
              <h3 className="mt-3 font-display text-title text-ink">
                {course.title}
              </h3>
              <p className="mt-2 flex-1 text-small leading-relaxed text-ink-soft">
                {course.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-data text-micro text-stone">
                <span>
                  {course.durationDays} day
                  {course.durationDays > 1 ? "s" : ""}
                </span>
                <span aria-hidden>·</span>
                <span>Max {course.maxDelegates} delegates</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-linen pt-4">
                <span className="font-data text-title font-medium text-ink">
                  {formatGBP(course.priceGBP)}
                </span>
                <div className="flex gap-2">
                  <CourseFormDialog course={course} onSave={updateCourse}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </CourseFormDialog>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleArchived(course.id)}
                  >
                    {course.archived ? "Reactivate" : "Archive"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/courses/courses-list.tsx
git commit -m "feat: add CoursesList grid with add/edit/archive actions"
```

---

### Task 5: Trainer Courses page

**Files:**
- Create: `src/app/trainer/courses/page.tsx`

**Interfaces:**
- Consumes: `getSession` from `@/lib/auth`; `getRepository` from `@/lib/repository`; `DashboardShell` from `@/components/dashboard/dashboard-shell`; `CoursesList` from Task 4 (`@/components/dashboard/courses/courses-list`); `logoutTrainer` from `../actions` (same relative import used by `src/app/trainer/enquiries/page.tsx`).
- Produces: the `/trainer/courses` route.

- [ ] **Step 1: Create the page**

Create `src/app/trainer/courses/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CoursesList } from "@/components/dashboard/courses/courses-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Courses",
};

export default async function TrainerCoursesPage() {
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
      <CoursesList courses={trainer.courses} />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/trainer/courses/page.tsx
git commit -m "feat: add trainer Courses page route"
```

---

### Task 6: Nav integration and Overview stat fix

**Files:**
- Modify: `src/components/dashboard/nav-config.ts`
- Modify: `src/lib/dashboard-stats.ts`
- Modify: `src/app/trainer/page.tsx`

**Interfaces:**
- Consumes: `Course.archived` (Task 1); the `/trainer/courses` route now existing (Task 5) is what makes enabling the nav link correct.

- [ ] **Step 1: Enable the Courses nav link**

In `src/components/dashboard/nav-config.ts`, change:

```ts
  { label: "Courses", href: "/trainer/courses", icon: BookOpen, disabled: true },
```

to:

```ts
  { label: "Courses", href: "/trainer/courses", icon: BookOpen },
```

No other line in this file changes.

- [ ] **Step 2: Remove the hardcoded activeCourses stat**

In `src/lib/dashboard-stats.ts`, change:

```ts
// Placeholder dashboard metrics — there is no backend yet (same "mock now,
// wire up later" seam as getRepository() in ./repository.ts). Swap these for
// real queries once bookings/billing exist.
//
// newEnquiries is derived live from DEMO_ENQUIRIES/enquiryStatus() in
// src/lib/enquiries.ts (see src/app/trainer/page.tsx) — no separate stub,
// so Overview can't silently drift from the Enquiries page it summarizes.

export interface TrainerStats {
  liveInSearch: boolean;
  bookings: number;
  bookingsNote: string;
  activeCourses: number;
  activeCoursesNote: string;
  profileViews30d: number;
  profileViewsNote: string;
  subscription: {
    tier: "Premium" | "Standard";
    priceGBP: number;
    status: "Active" | "Past due" | "Cancelled";
    renewsOn: string;
  };
}

export const DEMO_TRAINER_STATS: TrainerStats = {
  liveInSearch: true,
  bookings: 14,
  bookingsNote: "Confirmed on the Hub",
  activeCourses: 2,
  activeCoursesNote: "From £550",
  profileViews30d: 86,
  profileViewsNote: "Rated 4.7 · 9 verified reviews",
  subscription: {
    tier: "Premium",
    priceGBP: 249,
    status: "Active",
    renewsOn: "21 July 2026",
  },
};
```

to:

```ts
// Placeholder dashboard metrics — there is no backend yet (same "mock now,
// wire up later" seam as getRepository() in ./repository.ts). Swap these for
// real queries once bookings/billing exist.
//
// newEnquiries is derived live from DEMO_ENQUIRIES/enquiryStatus() in
// src/lib/enquiries.ts, and activeCourses is derived live from
// trainer.courses (see src/app/trainer/page.tsx) — no separate stubs for
// either, so Overview can't silently drift from the Enquiries or Courses
// pages it summarizes.

export interface TrainerStats {
  liveInSearch: boolean;
  bookings: number;
  bookingsNote: string;
  profileViews30d: number;
  profileViewsNote: string;
  subscription: {
    tier: "Premium" | "Standard";
    priceGBP: number;
    status: "Active" | "Past due" | "Cancelled";
    renewsOn: string;
  };
}

export const DEMO_TRAINER_STATS: TrainerStats = {
  liveInSearch: true,
  bookings: 14,
  bookingsNote: "Confirmed on the Hub",
  profileViews30d: 86,
  profileViewsNote: "Rated 4.7 · 9 verified reviews",
  subscription: {
    tier: "Premium",
    priceGBP: 249,
    status: "Active",
    renewsOn: "21 July 2026",
  },
};
```

- [ ] **Step 3: Derive the stat live in the Overview page**

In `src/app/trainer/page.tsx`, change the imports:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { DEMO_ENQUIRIES, enquiryStatus } from "@/lib/enquiries";
import { formatGBP } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { logoutTrainer } from "./actions";
```

to:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_TRAINER_STATS } from "@/lib/dashboard-stats";
import { DEMO_ENQUIRIES, enquiryStatus } from "@/lib/enquiries";
import { getRepository } from "@/lib/repository";
import { formatGBP } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { logoutTrainer } from "./actions";
```

Then change the component body from:

```tsx
export default async function TrainerDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const stats = DEMO_TRAINER_STATS;
  const now = new Date();
  const newEnquiryCount = DEMO_ENQUIRIES.filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;
```

to:

```tsx
export default async function TrainerDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const stats = DEMO_TRAINER_STATS;
  const now = new Date();
  const newEnquiryCount = DEMO_ENQUIRIES.filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  const activeCourses = (trainer?.courses ?? []).filter((c) => !c.archived);
  const activeCourseCount = activeCourses.length;
  const cheapestActivePrice =
    activeCourses.length > 0
      ? Math.min(...activeCourses.map((c) => c.priceGBP))
      : null;
```

Then change the "Active courses" `StatCard` from:

```tsx
        <StatCard
          label="Active courses"
          value={stats.activeCourses}
          caption={stats.activeCoursesNote}
        />
```

to:

```tsx
        <StatCard
          label="Active courses"
          value={activeCourseCount}
          caption={
            cheapestActivePrice !== null
              ? `From ${formatGBP(cheapestActivePrice)}`
              : "None listed yet"
          }
        />
```

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: no output (this step is where a leftover `stats.activeCourses` reference would surface as a type error — confirm there is none).

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors).

Run this to confirm no dangling references remain anywhere in `src`:
`grep -rn "activeCourses\b" src/lib/dashboard-stats.ts src/app/trainer/page.tsx`
Expected: only the new local `const activeCourses = ...` line in `page.tsx` — no `activeCoursesNote` anywhere, no `stats.activeCourses` anywhere.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/nav-config.ts src/lib/dashboard-stats.ts src/app/trainer/page.tsx
git commit -m "fix: enable Courses nav link and derive Active courses stat live"
```

---

### Task 7: Manual verification (browser-driven)

This task has no code changes. It exists to catch anything the type checker and linter can't: real rendering, real state transitions, real navigation. Use the `run` skill / browser automation tools to drive the actual app — do not just start the dev server and stop.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (check port 3000 isn't already occupied by a stray process first — if it is, find the PID with `Get-NetTCPConnection -LocalPort 3000 -State Listen` and stop it before starting a new one)

- [ ] **Step 2: Log in and open the Courses page**

Navigate to `/trainer/login`, sign in with `trainer@ath.demo` / `trainer123`, then navigate to `/trainer/courses` (or click "Courses" in the sidebar — it should no longer show a "Soon" disabled state).

Expected: 4 course cards render — "Advanced Cheek & Midface Filler", "Jawline & Chin Definition", "Masterclass: Full-Face Assessment", "Lip Filler Refinement" — matching `dr-amara-okafor`'s entries in `src/data/trainers.json`. None show an "Archived" badge.

- [ ] **Step 3: Validation check**

Click "Add course". Leave the title and summary blank, leave price/duration/max-delegates blank, and submit.

Expected: inline error messages appear under Title, Price, Duration, Max delegates, and Summary. The dialog stays open (no course was added).

- [ ] **Step 4: Add a course**

Fill in: Title "Skin Booster Fundamentals", Category "Skin boosters", Price 650, Duration 1, Max delegates 6, leave CPD unchecked, Summary "A one-day introduction to skin booster protocols for new injectors." Submit.

Expected: the dialog closes and a 5th card appears immediately with these exact values, no "Archived" badge, no "CPD accredited" badge.

- [ ] **Step 5: Edit a course**

Click "Edit" on "Lip Filler Refinement". Change the price from 850 to 950. Save.

Expected: dialog closes, that card now shows "£950".

- [ ] **Step 6: Archive and reactivate**

Click "Archive" on "Jawline & Chin Definition".

Expected: an "Archived" badge appears on that card, and its action button now reads "Reactivate" instead of "Archive".

Click "Reactivate" on the same card.

Expected: the "Archived" badge disappears, the button reads "Archive" again.

- [ ] **Step 7: Confirm the public profile is unaffected by in-session dashboard edits**

Navigate to `/trainer/dr-amara-okafor#courses`.

Expected: still shows exactly the original 4 seed courses (not 5, no £950 edit, nothing archived) — this is a fresh server render of `trainers.json`, completely independent of the dashboard's local `useState`. This is expected, not a bug (same reasoning as Enquiries: a booking made in the Enquiry detail page doesn't retroactively update the list).

- [ ] **Step 8: Confirm the Overview stat is unaffected by in-session dashboard edits**

Navigate to `/trainer` (Overview).

Expected: "Active courses" reads `4` with caption "From £850" (the cheapest of the 4 real seed courses) — unaffected by the in-session add/edit/archive actions taken in Step 4-6, for the same reason as Step 7.

- [ ] **Step 9: Confirm nothing persists across a reload**

Reload `/trainer/courses`.

Expected: back to exactly the original 4 courses — the added 5th course, the price edit, and the archive toggle are all gone. Expected, matching the documented "no backend" constraint.

- [ ] **Step 10: Final check**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npx eslint src`
Expected: no output (or only pre-existing baseline errors already known from prior work).

No commit for this task (no code changes) — if any step reveals a real defect, fix it in the relevant earlier task's files and re-run that task's verification before returning here.
