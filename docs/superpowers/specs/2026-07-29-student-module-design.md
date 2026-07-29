# Student module — design

## Context

There is currently no student-facing surface anywhere in the app.
`src/app` contains public marketing pages plus `/trainer/*` and `/admin/*`
dashboards; the student is a display string (`Enquiry.studentName`) inside
the trainer's inbox and nothing else. This gap is called out explicitly in
`docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md`, which
proposes a much larger `Session`/`Booking` rearchitecture and recommends —
as its default — a token-link booking page over full student accounts
("tokenised page now, accounts once there is repeat-booking evidence").

This spec deliberately takes the other branch: build real student accounts
now, scoped tightly to what was asked for (register, log in, view enquiries,
message the trainer) and explicitly **not** the `Session`/`Booking`/venue
rearchitecture that doc proposes. The two are compatible — this spec reuses
the doc's `Enquiry` shape and adds only what account-linkage requires
(`studentEmail`) — but session scheduling, booking state machines, and
tokenised booking pages stay out of scope here.

Like every other feature in this app, there is no backend yet — `getSession`/
`findDemoAccount` in `src/lib/auth.ts` and `getRepository()` in
`src/lib/repository.ts` are both explicit "mock now, swap for
Supabase later" seams. This spec follows the same convention throughout.

## Goal

A student can register, log in, see their own enquiries and the trainer's
replies, and send new messages to the trainer — all through a navbar-based
dashboard (visually distinct from the trainer/admin sidebar dashboards).
Reuse existing primitives (`LoginForm`/`LoginShowcase`, `Card`, `Badge`,
`Textarea`, `DropdownMenu`, `InitialsAvatar`, the `ink`/`stone`/`linen`/
`paper`/`ivory` tokens) rather than inventing new visual patterns.

## Scope boundary

Out of scope: the public trainer-profile `EnquiryDialog`
(`src/components/trainer/enquiry-dialog.tsx`) stays exactly as it is today —
cosmetic, unconnected. It is not wired to student accounts. A logged-in
student's only way to start a new enquiry is from inside their own
dashboard. Also out of scope: `Session`/`Booking`/venue entities, booking
state machine, email notifications, password reset, real (non-mock)
persistence, multi-trainer routing (there is exactly one demo trainer, `Dr
Amara Okafor`, exactly as the trainer dashboard already assumes).

## Auth — `src/lib/auth.ts` and new `src/lib/students.ts`

`Role` extends to `"admin" | "trainer" | "student"`. `getSession()`'s role
check accepts all three (currently a two-way `!==` chain — becomes a
membership check against a small `const ROLES` tuple to avoid a third
`!==` clause growing unreadably).

New `src/lib/students.ts`, same spirit as `DEMO_ACCOUNTS` but mutable
(registration has to actually add accounts, unlike the fixed
admin/trainer demo logins):

```ts
export interface StudentAccount {
  name: string;
  email: string;
  password: string;
}

// Mutable — unlike DEMO_ACCOUNTS in auth.ts, registration needs to add to
// this at runtime. Resets on server restart, same as every other mock
// store in this app.
let students: StudentAccount[] = [
  { name: "Freya Marsh", email: "student@ath.demo", password: "student123" },
];

export function findStudentAccount(email: string, password: string): Session | null;
export function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): { session: Session } | { error: string }; // error: "An account with this email already exists."
```

`DEMO_CREDENTIALS` (used by the existing "tap to autofill" button in
`LoginForm`) gains a `student` entry pointing at the seeded account.

### Routes

- `/student/login` — thin wrapper around `LoginForm` with `role="student"`,
  same shape as `src/app/trainer/login/page.tsx`. Server action
  `loginStudent` in `src/app/student/login/actions.ts` calls
  `findStudentAccount`, `setSession`, `redirect("/student")`.
