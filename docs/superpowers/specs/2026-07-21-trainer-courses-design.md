# Trainer Courses Page — Design Spec

## Goal

Let a trainer view, add, edit, and archive the courses on their own listing from
the dashboard, at `/trainer/courses` (nav entry already reserved but disabled).
Fix a stat card that already disagrees with real data, and make archiving a
course actually stop it from showing on the public profile.

## Context

`Trainer.courses` (`src/lib/types.ts`) already exists and is used today only by
the public-facing profile page, via `src/components/trainer/course-list.tsx` —
a read-only display. There is no dashboard-side management of courses yet.

The trainer dashboard has no per-trainer session identity (the `Session` type
carries only `role`/`name`/`email`) — every trainer-dashboard page hardcodes
the one demo trainer, `getRepository().getBySlug("dr-amara-okafor")`
(`src/app/trainer/page.tsx` does the same for `publicProfileHref`). This page
follows that same convention; it is not a new decision.

`src/lib/dashboard-stats.ts`'s `DEMO_TRAINER_STATS.activeCourses` is hardcoded
to `2`, but Dr Amara Okafor's real `courses` array (`src/data/trainers.json`)
has 4 entries — already the same kind of drift the `pendingApplications` and
`newEnquiries` fixes caught in earlier work. This plan removes the hardcoded
field, matching that precedent.

There is no backend yet anywhere in this app. Every trainer-dashboard mutation
so far (Enquiries: reply/book/archive) lives in local component `useState`,
seeded once from server-fetched data, and never writes back. This spec follows
the same convention for Courses: adding, editing, or archiving a course in this
page is local-only and resets on reload. This is a deliberate, existing
pattern — not a bug to fix here.

## Data Model Change

`src/lib/types.ts` — add one optional field to `Course`:

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
  archived?: boolean; // new. undefined/false = active. Optional so the other
                       // 22 courses across 7 other trainers in trainers.json
                       // don't need touching.
}
```

No other trainer's course data changes. Dr Amara Okafor's 4 seed courses in
`trainers.json` are untouched (all implicitly active — no `archived` key).

## Public Profile Change

`src/components/trainer/course-list.tsx` filters before rendering:

```tsx
const activeCourses = trainer.courses.filter((c) => !c.archived);
```

Map over `activeCourses` instead of `trainer.courses`. If `activeCourses` is
empty, render nothing extra beyond the existing section heading (matches how
the section behaves today if a trainer had zero courses — no new empty-state
copy needed here, this is a pre-existing public page, out of scope to redesign
its empty state).

## Overview Stat Fix

`src/lib/dashboard-stats.ts`:
- Remove `activeCourses` and `activeCoursesNote` from the `TrainerStats`
  interface and from `DEMO_TRAINER_STATS`.
- Update the file's header comment to describe the new live-derivation,
  matching the existing comment style for `newEnquiries`.

`src/app/trainer/page.tsx`:
- Fetch the trainer once: `const trainer = await getRepository().getBySlug("dr-amara-okafor");`
- Compute:
  ```ts
  const activeCourses = (trainer?.courses ?? []).filter((c) => !c.archived);
  const activeCourseCount = activeCourses.length;
  const cheapestActivePrice =
    activeCourses.length > 0
      ? Math.min(...activeCourses.map((c) => c.priceGBP))
      : null;
  ```
- `StatCard` for "Active courses" becomes:
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

This stat is computed from the same server-fetched `trainer.courses` the
Courses page itself reads — archiving a course *in the Courses page* (local
state) will not retroactively update this card in the same session, exactly
like booking an enquiry doesn't retroactively update the "New enquiries" card.
Expected, not a bug — same precedent.

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Courses entry only. No other entry changes.

## Trainer Courses Page

### `src/app/trainer/courses/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or `role !== "trainer"`
  (same pattern as `src/app/trainer/enquiries/page.tsx`).
- `const trainer = await getRepository().getBySlug("dr-amara-okafor");` — if
  null, `notFound()`.
- Renders `<CoursesList courses={trainer.courses} />` inside `DashboardShell`.

### `src/components/dashboard/courses/courses-list.tsx` (new, client component)

Holds all local state:

```tsx
"use client";
const [courses, setCourses] = useState<Course[]>(initialCourses);
```

- Header row: page title + "Add course" `Button` that opens `CourseFormDialog`
  in create mode.
- Grid of cards (`grid gap-5 sm:grid-cols-2 lg:grid-cols-3`, `rounded-card
  border border-linen bg-paper p-6` — same card shell as the public
  `course-list.tsx`), one per course in `courses` (including archived ones —
  this is the trainer's own management view, they need to see and reactivate
  archived courses, unlike the public page which hides them).
