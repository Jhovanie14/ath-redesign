# Enquiry login gate — design

## Context

`docs/superpowers/specs/2026-07-29-student-module-design.md` built real
student accounts (register, log in, dashboard, messages) but explicitly kept
the public trainer-profile `EnquiryDialog`
(`src/components/trainer/enquiry-dialog.tsx`) out of scope — it stayed a
cosmetic, unconnected form that anyone can "submit" without an account and
without persisting anything.

Now that student accounts exist, the ask is to close that gap: enquiring
(and any equivalent student action) should require the visitor to be logged
in as a student. `EnquiryDialog` is the only unauthenticated action surface
in the app — `/apply` is the unrelated trainer-listing wizard, and every
other student action already lives inside the `/student/*` dashboard, which
is already gated (`getSession()` + `redirect()` per page, plus the `/student`
exact-path check in `src/proxy.ts`).

## Goal

A logged-out (or trainer/admin-logged-in) visitor who clicks "Enquire" /
"Ask about a course" / "Enquire about this course" sees a sign-in prompt
instead of the enquiry form. A student who is logged in sees the real form,
and submitting it actually persists the enquiry (reusing the student
dashboard's existing `createEnquiryAction`) instead of faking a success
state. After logging in or registering from the prompt, the visitor lands
back on the trainer page they came from, so they can immediately finish
enquiring.

## Scope boundary

In scope: `EnquiryDialog` and its three call sites
(`src/app/trainer/[slug]/page.tsx`, `src/components/trainer/profile-hero.tsx`,
`src/components/trainer/course-list.tsx`); a `next`-redirect mechanism added
to the shared `LoginForm`/`RegisterForm` and the student login/register
pages + actions.

Out of scope: the `Session`/`Booking`/venue rearchitecture from
`docs/superpowers/specs/2026-07-25-enquiry-booking-architecture.md`;
multi-trainer routing (still exactly one demo trainer, as
`createEnquiryAction` already assumes); password reset; email
notifications; any change to admin/trainer login behavior beyond adding the
same optional `next` capability to the shared form components.

## `EnquiryDialog` — branch on session

`TrainerPage` (`src/app/trainer/[slug]/page.tsx`) calls `getSession()` and
passes the result as a `session: Session | null` prop into `ProfileHero`,
`CourseList`, and its own aside `EnquiryDialog`. `ProfileHero` (client) and
`CourseList` (server) each forward `session` into the `EnquiryDialog`
instances they render.

`EnquiryDialog` branches its `DialogContent` on `session`:

- **`session === null` or `session.role !== "student"`** (covers logged-out
  visitors and trainer/admin sessions — enquiring is a student-only action,
  so a wrong-role session is treated the same as no session): render a
  sign-in prompt — heading ("Sign in to enquire"), one line of body copy,
  and two links styled as buttons: **Log in** →
  `` `/student/login?next=/trainer/${trainer.slug}` `` and **Create
  account** → `` `/student/register?next=/trainer/${trainer.slug}` ``. These
  are plain navigations (`next/link`), not dialog state — clicking one
  leaves the page.
- **`session.role === "student"`**: render the existing form, trimmed:
  - Drop the `name`/`email` inputs and their validation entirely. Replace
    with a static line: `Sending as {session.name} · {session.email}` —
    identity now comes from the account, not a freeform field.
  - Keep the `course` select and `message` textarea as they are today.
  - On submit, call `createEnquiryAction({ courseTitle: course, body:
    message })` (imported from `src/app/student/messages/actions.ts`, same
    import `NewMessageDialog` already uses) inside a `useTransition`, mirror
    of the pending-state pattern in
    `src/components/dashboard/student/new-message-dialog.tsx`. No new
    backend code: `createEnquiryAction` already re-checks the session
    server-side, persists via `createEnquiry()`, revalidates
    `/student/messages`, `/student`, `/trainer/enquiries`, and `/trainer`,
    and redirects to `/student/messages/{id}` on success.
  - The old client-only `submitted` success state and the email-regex
    validation are removed — there is nothing left to fake once submission
    is real and the action redirects the whole page on success.

## Login/register `next` redirect

`LoginForm` and `RegisterForm` (`src/components/auth/login-form.tsx`,
`src/components/auth/register-form.tsx` — shared across admin/trainer/
student) gain an optional `next?: string` prop, rendered as a hidden
`<input type="hidden" name="next" value={next} />` inside the existing
`<form>` when present.

`src/app/student/login/page.tsx` and `src/app/student/register/page.tsx`
become `searchParams`-reading pages (`{ searchParams }: { searchParams:
Promise<{ next?: string }> }`, consistent with `generateMetadata`'s existing
`params` await pattern elsewhere in this app) and pass `next` through to
`LoginForm`/`RegisterForm`.

`src/app/student/login/actions.ts` (`loginStudent`) and
`src/app/student/register/actions.ts` (`registerStudentAction`) read `next`
from `formData`, validate it with a small shared helper —
`isSafeRedirect(path: string | null): path is string` in `src/lib/auth.ts`,
requiring the value to start with `/` and not `//` (blocks protocol-relative
open redirects) — and `redirect(isSafeRedirect(next) ? next : "/student")`.
Admin and trainer login pages don't pass `next`, so they keep redirecting to
their current hardcoded destinations unchanged.

## Error handling / edge cases

- Trainer/admin session viewing a trainer profile page sees the same
  sign-in gate a logged-out visitor would — enquiring is student-only,
  there's no separate "wrong role" message.
- Missing or invalid `next` (absent, not `/`-prefixed, or `//`-prefixed)
  falls back to today's behavior (redirect to `/student`).
- Session expiring between opening the dialog and submitting is already
  handled by `createEnquiryAction`'s existing server-side session check,
  which redirects to `/student/login` — untouched by this change.

## Testing

No automated test suite covers these flows (mock-data app, per existing
convention). Manual walkthrough: log out, open a trainer profile, click
each of the three enquire entry points and confirm the sign-in gate appears;
follow "Create account" through registration and confirm it lands back on
the same trainer page; click Enquire again, submit the trimmed form, and
confirm it redirects to `/student/messages/{id}` showing the new message;
log in as the trainer demo account and confirm the same enquiry appears in
`/trainer/enquiries`. Also spot-check: logging in as the trainer/admin demo
account and visiting a trainer profile page still shows the sign-in gate,
not the form.

## Known limitations

**Single-trainer enquiry routing.** Enquiries aren't scoped to a specific
trainer — there's only one demo trainer account (matching the pre-existing
assumption `createEnquiryAction` and the trainer dashboard already made), so
an enquiry submitted from any of the 8 public trainer profiles lands in that
one trainer's inbox and thread view, labeled with that trainer's name rather
than the one the visitor actually enquired with. This was an explicit,
accepted scope decision (not a bug to silently work around) — fixing it
properly would mean adding a trainer identifier to `Enquiry` and scoping
`src/app/trainer/enquiries` by it, deferred until there's more than one
trainer account to route between.

**`/trainer/[slug]` lost static prerendering.** Before this feature,
`/trainer/[slug]` was prerendered at build time for all 8 trainer profiles
(`generateStaticParams`). Gating the enquiry form on `getSession()` means the
page now reads the session cookie, which is a dynamic API in Next.js — since
this app doesn't have Partial Prerendering / `cacheComponents` enabled, that
forces the whole route to render per-request instead of being served as a
static page. This was confirmed by comparing production build output
(`npx next build`) before and after this branch: the route flips from `●`
(SSG, 8 static paths) to `ƒ` (fully dynamic). This is an accepted tradeoff
for now — the app's homepage and several other routes are already dynamic —
revisit if/when Partial Prerendering is adopted app-wide.
