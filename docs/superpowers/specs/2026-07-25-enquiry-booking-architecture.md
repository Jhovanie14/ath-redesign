# Enquiry & Booking Flow — Architecture Analysis

**Date:** 2026-07-25
**Status:** Analysis / proposal. No code changed.
**Scope:** The path from a student's first enquiry through to a completed,
reviewed course — across the public site, the trainer dashboard, and the
(currently non-existent) student surface.

---

## 0. The question being answered

> After an enquiry is marked as booked by a practitioner, what's next? How does
> the student check the date, location, etc.? How does the practitioner check
> how many students will attend?

Short answer: **none of those three things are currently possible**, and the
reason is structural rather than cosmetic. Three entities that the flow depends
on do not exist in the data model. This document traces the current flow,
names the gaps, proposes a target model, and phases the work.

---

## 1. What actually happens today

### 1.1 Student submits an enquiry

`src/components/trainer/enquiry-dialog.tsx`

The student picks a course title from a `<Select>`, types name / email /
message, and submits. Validation runs, then:

```ts
if (Object.keys(next).length === 0) setSubmitted(true);
```

That is the entire submit handler. The dialog swaps to an "Enquiry sent"
confirmation. **Nothing is persisted.** The email address is captured for
validation and then discarded when the dialog unmounts. The student leaves with
no record, no reference number, no thread, and no route back in.

The file that owns the trainer's inbox states this plainly in its own header
(`src/lib/enquiries.ts:3-7`):

> The public-facing EnquiryDialog simulates a student submitting an enquiry but
> doesn't persist anywhere — there is no real connection between that dialog and
> this seed data.

So the two halves of the flow are not connected at all. The trainer inbox is
seeded from `DEMO_ENQUIRIES`.

### 1.2 Trainer replies and marks as booked

`src/components/dashboard/enquiries/enquiry-detail.tsx`

The trainer opens a thread, sees the conversation, and in the sidebar finds a
"Confirm booking" block containing a bare `<input type="date">` and a **Mark as
booked** button:

```ts
function markBooked() {
  if (!dateInput) return;
  setBookedDate(dateInput);
}
```

Local React state. Gone on refresh. Alongside it, the UI makes two promises
(lines 194-197):

> Confirming shares your contact details with the student and schedules a review
> invitation after the course.

Neither mechanism exists anywhere in the codebase.

### 1.3 Status after booking

`src/lib/enquiries.ts:31-39`

```ts
export function enquiryStatus(e: Enquiry, now: Date): EnquiryStatus {
  if (e.archived) return "archived";
  if (e.bookedDate) {
    return new Date(e.bookedDate).getTime() < now.getTime()
      ? "attended"
      : "booked";
  }
  return "new";
}
```

Status derives from a single nullable field. Consequences:

- **`attended` means "a date passed"**, not that anyone turned up. There is no
  attendance record.
- There is no way to express declined, cancelled, rescheduled, waitlisted, or
  no-show.
- The booking block in the detail view is gated on `status === "new"`
  (`enquiry-detail.tsx:49`), so **once booked, the trainer cannot change the
  date, cancel, un-book, or even archive.** The UI is a dead end.

### 1.4 And then it stops

There is no student notification, no student-facing record, no calendar entry,
no reminder, no register, no review invitation. The flow terminates at a
trainer-local boolean.

---

## 2. Root cause — three missing entities

Every symptom traces back to these.

| Missing entity | What breaks without it |
|---|---|
| **Session / Cohort** — a dated, located, capacity-bound instance of a course | Nowhere to store a date, start time, venue, or seat count. `Course.maxDelegates` exists (`src/lib/types.ts:19`) but nothing counts against it. Availability is a free-text string: `"Next cohort: March 2026"` (`src/data/trainers.json:85`). |
| **Booking** as a first-class record | Booking is a nullable field *on the enquiry* (`bookedDate`). One enquiry can therefore only ever produce zero or one booking. A clinic booking three nurses, or one student booking two courses, cannot be represented. |
| **Student identity** | No `/student` route, no student auth, no student record. `src/app` contains public pages, `/trainer/*` and `/admin/*` only. The student exists solely as a display string inside the trainer's inbox. |

**Compounding problem:** `Enquiry` links to a course by **`courseTitle` string**,
not `courseId`. Two students who book "Jawline & Chin Definition" on 14 August
are two unrelated rows the system has no way to recognise as the same event.
This is the direct reason attendee counts are not derivable.

