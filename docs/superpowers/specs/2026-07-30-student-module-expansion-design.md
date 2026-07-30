# Student module expansion — design

## Context

`docs/superpowers/specs/2026-07-29-student-module-design.md` built real student
accounts (register, log in, dashboard, messages, profile), and
`docs/superpowers/specs/2026-07-30-enquiry-login-gate-design.md` gated the
public enquiry form behind that login. Both landed on `ath-v2-build`.

Reviewing the result, the student experience is noticeably thinner than the
other two roles. The nav
(`src/components/dashboard/nav-config.ts`) has 3 items for a student —
Overview, Messages, Profile — versus 9 for a trainer and 7 for an admin. The
Overview page (`src/app/student/page.tsx`) is a welcome line, an open-enquiry
count in prose, and the 3 most recent messages. Nothing else.

A separate architecture analysis
(`docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md`) looked at
this same gap from the booking side and found the data model has no
`Session`/`Booking`/`Venue` entities at all — only a nullable `bookedDate` on
an `Enquiry`. It explicitly deferred building that out ("Phase 3") pending
demand, recommending a tokenised booking page or full student accounts only
once repeat-booking evidence exists.

This spec does **not** revisit that decision. It scopes a smaller pass: enrich
the student module using the data model that already exists, plus a small
number of new "light" concepts that don't require a booking/session
rearchitecture — saved trainers, student-authored reviews (gated on the
`attended` status that already exists), and account/notification settings
parity with the other two roles.

## Goal

