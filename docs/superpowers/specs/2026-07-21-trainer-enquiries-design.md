# Trainer Enquiries page — design

## Context

`/trainer/enquiries` is scaffolded in `nav-config.ts` (`TRAINER_NAV`) but
marked `disabled: true` — the route doesn't exist yet. This is the first
piece of the trainer-side dashboard beyond Overview. There is still no
backend: every other feature in this app (`applications.ts`,
`toAdminReviews`, `toPractitioners`) either derives from `trainers.json` via a
`(trainers, now)` mapper or ships a flat `DEMO_*` seed array with an explicit
"no backend yet" comment. This spec follows the same convention.

A separate, pre-existing student-facing dialog
(`src/components/trainer/enquiry-dialog.tsx`, on the public trainer profile
page) simulates *submitting* an enquiry, but doesn't persist anywhere — there
is no real connection between a student "sending" an enquiry there and a
trainer seeing it here. Wiring those together needs a real backend and is out
of scope; this spec only builds the trainer-side inbox against seed data.

## Goal

Give the trainer a working inbox for course enquiries: a list they can scan
and filter, and a detail view where they can reply, mark an enquiry booked
(agreeing a date), or archive it. Reuse the existing dashboard primitives
(`Card`, `Badge`, `InitialsAvatar`, `usePagination`/`TablePagination`) rather
than introducing new patterns.

## Scope boundary

Out of scope: connecting the public `EnquiryDialog` to this data (no
backend to persist a real submission into), email notifications, real
persistence of replies/bookings across a reload (same as every other
"action" in this app so far — e.g. `ReviewsTable`'s status changes are
in-memory only), multi-trainer routing (only one demo trainer session,
`trainer@ath.demo` / Dr Amara Okafor, exists).

## Data model — `src/lib/enquiries.ts`

```ts
export interface EnquiryMessage {
  from: "student" | "trainer";
  body: string;
  sentAt: string; // ISO datetime
}

export interface Enquiry {
  id: string;
  studentName: string;
  courseTitle: string;
  receivedAt: string; // ISO date
  messages: EnquiryMessage[]; // seeded with the initial student message
  bookedDate: string | null; // agreed date, set via "Mark as booked"
  archived: boolean;
}

export type EnquiryStatus = "new" | "booked" | "attended" | "archived";

export const DEMO_ENQUIRIES: Enquiry[] = [ /* ~8 fresh, realistic entries
  against Dr Amara Okafor's real courses (Advanced Cheek & Midface Filler,
  Jawline & Chin Definition, Masterclass: Full-Face Assessment, Lip Filler
  Refinement) — not copied from any external reference */ ];
```

Status is derived, never stored redundantly — same `renewalUrgency`-style
pattern as `practitioners.ts`:

```ts
export function enquiryStatus(e: Enquiry, now: Date): EnquiryStatus {
  if (e.archived) return "archived";
  if (e.bookedDate) {
    return new Date(e.bookedDate).getTime() < now.getTime() ? "attended" : "booked";
  }
  return "new";
}
```

One `now` is computed once per page render (`src/app/trainer/enquiries/page.tsx`
and the `[id]` page each call `new Date()` once, exactly as `admin/page.tsx`
already does) and threaded through every derivation and every child
component — nothing re-derives its own clock.

`STATUS_BADGE` mapping (matching existing `Badge` variants — `gold` stays
reserved for Premium tier elsewhere, not used here):

| Status | Label | Badge variant |
|---|---|---|
| `new` | New | `neutral` |
| `booked` | Booked | `warning` |
| `attended` | Attended | `success` |
| `archived` | Archived | `outline` |

## List page — `/trainer/enquiries`

