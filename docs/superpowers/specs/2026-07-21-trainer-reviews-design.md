# Trainer Reviews Page — Design Spec

## Goal

Let a trainer view their own reviews — with search and a rating filter —
from the dashboard, at `/trainer/reviews` (nav entry already reserved but
disabled).

## Context

`Trainer.reviews: Review[]` (`src/lib/types.ts:26-34,63`) already exists and
is already displayed today, read-only, on the public profile via
`ReviewList` (`src/components/trainer/review-list.tsx`). Each `Review` has
`studentInitials`, `rating` (1-5), `courseTitle`, `date` (ISO), `body`, and
`bookingVerified: true` (always true by design — every seed review is
already booking-verified).

A separate admin-side Reviews page already exists
(`src/app/admin/reviews/page.tsx`, `ReviewsTable`) that aggregates reviews
across every trainer, with search, a status filter, and hide/unhide via a
local `ReviewStatus` (`"visible" | "hidden"`) held in the admin table's own
`useState` — never persisted, and not part of the `Review` type itself.
This spec does not touch that admin state or that page.

This trainer-side page is deliberately narrower: it is **read-only**. There
is no reply field on `Review`, and hide/unhide is an admin moderation
power, not something a trainer can do to their own reviews — so this page
adds no mutation capability at all, only client-side search/filter over
data that's already fetched.

The trainer dashboard has no per-trainer session identity (same convention
as Enquiries/Courses/Availability) — this page hardcodes the one demo
trainer via `getRepository().getBySlug("dr-amara-okafor")`, matching every
other trainer-dashboard page.

Note on the header stat: `Trainer.reviewCount` (41 for this demo trainer)
is a broader aggregate stat than `Trainer.reviews.length` (3 seed review
objects) — this mismatch already exists today in `trainers.json` and is
already how the public `ReviewList` presents it (header says "41 reviews",
only 3 are actually listed below). This page reproduces that exact same
pattern for consistency with the public page; it is not a bug introduced
here.

## Data Model Change

None. `Trainer.reviews`, `Trainer.rating`, `Trainer.reviewCount` are
unchanged.

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Reviews entry only. No other entry changes.

## Trainer Reviews Page

### `src/app/trainer/reviews/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (same pattern as
  `src/app/trainer/courses/page.tsx`).
- `const trainer = await getRepository().getBySlug("dr-amara-okafor");` — if
  null, `notFound()`.
- Renders `<TrainerReviewsList rating={trainer.rating} reviewCount={trainer.reviewCount} reviews={trainer.reviews} />`
  inside `DashboardShell`. No page-level heading — the heading lives inside
  the component, matching `CoursesList`/`AvailabilityForm`'s existing
  pattern (not `admin/reviews/page.tsx`'s pattern, which puts the `h1`
  directly in the server page — this trainer dashboard's own convention
  wins here since it's the more recently established one, in Courses and
  Availability).

### `src/components/dashboard/trainer-reviews/reviews-list.tsx` (new, client component)

Props: `{ rating: number; reviewCount: number; reviews: Review[] }`
(`Review` imported from `@/lib/types`).

Local state:

```tsx
"use client";
const [query, setQuery] = useState("");
const [ratingFilter, setRatingFilter] = useState<1 | 2 | 3 | 4 | 5 | "all">("all");
```

- Page heading ("Reviews") + short explanatory copy: "What students have
  said about your courses."
- Summary line: rating number + `RatingStars` (size 16) + `reviewCount`
  reviews — same three elements and layout `ReviewList` already renders in
  its header (`review-list.tsx:13-23`), just without the `SectionEyebrow`/
  `id="reviews"`/`sr-only h2` wrapper (those are public-profile
  page-section scaffolding, not appropriate for a dashboard page that
  already has its own heading via this component's own `h1`).
- Search `Input` (placeholder "Search by reviewer or course") bound to
  `query`, matching against `studentInitials` or `courseTitle`
  (case-insensitive, same matching style as `ReviewsTable`'s query filter
  but without the practitioner-name check, since this page is scoped to
  one trainer).
- Rating filter `Select` bound to `ratingFilter`: options "All ratings", "5
  stars", "4 stars", "3 stars", "2 stars", "1 star" — same trigger sizing
  as `ReviewsTable`'s status filter (`className="h-11 sm:w-[170px]"`).
- Filtering is a plain `useMemo` over the `reviews` prop — no pagination
  (see Global Constraints).
- Each filtered review renders as a card, reusing `review-list.tsx`'s
  exact card markup: `RatingStars` (size 14), body text, and a footer row
  with `studentInitials · courseTitle · formatMonthYear(date)` on the left
  and a `VerifiedSeal` (size 16) + "Booking verified" on the right.
- Empty states (two distinct ones, both copy-adapted from
  `ReviewsTable`'s existing empty-state pattern):
  - `reviews.length === 0`: "No reviews yet" / "Student reviews will
    appear here once bookings start coming in." (verbatim reuse — this
    copy is already established for zero-review states in this app).
  - Filtered list empty but `reviews.length > 0`: "No matches" / "Try a
    different search term or rating filter."

No dialog. No mutation. This is the entire component.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack, not
  the training-data defaults).
- No backend, no mutation — this page only reads `trainer.reviews` and
  filters client-side. There is nothing to save and nothing that resets on
  reload, unlike Availability/Courses (there's no local edit state at all
  here).
- Reuse existing `Input`/`Select`/`RatingStars`/`VerifiedSeal` components —
  no new form/schema library, no new star-rating or verification-badge
  implementation.
- Card container class: exactly `className="rounded-card border border-linen bg-paper p-6"`
  (matches `review-list.tsx:34` and the box used in `AvailabilityForm`).
- Body text class: exactly `className="mt-3 text-body leading-relaxed text-ink-soft"`
  (matches `review-list.tsx:37-39`).
- Footer row class: exactly `className="mt-4 flex flex-wrap items-center justify-between gap-3"`,
  left span `className="font-data text-micro text-stone"`, right span
  `className="inline-flex items-center gap-1.5 text-micro font-medium text-ink-soft"`
  (matches `review-list.tsx:40-49` exactly).
- No pagination: the admin `ReviewsTable` paginates because it aggregates
  reviews across every trainer in the system; this page shows one
  trainer's own 3 seed reviews, so pagination would render controls over
  a list too short to need them. This is a deliberate scope difference
  from the admin table, not an oversight.
- Auth guard pattern: redirect to `/trainer/login` if
  `!session || session.role !== "trainer"` (exact pattern in
  `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`,
  `notFound()` if null (exact pattern in
  `src/app/trainer/courses/page.tsx:19-20`).

## Manual Verification

1. Log in as trainer, open `/trainer/reviews` — header shows the real
   `dr-amara-okafor` rating (4.9) and review count (41) via `RatingStars`;
   all 3 seed reviews render as cards below, each with correct rating
   stars, body, reviewer initials, course title, formatted date, and a
   "Booking verified" seal.
2. Type a search term that matches one review's course title (e.g.
   "Jawline") — only that review's card remains visible.
3. Clear the search, set the rating filter to "5 stars" — all 3 reviews
   remain visible (this demo trainer's 3 seed reviews are all rated 5
   stars).
4. Set the rating filter to "1 star" (no matching seed reviews) — "No
   matches" empty state appears.
5. Reset both filters — all 3 reviews reappear.
6. Confirm the public profile (`/trainer/dr-amara-okafor`) is unaffected —
   still shows the same 3 reviews and rating (expected, this page is
   read-only and shares the same source data, not a copy).
7. `npx tsc --noEmit` and `npx eslint src` both clean.
