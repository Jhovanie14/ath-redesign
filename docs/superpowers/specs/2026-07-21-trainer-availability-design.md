# Trainer Availability Page — Design Spec

## Goal

Let a trainer edit their `availabilityNote` — the single free-text line
already shown on their public profile (e.g. "Next cohort: March 2026") —
from the dashboard, at `/trainer/availability` (nav entry already reserved
but disabled).

## Context

`Trainer.availabilityNote: string` (`src/lib/types.ts:65`) already exists
and is already displayed today, read-only, in the public profile hero
(`src/components/trainer/profile-hero.tsx:82`). There is no structured
availability model (no dates array, no slots, no calendar) — just this one
string per trainer. This spec does not introduce one; it only makes the
existing string editable from the dashboard.

The trainer dashboard has no per-trainer session identity (same convention
as Courses/Enquiries) — this page hardcodes the one demo trainer via
`getRepository().getBySlug("dr-amara-okafor")`, matching every other
trainer-dashboard page.

There is no backend yet anywhere in this app. Every trainer-dashboard
mutation so far (Enquiries: reply/book/archive; Courses: add/edit/archive)
lives in local component `useState`, seeded once from server-fetched data,
and never writes back. This spec follows the same convention: saving a new
note here is local-only and resets on reload. This is a deliberate,
existing pattern — not a bug to fix here. Editing the note in this page will
not retroactively update the public profile hero in the same session, for
the same reason edits on the Courses page don't retroactively update the
Overview stat card — the public page is a fresh server render of
`trainers.json`.

## Data Model Change

None. `Trainer.availabilityNote` is unchanged.

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Availability entry only. No other entry changes.

## Trainer Availability Page

### `src/app/trainer/availability/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (same pattern as `src/app/trainer/courses/page.tsx`).
- `const trainer = await getRepository().getBySlug("dr-amara-okafor");` — if
  null, `notFound()`.
- Renders `<AvailabilityForm initialNote={trainer.availabilityNote} />`
  inside `DashboardShell`.

### `src/components/dashboard/availability/availability-form.tsx` (new, client component)

Holds all local state:

```tsx
"use client";
const [note, setNote] = useState(initialNote);
const [savedNote, setSavedNote] = useState(initialNote);
const [error, setError] = useState<string | null>(null);
const [justSaved, setJustSaved] = useState(false);
```

- Page heading ("Availability") + short explanatory copy: "This note
  appears on your public profile next to your booking details."
- A labelled text `Input` bound to `note`, pre-filled with `initialNote`.
  Label: "Availability note".
- Inline error (`className="mt-1.5 text-micro text-error"`, matching
  `course-form-dialog.tsx`'s exact error styling), shown only after a
  failed save attempt: "Add a note before saving" — when `note.trim()` is
  empty.
- "Save" `Button`:
  - `disabled` only when `note.trim() === savedNote.trim()` (nothing
    changed) — deliberately NOT disabled just because the field is empty,
    since clicking Save on an empty field is how the inline error gets
    triggered (see Manual Verification step 2).
  - On click: if `note.trim()` is empty, set the error and stop. Otherwise
    clear any error, set `savedNote(note)`, set `justSaved(true)`.
- Inline "Saved" confirmation (`className="text-micro text-success"`, the
  same success-tone class used for the badge/icon tint in
  `enquiry-dialog.tsx:78` and `contact-form.tsx:49`) next to the Save
  button, visible only while `justSaved` is true.
- Any further edit to the input (`onChange`) clears `justSaved` back to
  `false` and clears the error, so the confirmation/error never lingers
  next to stale text.

No dialog. No list. This is the entire component.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack, not
  the training-data defaults).
- No backend — the save is local `useState`, seeded once from server props,
  never written back. Explicit, not a gap to close later in this plan.
- Follow existing `Input`/`Button` components from `src/components/ui/` —
  no new form/schema library.
- Reuse existing text-tone utility classes for error/success inline text:
  `text-micro text-error` for the error line, `text-micro text-success` for
  the "Saved" confirmation — exact classes already used across the
  codebase (`course-form-dialog.tsx`, `enquiry-dialog.tsx`,
  `contact-form.tsx`).

## Manual Verification

1. Log in as trainer, open `/trainer/availability` — input shows the real
   `dr-amara-okafor` availability note from `trainers.json`, Save button
   disabled (nothing changed yet).
2. Clear the input, click Save — inline error appears, no "Saved"
   confirmation, Save remains clickable.
3. Type a new note, click Save — inline "Saved" confirmation appears next
   to the button, Save button becomes disabled again (matches new saved
   value).
4. Edit the input again (any change) — "Saved" confirmation disappears
   immediately, Save button re-enables.
5. Reload `/trainer/availability` — back to the original seed note, no
   session edits persisted (expected, same reasoning as Courses/Enquiries).
6. Navigate to `/trainer/dr-amara-okafor` (public profile) — hero still
   shows the original seed note, unaffected by the in-session dashboard
   edit (expected).
7. `npx tsc --noEmit` and `npx eslint src` both clean.