`src/app/trainer/enquiries/page.tsx` (server component: auth guard via
`getSession`, redirect if not a trainer, computes `now` once, passes
`DEMO_ENQUIRIES` + `now` down) renders
`src/components/dashboard/enquiries/enquiries-list.tsx` (client component,
mirrors `ReviewsTable`'s state shape):

- Search box (name or course title) + status filter (`Select`, same as
  `ReviewsTable`), both resetting to page 1 on change.
- Card-feed layout (not a data table — this is a personal inbox, matching
  the reference): each row is a `Card` with `InitialsAvatar`, student name,
  status `Badge`, a one-line snippet (latest message body, truncated), and
  the received date (`formatShortDate`) right-aligned. Clicking a row
  navigates to `/trainer/enquiries/[id]`.
- Paginated via the existing `usePagination` hook + `TablePagination`
  (`PAGE_SIZE = 10`, matching `ReviewsTable`).
- Empty state (zero enquiries at all): "No enquiries yet" card, matching the
  short-copy style used elsewhere for a genuinely empty data set.
- No-matches state (filters active, zero results): "No matches" + "Try a
  different search term or status filter", identical copy/pattern to
  `ReviewsTable`.

## Detail page — `/trainer/enquiries/[id]`

`src/app/trainer/enquiries/[id]/page.tsx` (server component: auth guard,
`notFound()` if the id doesn't match any `DEMO_ENQUIRIES` entry, computes
`now` once) renders `src/components/dashboard/enquiries/enquiry-detail.tsx`
(client component, holds the enquiry's mutable state locally — messages
array, `bookedDate`, `archived` — since nothing persists):

- "← All enquiries" back link to the list.
- Header: student name + status `Badge`.
- Info row: course title, received date (`formatLongDate`).
- Message thread: each `EnquiryMessage` as a bubble (student messages
  left-aligned/`bg-paper`, trainer replies right-aligned/`bg-linen` or
  similar — reuse existing card/tone tokens, no new colors), timestamp under
  each.
- Reply box: a new `Textarea` primitive (`src/components/ui/textarea.tsx`,
  added the same way `Input`/`Sheet`/`Table` were added — a small shadcn-style
  primitive, styled consistently with `Input`) + "Send reply" `Button`.
  Appends a `{ from: "trainer", body, sentAt: now.toISOString() }` message to
  local state; does not persist past a reload.
- Booking block — **hidden once status is `booked`, `attended`, or
  `archived`** (nothing left to decide once one of those is set): a native
  `<input type="date">` + "Mark as booked" `Button` (sets `bookedDate`), plus
  an "Archive this enquiry" text link (sets `archived = true`). Matches the
  reference's copy: "Confirming shares your contact details with the student
  and books them in for a review invitation after the course."

## Integration

- `nav-config.ts`: `TRAINER_NAV`'s `Enquiries` entry drops `disabled: true`.
- `src/app/trainer/page.tsx`'s "New enquiries" `StatCard` currently reads the
  hardcoded `DEMO_TRAINER_STATS.newEnquiries` (`1`) with a static
  `enquiriesNote` ("All read"). This becomes live-derived: count of
  `DEMO_ENQUIRIES` where `enquiryStatus(e, now) === "new"`, with the note
  switching between "All read" (count `0`) and "Awaiting your reply"
  (count `> 0`) — the same fix already applied to admin Overview's stat
  cards in the last review round, so this card can't silently drift from the
  Enquiries page it's summarizing.
- `src/lib/dashboard-stats.ts`: remove `newEnquiries`/`enquiriesNote` from
  `TrainerStats`/`DEMO_TRAINER_STATS` (now redundant, same cleanup pattern as
  the admin `pendingApplications` fix), update the file's header comment.

## Testing

No test suite exists for dashboard pages yet — manual verification via the
running dev server:
- `/trainer/enquiries` renders the seeded list, search and status filter
  narrow it correctly, pagination works past 10 items.
- Clicking a card navigates to the correct `/trainer/enquiries/[id]`.
- Sending a reply appends a new bubble immediately (client-state only).
- Setting a future date + "Mark as booked" flips the badge to "Booked" and
  hides the booking block; a *past* date instead shows "Attended" — confirms
  the auto-derivation.
- "Archive this enquiry" flips the badge to "Archived" and hides the booking
  block regardless of `bookedDate`.
- Trainer Overview's "New enquiries" stat matches the count of "New"-badged
  rows on the Enquiries list.
- Responsive check at mobile/tablet/desktop widths, no overflow.
- Temporarily emptying `DEMO_ENQUIRIES` shows the "No enquiries yet" empty
  state instead of a blank/broken page.
