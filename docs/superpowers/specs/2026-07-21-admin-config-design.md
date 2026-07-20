# Admin Config page — design

## Context

The admin dashboard already has Applications, Practitioners, Reviews, and Billing
pages, each following the same shell: a `lib/*.ts` mapper that shapes data for the
dashboard, a `page.tsx` that guards the session and fetches data, a client-side
table component, and a review dialog for the per-row action.

`ADMIN_NAV` (`src/components/dashboard/nav-config.ts`) has a "Config" entry
pointing at `/admin/config`, currently rendered inert with `disabled: true`. This
spec builds that page.

## Why this is narrower than Reviews/Billing

Unlike reviews or subscriptions, there is no runtime "config" data anywhere in the
app. The only real, config-shaped thing sitewide is the course category list:

```ts
// src/lib/types.ts
export type CourseCategory = "lip-filler" | "anti-wrinkle" | ... // 9 categories
export const CATEGORY_LABELS: Record<CourseCategory, string> = { ... };
```

`CourseCategory` is a compile-time TypeScript union, not a database row — adding or
removing a category means editing source code and would need every trainer/course
reference re-checked. That's out of reach for a mock-data admin page and isn't
attempted here. What *is* real and useful without touching the type: how many
courses and trainers currently use each category, sourced live from
`trainers.json` (all 9 categories are in active use: counts range from 1 course/1
trainer for "chemical-peels" up to 5 courses/5 trainers for "lip-filler" and
"anti-wrinkle").

## Goal

Give the admin a usage view of the 9 course categories — course count, trainer
count — with the ability to edit a category's display label.

## Scope boundary

Label editing is local component state only, same "no backend yet" seam as
Reviews/Billing/Practitioners. It does **not**:
- change `CATEGORY_LABELS` in `src/lib/types.ts`,
- affect category labels shown anywhere on the public site (search filters,
  course cards, category chips),
- add, remove, or re-key a category (the `CourseCategory` union is fixed).

It resets on page reload, exactly like Reviews' hide/unhide.

Out of scope: adding/removing categories, merging categories, changing which
courses belong to which category, pagination (9 rows never needs it), an audit
log of renames.

## Data layer — `src/lib/categories.ts` (new)

```ts
export interface CategoryUsage {
  key: CourseCategory;
  label: string; // seeded from CATEGORY_LABELS
  courseCount: number;
  trainerCount: number;
}

export function toCategoryUsage(trainers: Trainer[]): CategoryUsage[]
```

`toCategoryUsage` walks every trainer's `courses[]`, tallying `courseCount` (total
courses) and `trainerCount` (distinct trainers offering at least one course) per
category, seeded across all `ALL_CATEGORIES` (so a category with zero usage would
still appear with count 0, even though that doesn't happen in the current data).
Sorted by `courseCount` descending — busiest categories first.

## Page — `src/app/admin/config/page.tsx` (new)

Same shape as `src/app/admin/practitioners/page.tsx`:
- Session guard (`redirect("/admin/login")` if not an admin session).
- `getRepository().getAll()` → `toCategoryUsage(trainers)`.
- Renders `<DashboardShell>` with an `<h1>Config</h1>` and
  `<CategoriesTable initialCategories={...} />`.

## Table — `src/components/dashboard/config/categories-table.tsx` (new, client)

Columns: Category (label), Courses, Trainers, Action ("Edit" button opening the
dialog).

State: `useState<Record<CourseCategory, string>>` keyed by category key, seeded
from each row's `label` — same pattern as the status-map state in
`ReviewsTable`/`BillingTable`, but holding a label string instead of a status enum.

Summary line above the table: "9 categories across N courses" (N = sum of
`courseCount`).

No empty state needed — all 9 categories always render (seeded from
`ALL_CATEGORIES`, not derived only from what's present in data).

## Dialog — `src/components/dashboard/config/category-edit-dialog.tsx` (new)

Props: `category: CategoryUsage | null`, `label: string`, `onOpenChange`,
`onLabelChange: (key: CourseCategory, label: string) => void`.

Contents: current label as title, the category key shown read-only (e.g. as a
`font-data` mono caption — mirrors how `AdminReview`'s dialog shows student
initials), course/trainer counts as a fields grid, an `<Input>` pre-filled with
the current label, and a footer "Save label" button that calls `onLabelChange`
with the input's current value and closes the dialog.

No "View public profile" link here (unlike Reviews/Billing/Practitioners) — a
category isn't a single practitioner's page; there's no natural single URL to
link to.

## Nav — `src/components/dashboard/nav-config.ts`

Change the `ADMIN_NAV` entry from:
```ts
{ label: "Config", href: "/admin/config", icon: Settings, disabled: true },
```
to:
```ts
{ label: "Config", href: "/admin/config", icon: Settings },
```

## Testing

No test suite exists for the dashboard pages yet — manual verification via the
running dev server, checking:
- `/admin/config` renders all 9 categories, busiest first, with correct
  course/trainer counts.
- Editing a label in the dialog updates the table row's displayed label without
  a page reload, and resets after a hard refresh (confirming it's local-only).
- Nav link is now clickable (no more "Soon" hint).