A logged-in student sees a dashboard that reflects real activity across all
the mock data already available to them (enquiries, courses, a trainer they
can save, courses they've attended), across a nav that matches the shape of
the trainer/admin dashboards. No new backend concepts are introduced beyond
the existing "mutable in-memory store keyed by student email" pattern already
used by `enquiries.ts` and `students.ts`.

## Scope boundary

**In scope:**
- `src/app/student/page.tsx` (Overview) — stat row + upcoming-session card
- New pages: `/student/saved`, `/student/reviews`, `/student/settings`
- Wiring the existing (currently fake, client-only) Save/heart button on
  `src/components/trainer/profile-hero.tsx` to real per-student data
- `src/components/dashboard/nav-config.ts` — `STUDENT_NAV` grows to 6 items
- New data stores: `src/lib/favorites.ts`, `src/lib/student-reviews.ts`
- A small, additive seed-data change in `src/lib/enquiries.ts` (two new
  enquiries for the demo student account, described below)
- `STUDENT_NOTIFICATION_ROWS` alongside the existing
  `TRAINER_NOTIFICATION_ROWS` in `notification-preferences-card.tsx`

**Out of scope:**
- The `Session`/`Booking`/`Venue` rearchitecture from the 2026-07-25 doc
- Publishing student reviews to `Trainer.reviews` / the public profile, or to
  admin's review moderation page — reviews written here are student-only
- A "saved trainers" affordance anywhere other than the trainer profile page
  (e.g. search results / `TrainerCard`)
- Editing or deleting a submitted review
- Any real email/notification backend — the new Settings page is exactly as
  decorative as the trainer's existing notification card
- Changes to Trainer or Admin modules

## Data model additions

### `src/lib/favorites.ts` (new)

Mirrors the mutable-array pattern in `enquiries.ts`:

```ts
export interface SavedTrainer {
  studentEmail: string;
  trainerSlug: string;
  savedAt: string; // ISO
}
```

- `getSavedTrainersForStudent(email: string): SavedTrainer[]`
- `isTrainerSaved(email: string, trainerSlug: string): boolean`
- `toggleSavedTrainer(email: string, trainerSlug: string): boolean` — returns
  the new saved state; adds or removes the matching record.

### `src/lib/student-reviews.ts` (new)

```ts
export interface StudentReview {
  id: string;
  enquiryId: string; // one review per enquiry — enforced at write time
  studentEmail: string;
  trainerSlug: string; // hardcoded to the single demo trainer — same
                        // known limitation Enquiry.courseTitle already has
  trainerName: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: string; // ISO
}
```

- `getReviewsForStudent(email: string): StudentReview[]`
- `getReviewForEnquiry(enquiryId: string): StudentReview | undefined` — used
  both to hide "Leave a review" once submitted and to block double-submission
  server-side.
- `createStudentReview(input): StudentReview`

A top-of-file comment states plainly (matching `enquiries.ts`'s existing
style) that these reviews are student-facing only and never merged into
`Trainer.reviews` — so a future reader doesn't mistake the gap for a bug.

### Seed data — `src/lib/enquiries.ts`

The demo account (`student@ath.demo` / Freya Marsh) currently has two
enquiries, both status `new`. Neither the upcoming-session card nor the
reviews flow would have anything to show on first login. Add two new seed
enquiries for the same student:

- One with a **future** `bookedDate` → exercises the Overview "next session"
  card and stat.
- One with a **past** `bookedDate` (status derives to `attended`) → exercises
  the "leave a review" flow.

Existing seed enquiries (enq-1 through enq-9) are untouched.

### Notification rows

`STUDENT_NOTIFICATION_ROWS` added next to `TRAINER_NOTIFICATION_ROWS` in
`src/components/dashboard/settings/notification-preferences-card.tsx`, same
`NotificationRow[]` shape. Suggested rows: replies to your enquiries, session
reminders, new courses from trainers you've saved, product updates & tips.

## Feature: Saved trainers

`src/components/trainer/profile-hero.tsx` already renders a Save button with
a `Heart` icon (lines 30, 95–104) — it is local `useState`, resets on reload,
and works even when logged out. This feature wires that existing control to
real data rather than adding a new one.

- `TrainerPage` (`src/app/trainer/[slug]/page.tsx`) already computes
  `session`; it additionally computes
  `saved = session?.role === "student" ? isTrainerSaved(session.email, trainer.slug) : false`
  and passes `saved` into `ProfileHero`.
- `ProfileHero`'s Save button drops its local state:
  - **Logged out, or a trainer/admin session** (same "wrong role treated as no
    session" rule the Enquire gate uses): clicking navigates to
    `/student/login?next=/trainer/${trainer.slug}` — the existing `next`
    mechanism, no new redirect logic required.
  - **Logged in as a student**: clicking calls a new server action —
    `toggleSavedTrainerAction(trainerSlug: string)`, defined in the new
    `src/app/student/saved/actions.ts` (colocated with the `/student/saved`
    page it also serves, the same convention `createEnquiryAction` already
    follows in `student/messages/actions.ts` despite being called from the
    public trainer page) — inside a `useTransition`, revalidating the trainer
    page and `/student/saved`. It re-checks `getSession()` server-side before
    writing, same as `createEnquiryAction` does, rather than trusting the
    `session` prop the client component was rendered with.
- **New page `/student/saved`** (new nav item, `Heart` icon): renders
  `getSavedTrainersForStudent(session.email)` as a grid of the existing
  `TrainerCard` component (the same component search results already use),
  each linking to its profile, with an "Unsave" affordance calling the same
  toggle action. Empty state uses the existing `EmptyState` component,
  pointing at `/search`.

## Feature: Reviews

**New page `/student/reviews`** (new nav item, `Star` icon), gated the same
way every other student page is (`getSession()` + redirect to
`/student/login` if missing or wrong role).

Two sections:

1. **"Courses you can review"** — enquiries where
   `enquiryStatus(e, now) === "attended"` and `getReviewForEnquiry(e.id)` is
   still empty. Each row: course title, attended date, a "Leave a review"
   button opening a dialog (1–5 star rating + body textarea) that submits via
   a new server action `submitStudentReviewAction`, defined in the new
   `src/app/student/reviews/actions.ts`.
2. **"Your reviews"** — everything in
   `getReviewsForStudent(session.email)`, rendered read-only (rating, body,
   course title, date). No edit/delete — nothing elsewhere in the codebase
   supports editing a posted review either (admin moderation is hide/show
   only), so this isn't a gap relative to existing conventions.

`submitStudentReviewAction` re-checks `getSession()` and `getReviewForEnquiry`
server-side before writing — the session check mirrors every other student
server action, and the review check means a duplicate submission (e.g. two
tabs) returns an error instead of creating a second review.

## Feature: Settings

**New page `/student/settings`** (new nav item, `Settings` icon), same session
gate as every other student page. Renders only
`<NotificationPreferencesCard rows={STUDENT_NOTIFICATION_ROWS} />` — a single
card, no two-column split (trainer's Settings page splits because it has two
cards plus the notification card; student's Profile page already owns
real account/password editing, so Settings doesn't duplicate it with the
fake `AccountCard`/`SecurityCard` trainer's Settings page uses). The existing
Profile page and its server action are untouched.

## Overview page enrichment

`src/app/student/page.tsx`, above the existing "Recent activity" list:

- **Stat row** — three of the existing `StatCard` component (the same
  component trainer/admin overviews use):
  - "Open enquiries" — `enquiryStatus(e, now) !== "archived"` count (already
    computed today, currently only shown as a sentence)
  - "Next session" — nearest `booked`-status enquiry's date, or "None
    scheduled"
  - "Saved trainers" — `getSavedTrainersForStudent(email).length`
- **Upcoming session card** — rendered only if a `booked` enquiry exists:
  course title, trainer name, formatted date, link to that message thread.
  Omitted entirely otherwise (the stat row already communicates "None
  scheduled"; no second empty state stacked under it).
- "Recent activity" list is unchanged.

## Nav changes

`src/components/dashboard/nav-config.ts` — `STUDENT_NAV` grows from 3 to 6
items:

```
Overview → Messages → Saved → Reviews → Profile → Settings
```

`Heart` and `Star` icons are already imported into this file for other
roles' nav arrays.

## Error handling / edge cases

- Save-toggle clicked by a logged-in trainer/admin viewing a trainer profile
  → same "wrong role, no session" treatment as Enquire: redirect to student
  login.
- Double-submitting a review for the same enquiry (two tabs, resubmit after
  back-navigation) → server-side re-check in `submitStudentReviewAction`
  rejects it.
- A saved trainer slug the repository can't resolve (not reachable with
  today's static seed data, but defensive nonetheless) — `/student/saved`
  filters out any slug `getRepository().getBySlug()` returns `undefined` for,
  rather than rendering a broken card.
- Notification toggles remain decorative, matching the trainer's existing
  card — not a new regression, and not a new promise either.

## Testing

No automated test suite covers these flows (mock-data app, per existing
convention). Manual walkthrough: log in as the demo student and confirm the
new stat row and upcoming-session card render using the new seed data; toggle
Save on a trainer profile, confirm it persists across a reload and appears on
`/student/saved`, and confirm "Unsave" removes it; view the same trainer
profile logged out and confirm both Enquire and Save redirect to
`/student/login?next=...`; open `/student/reviews`, submit a review against
the seeded attended enquiry, confirm it moves from "Courses you can review" to
"Your reviews" and can't be submitted a second time; visit `/student/settings`
and confirm the notification card renders with working toggles.

## Known limitations

- **Reviews are student-only.** Submitting one does not change
  `Trainer.reviews`, the public rating average, or anything on the admin
  Reviews moderation page. This is an explicit, accepted scope decision (see
  Scope boundary), not a bug.
- **`trainerSlug` on favorites and reviews is effectively hardcoded** to the
  single demo trainer account, the same known limitation `enquiries.ts`
  already documents for `courseTitle`. Revisit both together once there's more
  than one trainer account to route between.
- **Notification preferences have no backend**, identical to the trainer's
  existing notification card — toggling them changes nothing beyond local
  component state.