---

## 3. Gap register

### 3.1 Booking is one-sided

"Mark as booked" is the trainer asserting something privately. The student is
never asked to confirm and never informed. Without an offer → accept handshake,
`booked` means only "the trainer believes this", which is why nothing downstream
can safely depend on it.

### 3.2 Location is unanswerable

The finest location granularity in the model is `Trainer.city`
(`src/lib/types.ts:51`). There is no venue name, address line, postcode, or
room. A student cannot find out where to turn up because it was never recorded.

### 3.3 Time is unanswerable

`bookedDate` is a date only — no start or end time. `Course.durationDays`
exists, so multi-day courses also have no day-2 information.

### 3.4 Attendee counts are not derivable

`getUpcomingBookings()` (`src/lib/trainer-insights.ts:45-66`) returns one row
per enquiry that has a `bookedDate`:

```ts
upcoming.push({ id, studentName, courseTitle, bookedDate, daysAway });
```

The Availability page renders these as a flat list of individuals. To answer
*"how many are coming on 14 August?"* you would have to group by `bookedDate`
plus a `courseTitle` string match — and even then there would be no
seats-remaining figure, because nothing joins to `maxDelegates`.

### 3.5 "Booking verified" is an unbacked public claim

The seal appears in six places in the UI, and How It Works states it flatly
(`src/app/how-it-works/page.tsx:105`):

> Only a student with a booking made through the Hub. Every review carries a
> 'Booking verified' mark, and there's no way to post one without having
> attended.

`Review.bookingVerified` is typed as the literal `true`
(`src/lib/types.ts:33`) with the comment *"always true by design"*. There is no
mechanism linking a booking to a review author. **This is the one gap with
compliance / ASA exposure**, because it is a public claim about how the product
works.

### 3.6 Missing lifecycle states

The enum is `new | booked | attended | archived`. Real-world outcomes with
nowhere to go: declined, cancelled by student, cancelled by trainer,
rescheduled, waitlisted, no-show, deposit pending.

### 3.7 Notifications reference events that are never emitted

`src/components/dashboard/settings/notification-preferences-card.tsx` offers
toggles for "New student enquiries", "Booking confirmations & reminders", and
"New reviews". There is no event bus, no email sender, and no scheduler behind
any of them.

### 3.8 Seed-data inconsistency (minor)

`enq-3` has `receivedAt: "2026-07-10"` and `bookedDate: "2026-07-02"` — booked
eight days before the enquiry arrived. Harmless demo noise, but it will produce
a nonsensical `attended` status and is worth cleaning when the model changes.

---

## 4. Target model

**Session** is the spine. It is the smallest addition that resolves all three
questions at once, because it is the single place where date, location, and
capacity live together.

```
Trainer ─┬─ Course (template)
         │     title, category, priceGBP, durationDays,
         │     maxDelegates, cpdAccredited, summary
         │
         └─ Session (instance)
               id
               courseId
               startsAt / endsAt          ← answers "when"
               venue {                    ← answers "where"
                 name, line1, line2, city, postcode, lat, lng, notes
               }
               capacity                   (defaults from course.maxDelegates)
               status: draft | open | full | cancelled | completed

Enquiry (conversation)  ──many-to-many──►  Booking (commitment)
   id                                        id
   trainerId                                 sessionId        ← joins to date + venue
   courseId  (was courseTitle string)        studentId | contact { name, email, phone }
   contact { name, email, phone }            enquiryId  (nullable — allows direct booking)
   messages[]                                status  (see §5)
   archived                                  accessToken  (unguessable, for student link)
                                             depositReceived: boolean
                                             attendedAt | noShowAt
                                             notes  (dietary, access, experience level)
```

### Two rules that matter

1. **Enquiry ≠ Booking.** An enquiry is a conversation; a booking is a
   commitment. Kept separate, one enquiry can yield zero, one, or three
   bookings — and a returning student can book without raising a new enquiry.

2. **Seats are counted, never stored.**

   ```
   seatsBooked = bookings.where(sessionId, status ∈ {confirmed, attended}).count
   seatsLeft   = session.capacity − seatsBooked
   ```

   This follows the existing codebase convention — `enquiryStatus()`,
   `renewalUrgency()`, and `toPractitioners()` all derive rather than store, so
   two views can never disagree.