- Each card shows: category `Badge` (`variant="neutral"`), CPD badge if
  `cpdAccredited` (`variant="success"`, label "CPD accredited"), an
  "Archived" `Badge` (`variant="outline"`) when `course.archived` is true,
  title, summary, duration/max-delegates micro-text row (same format as the
  public card), price, and two actions: "Edit" (opens `CourseFormDialog` in
  edit mode, prefilled) and "Archive" / "Reactivate" (toggles `course.archived`
  directly, no dialog needed for this action).
- Empty state (`courses.length === 0`): "No courses yet" / "Add your first
  course to start appearing in student searches." — same empty-state shell
  used elsewhere (`rounded-card border border-linen bg-paper px-6 py-16
  text-center`).
- `addCourse(course: Course)`: `setCourses((prev) => [...prev, course])`.
- `updateCourse(course: Course)`: `setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)))`.
- `toggleArchived(id: string)`: `setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c)))`.

### `src/components/dashboard/courses/course-form-dialog.tsx` (new, client component)

Shared Dialog for both add and edit, following `enquiry-dialog.tsx`'s
structure and inline-errors-object validation style:

```tsx
export function CourseFormDialog({
  course,       // undefined = create mode; Course = edit mode
  onSave,       // (course: Course) => void
  children,     // trigger element
}: {
  course?: Course;
  onSave: (course: Course) => void;
  children: React.ReactNode;
})
```

Fields:
- Title — text `Input`, required non-empty.
- Category — `Select` over `ALL_CATEGORIES` / `CATEGORY_LABELS` (same as
  `enquiry-dialog.tsx`'s course `Select`).
- Price (GBP) — number `Input`, required, must be `> 0`.
- Duration (days) — number `Input`, required, must be `> 0`.
- Max delegates — number `Input`, required, must be `> 0`.
- CPD accredited — `Checkbox` with a label.
- Summary — `Textarea`, required non-empty.

Validation mirrors `enquiry-dialog.tsx`: a `Record<string, string>` errors
state, populated on submit, inline `text-micro text-error` messages under each
invalid field, submit blocked (no `onSave` call) while any error exists.

On submit in create mode: build a new `Course` with
`id: crypto.randomUUID()`, `archived: false`, and the entered fields; call
`onSave(newCourse)`, close the dialog, reset the form. In edit mode: spread the
existing `course` with the edited fields (preserving `id` and `archived`),
call `onSave(...)`, close.

Dialog title: "Add a course" (create) / "Edit course" (edit). Submit button
label: "Add course" / "Save changes".

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack, not
  the training-data defaults) — route `params` are `Promise<{...}>` and must
  be `await`ed where relevant.
- No backend — every mutation in this feature is local `useState`, seeded once
  from server props, never written back. Explicit, not a gap to close later
  in this plan.
- `archived` is optional on `Course`; only new/edited-in-session courses ever
  get it explicitly set. Existing seed data across all 8 trainers is
  untouched.
- Badge variant convention holds: `neutral` (category), `success` (CPD /
  positive), `outline` (archived marker) — `gold` stays reserved for
  Premium-tier subscription badges only, never used here.
- Follow `enquiry-dialog.tsx`'s validation-errors-object pattern exactly —
  no new form/schema library.
- `formatGBP` (from `src/lib/utils.ts`) for all price display — no ad hoc
  currency formatting.

## Manual Verification

1. Log in as trainer, open `/trainer/courses` — 4 course cards render matching
   `trainers.json`'s `dr-amara-okafor` entries, none marked archived.
2. Click "Add course", submit with an empty title/summary and a price of `0`
   — inline errors appear under each invalid field, dialog does not close.
3. Fill in a valid new course, submit — a 5th card appears immediately with
   the entered values, `archived` not shown (not archived).
4. Click "Edit" on an existing card, change its price, save — the card
   reflects the new price immediately.
5. Click "Archive" on a card — an "Archived" badge appears on that card, and
   its action button now reads "Reactivate". Click "Reactivate" — badge
   disappears, button reads "Archive" again.
6. Navigate to `/trainer/dr-amara-okafor#courses` (public profile) — still
   shows all 4 original seed courses (none of the in-session dashboard edits
   persisted, since this is a fresh server render of `trainers.json` — expected).
7. Navigate to `/trainer` (Overview) — "Active courses" stat still reads `4`
   / "From £850" (cheapest of the 4 real seed courses), unaffected by the
   in-session dashboard edits (expected, same reasoning as #6).
8. Reload `/trainer/courses` — back to the original 4 courses, no
   session edits persisted (expected).
9. `npx tsc --noEmit` and `npx eslint src` both clean.
