# Trainer Documents Page — Design Spec

## Goal

Let a trainer view and manage their compliance documents — insurance
certificate, qualification certificate, and professional registration proof —
from the dashboard, at `/trainer/documents` (nav entry already reserved but
disabled).

## Context

`Trainer.verification` (`src/lib/types.ts:36-45`) already carries
`insuranceCheckedAt`, `qualificationCheckedAt`, an optional
`professionalRegistration: { body, number }`, `humanReviewedAt`, and
`nextRenewalDue`. These are already displayed today, read-only, on the public
profile via `VerificationPanel` → `VerificationPassport`
(`src/components/trainer/verification-panel.tsx`,
`src/components/verification-passport.tsx`).

No document/file-storage data model exists anywhere in this app. The apply
wizard's copy (`src/components/apply/apply-wizard.tsx:523,587`) confirms
certificates are requested/provided out-of-band during onboarding — there is
no upload feature and no file-input pattern anywhere in the codebase today.
This page introduces the first one.

The trainer dashboard has no per-trainer session identity (same convention as
every other trainer-dashboard page) — this page hardcodes the one demo
trainer via `getRepository().getBySlug("dr-amara-okafor")`.

## Data Model Change

None. `Trainer.verification` is unchanged. This page derives each document
slot's *initial* display state from existing `verification` fields (see
below) but does not read or write any new field on `Trainer` or
`trainers.json`.

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Documents entry only. No other entry changes (Billing keeps
`disabled: true`).

## Trainer Documents Page

### `src/app/trainer/documents/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (same pattern as `src/app/trainer/courses/page.tsx`).
- `const trainer = await getRepository().getBySlug("dr-amara-okafor");` — if
  null, `notFound()`.
- Computes the three slots' seed state from `trainer.verification` (see
  below) and passes them as a `slots` prop array to `DocumentsList`, rendered
  inside `DashboardShell`. No page-level heading — the heading lives inside
  the component, matching `CoursesList`/`AvailabilityForm`/`ProfileForm`'s
  established pattern.

### Seed state derivation (computed in the server page)

Each slot is one of three statuses: `"not_uploaded"`, `"on_file"`, or
`"pending_review"` (the last is only ever reached client-side, never seeded).
`DocSlot` (below) is defined in and exported from
`documents-list.tsx` — the server page imports it from there rather than
redefining it.

```ts
// type DocSlot, imported from documents-list.tsx:
type DocSlot = {
  id: "insurance" | "qualification" | "registration";
  label: string;
  status: "not_uploaded" | "on_file";
  verifiedNote?: string; // e.g. "Verified July 2026"
};

// computed in page.tsx:
const slots: DocSlot[] = [
  {
    id: "insurance",
    label: "Insurance certificate",
    status: "on_file",
    verifiedNote: `Verified ${formatMonthYear(trainer.verification.insuranceCheckedAt)}`,
  },
  {
    id: "qualification",
    label: "Qualification certificate",
    status: "on_file",
    verifiedNote: `Verified ${formatMonthYear(trainer.verification.qualificationCheckedAt)}`,
  },
  {
    id: "registration",
    label: "Professional registration proof",
    status: trainer.verification.professionalRegistration
      ? "on_file"
      : "not_uploaded",
    verifiedNote: trainer.verification.professionalRegistration
      ? `Verified ${formatMonthYear(trainer.verification.qualificationCheckedAt)}`
      : undefined,
  },
];
```

`insuranceCheckedAt` and `qualificationCheckedAt` are required (non-optional)
fields on `Verification`, so those two slots always seed as `"on_file"` for
every trainer. Only the registration slot can seed as `"not_uploaded"`, when
`professionalRegistration` is absent. For the demo trainer
(`dr-amara-okafor`), `professionalRegistration` is present, so all three
slots seed as `"on_file"`.

### `src/components/dashboard/documents/documents-list.tsx` (new, client component)

Props: `{ slots: DocSlot[] }` (the `DocSlot` type above, exported from this
file; the server page imports it from here rather than redefining it).

Local state: one `Record<DocSlot["id"], SlotState>` where

```tsx
"use client";
type SlotState = {
  status: "not_uploaded" | "on_file" | "pending_review";
  fileName?: string;
  verifiedNote?: string;
};
```

seeded once from the `slots` prop (`status`/`verifiedNote` copied straight
across; `fileName` starts undefined for every slot — there is no real
filename in the seed data, only a verified-date note).

