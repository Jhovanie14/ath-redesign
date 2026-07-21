# Trainer Settings Page — Design Spec

## Goal

Add a new `/trainer/settings` page to the trainer dashboard, covering the
one area no existing page owns: account/login details, password, and
notification preferences. Every other trainer page is already spoken for —
Profile (public bio/photos), Documents (compliance), Billing (subscription),
Availability (public note + bookings) — so this page introduces genuinely
new, non-overlapping ground rather than duplicating any of them.

## Context

There is no "Settings" nav entry today — unlike Billing, this isn't an
existing disabled placeholder being turned on; it's a new `TRAINER_NAV`
entry.

The auth model (`src/lib/auth.ts`) is a hardcoded `DEMO_ACCOUNTS` list
checked server-side only, with `Session { role, name, email }` stored in a
cookie. There is no per-account mutation API — same "mock now, wire up
later" seam as `getRepository()` and everywhere else in this app. This spec
does not add one. Saving on this page is local `useState` only, exactly
like the Profile/Availability save flows, and resets on reload.

Because there's no real account-mutation backend, the Security card's
"current password" field is collected (for realism — every real change-
password form has one) but **not verified against anything**. The design
must not simulate a fake "incorrect password" error path, since that would
imply a check that isn't happening. New/confirm password validation
(non-empty, matching, minimum length) is genuine client-side validation;
current-password correctness is not.

Notification preferences are a new concept with no existing data model.
They are purely local UI state (four toggles), matching the pattern already
established for other unpersisted dashboard state. Three of the four map to
real existing features (Enquiries, Availability bookings, Reviews); the
fourth ("Product updates & tips") is a generic marketing opt-out.

No `Switch` component exists in `src/components/ui/`. The `radix-ui`
meta-package is already a direct dependency (`package.json`) and re-exports
`Switch` — confirmed via `node -e "console.log(Object.keys(require('radix-ui')))"`.
A new `src/components/ui/switch.tsx` is added using this existing
dependency; **no package.json change**.

## Data Model Change

None. No changes to `src/lib/types.ts`, `src/lib/auth.ts`, or any seed data.
Email/password/notification state is local component state only, seeded
from `session.email` for the Account card.

## Nav Integration

`src/components/dashboard/nav-config.ts` — add one entry to `TRAINER_NAV`,
after Billing:

```ts
{ label: "Settings", href: "/trainer/settings", icon: Settings },
```

`Settings` is already imported in this file (used by `ADMIN_NAV`'s Config
entry) — no new import needed.

## Layout Decision (deliberate exception to the shared container width)

Every other redesigned dashboard page (Profile, Documents, Billing,
Availability) now relies solely on `DashboardShell`'s own
`max-w-[1600px]` container — no extra inner wrapper — so their content
spans the full shell width, matching Enquiries/Courses/Reviews/Overview.

Settings is different in kind: it's three short, narrow forms (an email
field; three password fields; four toggle rows), not a data list or a
two-column card grid. Stretching those fields to a 1600px-wide row would
look broken. This page instead wraps its content in:

```tsx
<div className="max-w-2xl">
```

