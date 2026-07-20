# Admin Reviews page — design

## Context

The admin dashboard already has Applications and Practitioners pages, each following
the same shell: a `lib/*.ts` mapper that shapes `Trainer` data for the dashboard, a
`page.tsx` that guards the session and fetches data, a client-side table component,
and a review dialog for the per-row action.

`ADMIN_NAV` (`src/components/dashboard/nav-config.ts`) already has a "Reviews" entry
pointing at `/admin/reviews`, currently rendered inert with `disabled: true`. This
spec builds that page.

Reviews themselves already exist as data: each `Trainer` in `src/data/trainers.json`
has a `reviews: Review[]` array (`studentInitials`, `rating`, `courseTitle`, `date`,
`body`, `bookingVerified: true` — always true by design, no verification workflow
needed). There are 21 reviews total across 8 trainers. They're rendered publicly via
`src/components/trainer/review-list.tsx` on each trainer's profile page.

## Goal

Give the admin a moderation queue: one flattened list of every review across every
practitioner, with the ability to hide a review (e.g. inappropriate content) without
deleting it.

## Scope boundary

Hide/unhide is admin-side only, held in local component state — it does **not**
wire back into `trainers.json` or affect the public `ReviewList` component. This
matches the existing pattern: Practitioners' Pause/Reinstate toggle doesn't actually
remove a listing from search either. There is no backend yet (see the "no backend
yet" comments in `applications.ts` and `dashboard-stats.ts`); this is the same seam.

Out of scope: search/filter (21 rows doesn't need it), hide reasons/audit log,
pagination, wiring the toggle to any persistence layer, changes to the public
`ReviewList` component, changes to Overview page stats.

## Data layer — `src/lib/reviews.ts` (new)

```ts
export type ReviewStatus = "visible" | "hidden";

export interface AdminReview {
  id: string;
  practitionerName: string;
  practitionerSlug: string;
  studentInitials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  courseTitle: string;
  date: string; // ISO
  body: string;
  initialStatus: ReviewStatus; // always "visible" — no seed data starts hidden
}

export function toAdminReviews(trainers: Trainer[]): AdminReview[]
```

`toAdminReviews` flattens `trainer.reviews` across all trainers, tagging each with
its practitioner's name/slug, and sorts newest-first by `date` (it's a moderation
log to browse, not a queue to clear — unlike Applications, which sorts oldest-first).

## Page — `src/app/admin/reviews/page.tsx` (new)

Same shape as `src/app/admin/practitioners/page.tsx`:
- Session guard (`redirect("/admin/login")` if not an admin session).
- `getRepository().getAll()` → `toAdminReviews(trainers)`.
- Renders `<DashboardShell>` with an `<h1>` and `<ReviewsTable initialReviews={...} />`.

## Table — `src/components/dashboard/reviews/reviews-table.tsx` (new, client)

Columns: Reviewer (initials + verified seal), Practitioner, Course, Rating (stars),
Date, Status badge, Action ("Review" button opening the dialog).

State: `useState<Record<string, ReviewStatus>>` keyed by review id, seeded from
`initialStatus` — same pattern as `PractitionersTable`'s `statuses` state.

Summary line above the table: "21 reviews · N hidden" (N omitted/zero-cased when
none are hidden), mirroring the "needs attention" clause on `PractitionersTable`.

Empty state (no reviews) follows `ApplicationsTable`'s empty-state pattern.

## Dialog — `src/components/dashboard/reviews/review-detail-dialog.tsx` (new)

Props: `review: AdminReview | null`, `status: ReviewStatus`, `onOpenChange`,
`onStatusChange: (id: string, status: ReviewStatus) => void`.

Contents: practitioner name + course as title/description, `RatingStars`, full
review body, student initials + formatted date, a "View public profile" link to
`/trainer/[slug]#reviews` (opens in new tab, matches `PractitionerReviewDialog`),
and a footer button: "Hide review" when visible, "Unhide review" when hidden.

## Nav — `src/components/dashboard/nav-config.ts`

Remove `disabled: true` from the `Reviews` entry in `ADMIN_NAV` (line 40).

## Testing

No test suite exists for the dashboard pages yet (Applications/Practitioners have
none either) — manual verification via `npm run dev`, checking:
- `/admin/reviews` renders all 21 reviews, newest first.
- Hide/Unhide toggles the status badge and summary count without a page reload.
- Nav link is now clickable (no more "Soon" hint).