- Page heading ("Documents") + short explanatory copy: "Keep your compliance
  documents up to date. Listings pause automatically if cover lapses."
  (echoes `VerificationPanel`'s existing footer copy, since this page covers
  the same compliance ground from the trainer's own side).
- Three slots stacked as separate cards (not one shared card — each document
  is an independent unit a trainer acts on individually), each
  `className="rounded-card border border-linen bg-paper p-6"`.
- Each card renders:
  - `eyebrow` label with the slot's `label` text.
  - A status line, by current `status`:
    - `"not_uploaded"`: `<span className="text-micro text-stone">Not on file</span>`
    - `"on_file"`: a small `VerifiedSeal` (size 16) + `<span className="text-micro text-stone">On file · {verifiedNote}</span>`
    - `"pending_review"`: `<span className="text-micro text-stone">{fileName} · Pending review</span>`
      (no seal — an unreviewed upload hasn't earned the verified mark yet)
  - Action buttons, by current `status`:
    - `"not_uploaded"`: one `Button variant="outline" size="sm"` labelled
      "Upload"
    - `"on_file"` or `"pending_review"`: two buttons, `Button
      variant="outline" size="sm"` labelled "Replace" and `Button
      variant="ghost" size="sm"` labelled "Remove"
  - A hidden native file input per slot:
    `<input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" ref={...} onChange={...} />`,
    triggered by the Upload/Replace button via a ref + `.click()` (no upload
    library — this is the first file-input pattern in the codebase, kept as
    plain as possible).
- **Upload/Replace behavior:** selecting a file in the input sets that
  slot's state to `{ status: "pending_review", fileName: file.name,
  verifiedNote: undefined }`. The old `verifiedNote` is deliberately dropped
  — a freshly picked file has not been re-verified, so it should not
  continue to show a stale "Verified" date.
- **Remove behavior:** clicking "Remove" sets that slot's state to `{
  status: "not_uploaded", fileName: undefined, verifiedNote: undefined }`.
- No save/discard step — each action (upload, replace, remove) takes effect
  immediately on the slot's local state, since a file picker's own act of
  selecting *is* the user's confirmation (unlike `ProfileForm`'s text
  fields, which need an explicit Save because free text has no natural
  "confirm" moment).
- No persistence — all of this is local `useState`, seeded once from the
  server-computed `slots` prop, never written back anywhere. Reloading the
  page reverts every slot to its seed state (matches every other
  trainer-dashboard mutation in this app: `AvailabilityForm`, `CoursesList`,
  `ProfileForm`).

No dialog. No mutation beyond local state. No real file upload — the picked
`File` object's `name` is read and displayed; the file's contents are never
read, stored, or sent anywhere.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack, not
  the training-data defaults).
- No backend — file selection updates local `useState` only, seeded once
  from server-computed props derived from `trainer.verification`, never
  written back. Reloading the page reverts to the seed state. Deliberate,
  matching every other trainer-dashboard mutation in this app.
- No new upload/file library — a plain hidden `<input type="file">` per
  slot, triggered via ref + `.click()` from a `Button`.
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"`,
  one per document slot (three cards, not one shared card).
- Status/note text: exactly `className="text-micro text-stone"` (matches
  `VerificationPassport`'s own note styling).
- Button variants: `outline`/`size="sm"` for Upload/Replace, `ghost`/`size="sm"`
  for Remove (matches `courses-list.tsx`'s existing outline/ghost usage).
- `VerifiedSeal` at size 16 next to `"on_file"` status lines only — never
  shown for `"not_uploaded"` or `"pending_review"`.
- Auth guard pattern: redirect to `/trainer/login` if
  `!session || session.role !== "trainer"` (exact pattern in
  `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`,
  `notFound()` if null (exact pattern in
  `src/app/trainer/courses/page.tsx:19-20`).

## Manual Verification

1. Log in as trainer, open `/trainer/documents` — the "Insurance
   certificate" and "Qualification certificate" cards show "On file ·
   Verified {month year}" with a verified seal. The "Professional
   registration proof" card also shows "On file · Verified {month year}"
   for this demo trainer (who has `professionalRegistration` set).
2. Click "Replace" on the insurance certificate card, pick any local file —
   the card now shows "{filename} · Pending review" with no verified seal,
   and the buttons remain "Replace"/"Remove".
3. Click "Remove" on that same card — it reverts to "Not on file" with a
   single "Upload" button.
4. Click "Upload" on that card, pick a file — it shows "{filename} ·
   Pending review" again.
5. Reload `/trainer/documents` — all three cards revert to their original
   seed state from step 1 (expected, no persistence, matches
   Availability/Courses/Profile convention).
6. Confirm the public profile (`/trainer/dr-amara-okafor`) is unaffected —
   `VerificationPanel` still shows the same original verification dates
   (expected, read-only shared source data, not a copy).
7. `npx tsc --noEmit` and `npx eslint src` both clean.