(42rem / 672px, left-aligned — not centered — matching how the page
heading and every other dashboard page's content starts flush against the
shell's left edge). This is the one page in the redesigned set that
intentionally does not match the others' content width, because its
content is a different shape (stacked narrow forms vs. full-width lists/
grids/card pairs). Documented here so it isn't mistaken for a regression
in a future container-consistency pass.

## Trainer Settings Page

### `src/app/trainer/settings/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (same pattern as every other trainer page).
- No repository lookup needed — nothing here reads `trainers.json`.
- Renders inside `DashboardShell`:

```tsx
<div className="max-w-2xl">
  <h1 className="font-display text-display-md text-ink">Settings</h1>
  <p className="mt-2.5 text-body text-ink-soft">
    Manage your account, security, and notification preferences.
  </p>

  <div className="mt-8 flex flex-col gap-8">
    <AccountCard email={session.email} />
    <SecurityCard />
    <NotificationPreferencesCard />
  </div>
</div>
```

No page-level status badge (matches the Availability page's explicit "no
unnecessary badges" precedent — nothing here has a natural status to show).

### `src/components/ui/switch.tsx` (new, shared primitive)

Radix-based toggle, styled to match the existing `Checkbox`/`Input` token
conventions (`border-linen`, `bg-ink` for the checked/on state, visible
focus ring via the global `:focus-visible` rule, `disabled:opacity-50`).
`role="switch"` semantics come from Radix `Switch.Root` for free
(`aria-checked` announced automatically).

```tsx
"use client";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-linen bg-linen transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-ink data-[state=checked]:bg-ink",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className="pointer-events-none block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-paper shadow-e1 transition-transform data-[state=checked]:translate-x-[22px]"
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
export { Switch };
```

### `src/components/dashboard/settings/account-card.tsx` (new, client)

Props: `{ email: string }`.

- `Card` / `CardHeader` (card heading "Account", 17px semibold sans — same
  typographic override used for "Public availability note" on the
  Availability page, not the serif `CardTitle` default) / `CardContent`.
- Supporting copy: "Your login details for the trainer dashboard."
- One `Input` (`type="email"`), label "Email address", seeded from
  `email` prop.
- Dirty-check / Save button pattern identical to `AvailabilityNoteCard`:
  `useState(email)` for the draft, `useState(email)` for the saved
  baseline, Save disabled until they differ, `saving` boolean drives a
  `Loader2` spinner + "Saving…" label via a 500ms `setTimeout` (same
  "no real backend" comment as every other save flow this session), then
  a `CheckCircle2` + "Saved" inline confirmation, cleared on next edit.
- Basic client-side validation: non-empty, contains `@` — reuse the
  simplest possible check (`email.includes("@")`), inline error below the
  field on failed save attempt, same `role="alert" text-micro text-error`
  styling as every other field error this session.

### `src/components/dashboard/settings/security-card.tsx` (new, client)

- `Card` heading "Security", supporting copy: "Update the password you use
  to sign in."
- Three password fields, each with a show/hide toggle button (Eye/EyeOff
  icon inside the field, matching the `password-toggle` UX guideline
  already referenced earlier this session): "Current password", "New
  password", "Confirm new password". All start empty every render (no
  seed value — there is nothing real to seed from).
- Validation on Save click, in order, first failure wins (mirrors the
  `ProfileForm` multi-field validation/focus pattern):
  1. Current password empty → "Enter your current password." (collected
     for realism; not verified against any stored value — see Context).
  2. New password shorter than 8 characters → "Use at least 8
     characters."
  3. Confirm doesn't match new → "Passwords don't match."
- On successful validation: `saving` spinner (500ms simulated delay, same
  convention), then all three fields clear back to `""` and a "Saved"
  confirmation shows briefly next to the button — clearing the fields
  after a real password change is standard practice and also sidesteps
  ever leaving old input sitting in the DOM.
- Save button disabled only while `saving` is true (not a dirty-check
  here, since the fields have no "unchanged" baseline to compare against
  — every non-empty attempt is a real attempt, same reasoning
  `AvailabilityForm`/`ProfileForm` use for why Save isn't pre-disabled on
  empty-but-untouched fields).

### `src/components/dashboard/settings/notification-preferences-card.tsx` (new, client)

- `Card` heading "Notification preferences", supporting copy: "Choose
  which updates you receive by email."
- Four rows, each: label + one-line description + a `Switch` on the right,
  divided by subtle `border-t border-linen` between rows (matching the
  divider treatment used in `SubscriptionSummaryCard`):
  1. "New student enquiries" — "Get an email when a prospective student
     contacts you." — default **on**.
  2. "Booking confirmations & reminders" — "Get an email when a session is
     booked or coming up soon." — default **on**.
  3. "New reviews" — "Get an email when a student leaves a review." —
     default **on**.
  4. "Product updates & tips" — "Occasional emails about new features and
     best practices." — default **off**.
- Each `Switch` is independent local `useState<boolean>`, no shared draft/
  saved split — flipping it *is* the save (per your instant-save
  decision). No separate Save button on this card.
- No per-row "Saved" toast (would be noisy across four independently-
  saving rows) — the toggle's own visual state change plus Radix's
  automatic `aria-checked` announcement is the confirmation, consistent
  with how real notification-settings UIs (e.g. GitHub's) work.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (real stack).
- No backend — every save on this page is local `useState`, never written
  back, resets on reload. Explicit, matching every other trainer-dashboard
  page.
- Reuse existing tokens/components only: `Card`/`CardHeader`/`CardContent`,
  `Button` (primary/outline variants, existing disabled-state handling),
  `Input`, `Loader2`/`CheckCircle2` from `lucide-react` for
  saving/success states — same as `AvailabilityNoteCard`.
- New `Switch` component uses the `radix-ui` package already installed;
  do not add `@radix-ui/react-switch` or any other new dependency.
- Do not verify the "current password" field against any real value —
  document this restraint in the component (short comment), do not
  simulate a fake incorrect-password error path.
- Settings page content is capped at `max-w-2xl`, left-aligned — a
  deliberate, documented exception to the shared `max-w-[1600px]` shell
  width every other redesigned page now uses.

## Manual Verification

1. Log in as trainer, open `/trainer/settings` via the new sidebar nav
   entry — three cards render: Account (email pre-filled from session),
   Security (three empty password fields), Notification preferences (three
   toggles on, one off).
2. Account: clear the email field, click Save — inline error, no "Saved"
   confirmation. Type a valid email, click Save — spinner then "Saved",
   Save button disables again until the field changes.
3. Security: click Save with everything empty — "Enter your current
   password." Fill current password only, click Save — "Use at least 8
   characters." Fill a 8+ character new password that doesn't match
   confirm — "Passwords don't match." Fill all three consistently, click
   Save — spinner then "Saved", all three fields clear back to empty.
4. Notification preferences: click each toggle — flips instantly, no
   button to click, state persists across toggles within the session
   (reload resets to defaults, expected).
5. Reload `/trainer/settings` — Account email reverts to session value,
   Security fields empty, notification toggles back to defaults (expected
   — no backend, matches every other page's save behavior this session).
6. `npx tsc --noEmit`, `npx next build`, and `npx eslint src` all clean.