### Where a 1:1 fits

Several trainers advertise one-to-one dates
(`"Next available: 1:1 dates in March 2026"`). A 1:1 is simply a session with
`capacity: 1`. No second code path required.

---

## 5. Booking state machine

```
                    ┌──── decline ────► declined
                    │
  offered ──────────┼──── expire (72h) ► expired  (seat auto-released)
     │              │
     │              └──── accept ──────► confirmed
     │                                      │
     │                                      ├── cancel (either side) ──► cancelled
     │                                      │
     │                          course date passes
     │                                      ▼
     │                             awaiting_register
     │                                   │      │
     │                        mark ──────┘      └────── mark
     │                     attended                    no_show
     │                        │
     └────────────────────────┴──► review invitation issued (single-use token)
```

Notes:

- **`offered` holds a seat provisionally.** Without an expiry, abandoned offers
  silently consume capacity. 72 hours is a reasonable default; make it a config
  value.
- **`attended` becomes a recorded fact**, marked by the trainer on a register —
  replacing today's "the date went by" inference. That recorded fact is what
  earns the review invitation, which is what finally makes "Booking verified"
  true.
- **`cancelled` must free the seat** and, if a waitlist exists, notify the next
  person automatically.

---

## 6. The three questions, answered

### 6.1 "After marked as booked, what's next?"

The trainer action changes from *mark as booked* to **send a booking offer**:

1. Trainer picks a **session** (not a raw date) from their schedule, or creates
   one inline from the enquiry.
2. System creates `Booking { status: offered }`, holds a seat, and emails the
   student a link to `/booking/[token]`.
3. Student opens the link, reviews full details, clicks **Confirm my place**.
4. Booking → `confirmed`. Both sides receive a confirmation email with an
   `.ics` calendar attachment. The trainer's roster increments.
5. Reminders fire at T−7 days and T−1 day.
6. Day after the course, the trainer marks the register: attended / no-show.
7. `attended` triggers a single-use review invitation link.

### 6.2 "How does the student check the date, location, etc.?"

Two options. **Recommendation: do A now, B later** — they are not mutually
exclusive, and A migrates cleanly into B because both render the same `Booking`
record.

#### Option A — Tokenised booking page, no login

Route: `/booking/[token]` — unguessable URL, delivered by email.

Contents:

- Course title, trainer name, trainer verification seal
- **Date and start time**, duration, day-by-day schedule for multi-day courses
- **Venue** — name, full address, postcode, map, parking / access notes
- What to bring, dress code, prerequisites
- Price, deposit status, balance due, payment method
- Cancellation and reschedule policy
- Trainer contact details
- Buttons: **Confirm place** (when `offered`), **Add to calendar (.ics)**,
  **Request reschedule**, **Cancel my place**
- After the course: **Leave a review** (the same token proves attendance)

This is the pattern used by GP surgeries, Calendly, and most event platforms.
It requires no auth system, works straight from the confirmation email, and is
a natural home for the post-course review link.

#### Option B — Student accounts (`/student`)

A dashboard listing upcoming and past bookings across all trainers, message
threads, and review prompts. Better long-term, but it brings a full auth
surface, password reset, GDPR/DSAR obligations, and account-recovery support
load. Justified once students typically book more than once.

#### Related: fix the public profile

Trainer profiles currently show a free-text `availabilityNote`
(`"Next cohort: March 2026"`). With sessions, they can list real dates:

> **14 Aug · Manchester · 3 of 6 places left · [Enquire]**

That is a conversion improvement, not merely a data fix — and it lets search
filter on "has dates in the next 60 days".

### 6.3 "How does the practitioner check how many students will attend?"

A **Session detail page** at `/trainer/sessions/[id]`, plus a schedule view
replacing today's free-text Availability page.

**Session detail contains:**

- Header — course, date, time, venue, and the headline count:
  **"4 of 6 booked · 2 places left"**
- **Delegate roster** — one row per booking: name, email, phone, booking
  status, deposit received, link to the originating enquiry thread, and any
  dietary / access / experience notes
- **Register mode** — tick attended / no-show per delegate on the day; this
  feeds review invitations and the `studentsTrained` figure on the public
  profile
- Actions — message all delegates, export CSV, print register, cancel session
  (auto-notifies every delegate)
