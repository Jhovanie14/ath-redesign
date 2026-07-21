# Trainer Profile Page — Design Spec

## Goal

Let a trainer edit their public-facing `headline`, `city`, and `bio` from
the dashboard, at `/trainer/profile` (nav entry already reserved but
disabled).

## Context

`Trainer.headline`, `Trainer.city`, and `Trainer.bio`
(`src/lib/types.ts:47-66`) already exist and are already displayed today,
read-only, on the public profile: `headline` and `city` in `ProfileHero`
(`src/components/trainer/profile-hero.tsx:72-77`), `bio` in the "About"
section of `src/app/trainer/[slug]/page.tsx:72-74`.

This page is scoped to text fields only. `Trainer.yearsExperience`,
`Trainer.studentsTrained`, and `Trainer.fromPriceGBP` (numeric stats shown
in the profile hero's stat row) and `Trainer.categories` (course category
tags) are explicitly out of scope — they read as verified/trust signals
elsewhere in the UI (stats row, search filters), not self-reported bio
content, and stay read-only for now.

There is no photo/upload capability on this page. `Trainer` has no photo
field at all — headshots are resolved via a file-path convention
(`resolveImage(\`trainers/headshots/${trainer.slug}\`)`), which would
require a file-storage feature, not a form field. Out of scope.

The trainer dashboard has no per-trainer session identity (same convention
as Enquiries/Courses/Availability/Reviews) — this page hardcodes the one
demo trainer via `getRepository().getBySlug("dr-amara-okafor")`, matching
every other trainer-dashboard page.

## Data Model Change

None. `Trainer.headline`, `Trainer.city`, `Trainer.bio` are unchanged.

## Nav Integration

`src/components/dashboard/nav-config.ts` — remove `disabled: true` from the
`TRAINER_NAV` Profile entry only. No other entry changes (Documents and
Billing keep `disabled: true`).

## Trainer Profile Page

### `src/app/trainer/profile/page.tsx` (new, server component)

- Auth guard: redirect to `/trainer/login` if no session or
  `role !== "trainer"` (same pattern as `src/app/trainer/courses/page.tsx`).
- `const trainer = await getRepository().getBySlug("dr-amara-okafor");` — if
  null, `notFound()`.
- Renders `<ProfileForm initialHeadline={trainer.headline} initialCity={trainer.city} initialBio={trainer.bio} />`
  inside `DashboardShell`. No page-level heading — the heading lives inside
  the component, matching `AvailabilityForm`/`CoursesList`/
  `TrainerReviewsList`'s existing pattern.

### `src/components/dashboard/profile/profile-form.tsx` (new, client component)

Props: `{ initialHeadline: string; initialCity: string; initialBio: string }`.

Local state, seeded once from props, never persisted (reload reverts to the
real seed data — deliberate, matching every other trainer-dashboard
mutation in this app, e.g. `AvailabilityForm`):

```tsx
"use client";
const [headline, setHeadline] = useState(initialHeadline);
const [city, setCity] = useState(initialCity);
const [bio, setBio] = useState(initialBio);
const [savedHeadline, setSavedHeadline] = useState(initialHeadline);
const [savedCity, setSavedCity] = useState(initialCity);
const [savedBio, setSavedBio] = useState(initialBio);
const [errors, setErrors] = useState<Record<string, string>>({});
const [justSaved, setJustSaved] = useState(false);
```

- Page heading ("Profile") + short explanatory copy: "This information
  appears on your public profile."
- Three fields stacked in one card, each with an `eyebrow mb-2 block` label
  with matching `htmlFor`/`id` (matches every field in
  `course-form-dialog.tsx`):
  - **Headline** — `Input`, placeholder "Aesthetic Medical Practitioner &
    Trainer".
  - **City** — `Input`, placeholder "London".
  - **Bio** — `Textarea` (`rows={4}`), placeholder "Tell students about
    your background and approach."
- Any edit to a field clears that field's error (if any) and clears
  `justSaved`, same as `AvailabilityForm`'s `onChange` pattern.
- Save validates all three fields are non-empty (trimmed). Empty fields
  each get their own message in the `Record<string,string>` errors object,
  same pattern and error styling as `course-form-dialog.tsx`:
  - `headline: "Add a headline."`
  - `city: "Add a city."`
  - `bio: "Add a bio."`
  Each rendered as `<p className="mt-1.5 text-micro text-error">` directly
  under its field, matching `course-form-dialog.tsx:146-148` exactly.
- If all three are valid: clear errors, set all three `saved*` values to
  the current field values, set `justSaved` true.
- Save button disabled only when all three trimmed current values equal
  their `saved*` counterparts (nothing changed) — never disabled purely
  for emptiness, same rule as `AvailabilityForm` (clicking Save on an
  empty field is how the inline error is triggered).
- "Saved" confirmation: `<span className="text-micro text-success">Saved</span>`
  next to the Save button, same as `AvailabilityForm`. Disappears
  immediately on any further edit to any of the three fields.

No dialog. No mutation beyond local state. This is the entire component.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (confirmed real stack, not
  the training-data defaults).
- No backend — the save is local `useState`, seeded once from the
  server-fetched initial props, never written back. Reloading the page
  reverts to the real seed data. Deliberate, matching every other
  trainer-dashboard mutation in this app.
- Reuse existing `Input`/`Textarea`/`Button` components from
  `src/components/ui/` — no new form/schema library.
- Error text: exactly `className="mt-1.5 text-micro text-error"` (matches
  `course-form-dialog.tsx:147`).
- Success/"Saved" text: exactly `className="text-micro text-success"`
  (matches `AvailabilityForm`'s success-tone class, itself matching
  `enquiry-dialog.tsx:78` / `contact-form.tsx:49`).
- Label styling: `className="eyebrow mb-2 block"` on a `<label>` with
  matching `htmlFor`/`id` (matches every field in `course-form-dialog.tsx`).
- Card container: `className="rounded-card border border-linen bg-paper p-6"`,
  same box used by `AvailabilityForm` and `review-list.tsx`.
- Save button disabled ONLY when all three current values (trimmed) equal
  their saved counterparts — never disabled purely for being empty.
- Auth guard pattern: redirect to `/trainer/login` if
  `!session || session.role !== "trainer"` (exact pattern in
  `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`,
  `notFound()` if null (exact pattern in
  `src/app/trainer/courses/page.tsx:19-20`).

## Manual Verification

1. Log in as trainer, open `/trainer/profile` — the three fields show the
   real `dr-amara-okafor` headline, city, and bio from `trainers.json`.
   Save button is disabled (nothing changed yet).
2. Clear the headline field only, click Save — inline error "Add a
   headline." appears under the headline field in `text-error`. City and
   bio show no errors. No "Saved" confirmation appears. Save button
   remains clickable (not disabled) throughout this step.
3. Restore the headline, clear the bio field, click Save — inline error
   "Add a bio." appears under the bio field. Headline and city show no
   errors.
4. Restore the bio, edit all three fields to new values, click Save —
   "Saved" confirmation appears in `text-success` next to the Save button.
   Save button becomes disabled again (values now match the just-saved
   values).
5. Edit any one field again (append any character) — the "Saved"
   confirmation disappears immediately, Save button re-enables.
6. Reload `/trainer/profile` — all three fields revert to the original
   seed values from `trainers.json` (expected, matches the
   Availability/Courses local-only convention).
7. Confirm the public profile (`/trainer/dr-amara-okafor`) is unaffected —
   still shows the original seed headline, city, and bio (expected,
   read-only shared source data, not a copy).
8. `npx tsc --noEmit` and `npx eslint src` both clean.