- `/student/register` — new `RegisterForm` component
  (`src/components/auth/register-form.tsx`), same two-pane
  `LoginShowcase` + form layout as `LoginForm`, fields: name, email,
  password. No confirm-password field, no terms checkbox — YAGNI for a
  mock signup. Server action `registerStudentAction` in
  `src/app/student/register/actions.ts` calls `registerStudent`; on
  `{ error }` re-renders the form with that message (same
  `useActionState` pattern as `LoginForm`); on success calls `setSession`
  and redirects to `/student`. A link between `/student/login` and
  `/student/register` ("New here? Create an account" / "Already have an
  account? Sign in") is added to both pages.
- Every `/student/*` page except login/register is a server component
  that calls `getSession()`, redirects to `/student/login` if the role
  isn't `"student"` — identical guard pattern to `src/app/trainer/page.tsx:39-42`.

## Data — enquiries become a shared, mutable store

This is what makes "message the trainer" a real feature instead of a
second copy of today's non-persisting reply box.

`src/lib/enquiries.ts`:

```ts
export interface EnquiryMessage {
  from: "student" | "trainer";
  body: string;
  sentAt: string; // ISO datetime
}

export interface Enquiry {
  id: string;
  studentName: string;
  studentEmail: string; // new — links an enquiry to a student account
  courseTitle: string;
  receivedAt: string;
  messages: EnquiryMessage[];
  bookedDate: string | null;
  archived: boolean;
}
```

The seed array moves behind a small mutable module-level store, replacing
the plain exported `DEMO_ENQUIRIES` constant with accessor functions (any
existing importer of `DEMO_ENQUIRIES` as a flat array — trainer overview
stats, `trainer-insights.ts` — switches to `listEnquiries()`, which returns
the same array):

```ts
export function listEnquiries(): Enquiry[];
export function getEnquiryById(id: string): Enquiry | undefined;
export function getEnquiriesForStudent(email: string): Enquiry[];
export function appendMessage(id: string, message: EnquiryMessage): Enquiry | undefined;
export function createEnquiry(input: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  body: string;
  now: Date;
}): Enquiry;
```

Two existing seed entries carry the demo student's email
(`student@ath.demo`): `enq-1` (Freya Marsh — already unreplied, "new"
status, good empty-ish state) and one new seed entry, `enq-9` (also Freya
Marsh, already containing a trainer reply — gives the demo account one
thread with history too). All other seed entries keep placeholder emails
that don't match any account.

### Trainer side gets touched — minimally

`src/components/dashboard/enquiries/enquiry-detail.tsx`'s `sendReply()`
today only does `setMessages(prev => [...prev, ...])` — local React state,
lost on refresh, per the file's own local-state comment. It gains a
server action (`src/app/trainer/enquiries/[id]/actions.ts`,
`sendTrainerReplyAction`) that calls `appendMessage(id, { from: "trainer",
... })`, called alongside the existing local-state update (so the UI still
updates instantly) followed by `router.refresh()` so the persisted version
becomes the source of truth on next load. This is the only change on the
trainer side — `bookedDate`/`archived` local-state handling and the
booking block are untouched, out of scope.

## Student dashboard — routes, layout, pages

### Layout — `StudentShell` (navbar, not sidebar)

New `src/components/dashboard/student/student-shell.tsx`. Does **not**
reuse `DashboardShell`/`SidebarProvider` — those are sidebar-specific
primitives (`Sidebar`, `SidebarInset`, `SidebarTrigger`) that don't apply
to a navbar layout. It does reuse the visual language of
`DashboardTopbar` — sticky header treatment (`sticky top-0 z-10 border-b
border-linen bg-ivory/95 backdrop-blur-sm`), `InitialsAvatar`, and the same
avatar-dropdown-with-sign-out `DropdownMenu` pattern — restructured as a
full-width navbar:

```
[Wordmark]   Overview   Messages   Profile                [Avatar ▾]
──────────────────────────────────────────────────────────────────
                         <main content>
```

- Desktop (`lg+`): logo left (`wordmark-ink.png`, matching the light `ivory`
  background — the sidebar's `wordmark-stone.png` variant is for its dark
  background and doesn't apply here), inline nav links with active-state
  underline (`usePathname()` comparison, same as `DashboardSidebar`),
  avatar dropdown right.
- Mobile (`<lg`): logo + avatar + a hamburger button that opens a `Sheet`
  (`src/components/ui/sheet.tsx`, already installed) containing the nav
  links stacked vertically.
- Same content container as the sidebar dashboards:
  `mx-auto w-full max-w-[1600px] px-6 py-10 sm:px-10 lg:px-12 lg:py-14`.
- `STUDENT_NAV` added to `src/components/dashboard/nav-config.ts`:
  ```ts
  export const STUDENT_NAV: NavItem[] = [
    { label: "Overview", href: "/student", icon: LayoutGrid },
    { label: "Messages", href: "/student/messages", icon: MessageSquare },
    { label: "Profile", href: "/student/profile", icon: User },
  ];
  ```
  `navForRole` changes from `role === "admin" ? ADMIN_NAV : TRAINER_NAV`
  (trainer as silent fallback) to an explicit three-way switch.

### `/student` — Overview

Server component: session guard, `getEnquiriesForStudent(session.email)`,
`now = new Date()` once. Renders inside `StudentShell`:

- "Welcome back, {name}" heading, matching the trainer Overview's tone.
- A small stat: open-enquiry count (`enquiryStatus(e, now) !== "archived"`)
  with a caption ("Awaiting a reply" / "You're all caught up", mirroring
  the trainer Overview's `newEnquiryCount` caption pattern).
- A short list (2–3) of the most recently active threads — student name
  isn't needed here (it's their own name), so each row shows course
  title, status `Badge`, and a truncated snippet of the latest message,
  linking into `/student/messages/[id]`.
- Empty state (no enquiries at all): short copy + a button that opens the
  same "New message" flow as the Messages page.

### `/student/messages` and `/student/messages/[id]` — the inbox

This single feature **is** both "view my enquiries and replies" and
"message the trainer" — no separate read-only history page, per the
earlier scoping decision.

- List (`/student/messages`, no id): card-feed list of the student's own
  threads (course title, status `Badge`, latest-message snippet, received
  date) — same visual pattern as the trainer's `enquiries-list.tsx` minus
  the student-name column (redundant on this side) and minus
  search/status-filter (a student has at most a handful of threads,
  unlike a trainer's inbox — filtering is YAGNI here). A "New message"
  button opens a `Dialog`: course `<Select>` (populated from the demo
  trainer's course list via `getRepository().getBySlug(DEMO_TRAINER_SLUG)`,
  matching how `EnquiryDialog` sources its course options) + a message
  `Textarea`. Submitting calls `createEnquiryAction`
  (`src/app/student/messages/actions.ts`), which calls `createEnquiry(...)`
  and redirects to the new thread.
- Detail (`/student/messages/[id]`): `notFound()` if the id doesn't
  resolve, and **redirect to `/student/messages` (not a 403/404) if the
  enquiry exists but its `studentEmail` doesn't match the session** — this
  is the access-control boundary between students, silent rather than
  revealing that the id exists. Otherwise same thread-bubble layout as
  the trainer's `enquiry-detail.tsx` (message bubbles, student messages
  right-aligned this time since this is the student's own view — mirror
  image of the trainer layout — trainer messages left-aligned), reply box
  posting via `sendStudentReplyAction` → `appendMessage(id, { from:
  "student", ... })`. No booking block, no archive control — those are
  trainer-only actions and stay out of this view entirely (an archived
  thread still renders read-only with a note, reply box hidden).

### `/student/profile`

Server component + a simple client form (name, email, password fields,
pre-filled from session) posting to `updateStudentProfileAction`, which
mutates the matching entry in the `students` array and re-issues the
session cookie (name/email may have changed). Same field styling as
`LoginForm`'s inputs (`FIELD` constant pattern). Password field is
optional-to-change (blank = keep current), same convention most account
settings forms use.

## Error handling

- Duplicate email at registration → inline form error, no account created.
- Wrong email/password at login → inline form error (existing `LoginForm`
  pattern), no information about which field was wrong (matches
  trainer/admin login).
- Empty reply/new-message body → submit button stays disabled client-side
  (same `reply.trim() === ""` pattern as the trainer reply box); no
  server-side validation needed for a mock store with no adversarial
  input.
- Direct navigation to another student's `/student/messages/[id]` →
  redirect to `/student/messages`, as above.
- Direct navigation to any `/student/*` route while logged out, or while
  logged in as `admin`/`trainer` → redirect to `/student/login`.

## Testing

No test suite exists in this repo (`package.json` has no test runner) —
manual verification via the running dev server, matching every other
dashboard spec:

- Register a new account → lands on `/student` with an empty inbox; the
  same email can't be registered twice.
- Log in as the seeded demo account (`student@ath.demo` / `student123`,
  via the "tap to autofill" shortcut) → `/student` shows one open and one
  replied-to thread.
- Send a new message from `/student/messages` → new thread appears, and
  logging in as the trainer (`trainer@ath.demo`) shows it in
  `/trainer/enquiries`.
- Reply as the trainer to a thread linked to the demo student → log back
  in as the student and confirm the reply appears (this is the
  shared-store round trip — the core of this spec).
- Attempt to open another student's enquiry id directly → redirected to
  `/student/messages`, not shown.
- Log out and hit `/student` directly → redirected to `/student/login`.
- Navbar: verify active-link underline per route, mobile hamburger Sheet
  opens/closes and links work, responsive check at mobile/tablet/desktop
  widths.
- `npm run lint` and `npm run build` both pass.