- Waitlist section, if the session is full

**Schedule view** (replacing `/trainer/availability`) — calendar or list of
upcoming sessions, each showing date, course, venue, and `booked/capacity`.
Create, edit, duplicate, and cancel sessions here.

**Overview page** — `getUpcomingBookings()` becomes `getUpcomingSessions()`,
returning sessions with counts. The card reads *"Next session: 14 Aug — 4
delegates"* instead of a list of unrelated individual names.

---

## 7. Delivery phases

### Phase 1 — Model (unblocks everything else)

- Add `Session`, `Booking`, `Venue` types
- Change `Enquiry.courseTitle` → `courseId`
- Migrate existing `bookedDate` values into `Booking` records
- Update seed data across all trainers in `trainers.json`
- No UI change yet

### Phase 2 — Trainer scheduling

- Availability page → session schedule (create / edit / cancel, with venue and
  capacity)
- Session detail page with roster and seat counts
- Enquiry detail: "Mark as booked" → "Offer a place on…" with a session picker
- Fix the dead-end UI: allow reschedule, cancel, and archive from any status

### Phase 3 — Student visibility ← *closes the loop in the original question*

- Persist enquiries for real (wire `EnquiryDialog` to the repository)
- Tokenised `/booking/[token]` page
- Transactional email: enquiry received, offer sent, booking confirmed,
  T−7 and T−1 reminders, cancellation
- `.ics` generation

### Phase 4 — Register & verified reviews

- Attendance marking on the session page
- Review invitation tokens, single-use
- Enforce: no review without an `attended` booking
- Makes the existing public claim truthful

### Phase 5 — Public sessions

- Real dates and seats-left on trainer profiles
- Search filter: "has dates in the next 60 days"
- Waitlist when a session is full

**Phases 1–3 are the coherent minimum.** Shipping 1–2 without 3 leaves the
student blind — which is precisely the problem originally identified.

---

## 8. Open decisions

These change the shape of the build and need answering before a spec is written.

1. **Session-based or ad-hoc?**
   Are courses run as scheduled cohorts that students join, or dates negotiated
   per student? The seed data implies both (`"Monthly cohorts"` vs `"1:1 dates
   in March 2026"`). The model above handles both if a 1:1 is a session with
   `capacity: 1` — confirm that matches how the business thinks about it.

2. **Student accounts — now or later?**
   Recommendation: tokenised page now, accounts once there is repeat-booking
   evidence.

3. **Does money touch the platform?**
   Pricing and How It Works both promise no booking fee and direct dealing with
   the trainer. If deposits stay off-platform there is no lever against
   no-shows, and only the trainer's word that a booking was real. Minimum
   viable middle ground: a trainer-marked "deposit received" flag on the
   booking.

4. **Who can cancel, and by when?**
   Needs a policy before it can be built — trainer-only, student-with-notice,
   or free cancellation up to N days.

5. **The "Booking verified" claim** is live on the site with nothing behind it.
   Soften the copy until Phase 4 lands, or accept the gap on a short timeline?

---

## 9. File reference

Files this analysis draws on, for follow-up reading:

| File | Role |
|---|---|
| `src/components/trainer/enquiry-dialog.tsx` | Public enquiry form — submits nowhere |
| `src/lib/enquiries.ts` | `Enquiry` type, `enquiryStatus()`, `DEMO_ENQUIRIES` seed |
| `src/components/dashboard/enquiries/enquiry-detail.tsx` | Thread view, reply box, "Mark as booked" |
| `src/components/dashboard/enquiries/enquiries-list.tsx` | Trainer inbox list |
| `src/lib/trainer-insights.ts` | `getUpcomingBookings()`, `getEnquiryFunnel()`, activity chart data |
| `src/lib/types.ts` | `Course`, `Trainer`, `Review`, `Verification` |
| `src/app/trainer/availability/page.tsx` | Free-text availability note + bookings list |
| `src/components/dashboard/availability/upcoming-bookings-list.tsx` | Flat per-enquiry booking list |
| `src/app/how-it-works/page.tsx` | Public claims about booking and review verification |
| `src/components/dashboard/settings/notification-preferences-card.tsx` | Notification toggles with no backing events |
| `src/data/trainers.json` | Seed trainers, courses, `availabilityNote` strings |
