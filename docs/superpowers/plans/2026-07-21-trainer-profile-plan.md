# Trainer Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer edit their public-facing `headline`, `city`, and `bio` from a new `/trainer/profile` dashboard page, enabling the currently-disabled nav entry.

**Architecture:** One new client component (`ProfileForm`) holding local `useState` for all three fields, seeded once from server-fetched initial values, following `AvailabilityForm`'s no-persistence pattern. One new server page following the exact auth-guard/fetch/`notFound()` pattern already used by `src/app/trainer/courses/page.tsx`, plus a one-line nav-config change. No data model change — `Trainer.headline`, `Trainer.city`, `Trainer.bio` already exist.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, and manual browser walkthrough, matching the precedent set by Courses/Availability/Reviews.

## Global Constraints

- No backend — the save is local `useState`, seeded once from the server-fetched initial props, never written back. Reloading the page reverts to the real seed data. Deliberate, matching every other trainer-dashboard mutation in this app.
- Reuse existing `Input`/`Textarea`/`Button` components from `src/components/ui/` — no new form/schema library.
- Error text: exactly `className="mt-1.5 text-micro text-error"` (matches `course-form-dialog.tsx:147`).
- Success/"Saved" text: exactly `className="text-micro text-success"` (matches `AvailabilityForm`'s success-tone class).
- Label styling: `className="eyebrow mb-2 block"` on a `<label>` with matching `htmlFor`/`id` (matches every field in `course-form-dialog.tsx`).
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"`.
- Save button disabled ONLY when all three current values (trimmed) equal their saved counterparts — never disabled purely for being empty.
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`, `notFound()` if null (exact pattern in `src/app/trainer/courses/page.tsx:19-20`).

---

### Task 1: `ProfileForm` client component

**Files:**
- Create: `src/components/dashboard/profile/profile-form.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task).
- Produces: `export function ProfileForm({ initialHeadline, initialCity, initialBio }: { initialHeadline: string; initialCity: string; initialBio: string })` — a self-contained client component with no other props. Task 2 imports this exact named export from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  initialHeadline,
  initialCity,
  initialBio,
}: {
  initialHeadline: string;
  initialCity: string;
  initialBio: string;
}) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [city, setCity] = useState(initialCity);
  const [bio, setBio] = useState(initialBio);
  const [savedHeadline, setSavedHeadline] = useState(initialHeadline);
  const [savedCity, setSavedCity] = useState(initialCity);
  const [savedBio, setSavedBio] = useState(initialBio);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);

  function onHeadlineChange(e: React.ChangeEvent<HTMLInputElement>) {
    setHeadline(e.target.value);
    setErrors((prev) => ({ ...prev, headline: "" }));
    setJustSaved(false);
  }

  function onCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCity(e.target.value);
    setErrors((prev) => ({ ...prev, city: "" }));
    setJustSaved(false);
  }

  function onBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBio(e.target.value);
    setErrors((prev) => ({ ...prev, bio: "" }));
    setJustSaved(false);
  }

  function save() {
    const next: Record<string, string> = {};
    if (!headline.trim()) next.headline = "Add a headline.";
    if (!city.trim()) next.city = "Add a city.";
    if (!bio.trim()) next.bio = "Add a bio.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavedHeadline(headline);
    setSavedCity(city);
    setSavedBio(bio);
    setJustSaved(true);
  }

  const unchanged =
    headline.trim() === savedHeadline.trim() &&
    city.trim() === savedCity.trim() &&
    bio.trim() === savedBio.trim();

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Profile</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          This information appears on your public profile.
        </p>
      </div>

      <div className="mt-8 flex max-w-md flex-col gap-4 rounded-card border border-linen bg-paper p-6">
        <div>
          <label htmlFor="profile-headline" className="eyebrow mb-2 block">
            Headline
          </label>
          <Input
            id="profile-headline"
            value={headline}
            onChange={onHeadlineChange}
            placeholder="Aesthetic Medical Practitioner & Trainer"
            aria-invalid={Boolean(errors.headline)}
          />
          {errors.headline && (
            <p className="mt-1.5 text-micro text-error">{errors.headline}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-city" className="eyebrow mb-2 block">
            City
          </label>
          <Input
            id="profile-city"
            value={city}
            onChange={onCityChange}
            placeholder="London"
            aria-invalid={Boolean(errors.city)}
          />
          {errors.city && (
            <p className="mt-1.5 text-micro text-error">{errors.city}</p>
          )}
        </div>

        <div>
          <label htmlFor="profile-bio" className="eyebrow mb-2 block">
            Bio
          </label>
          <Textarea
            id="profile-bio"
            rows={4}
            value={bio}
            onChange={onBioChange}
            placeholder="Tell students about your background and approach."
            aria-invalid={Boolean(errors.bio)}
          />
          {errors.bio && (
            <p className="mt-1.5 text-micro text-error">{errors.bio}</p>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3">
          <Button onClick={save} disabled={unchanged}>
            Save
          </Button>
          {justSaved && <span className="text-micro text-success">Saved</span>}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/profile/profile-form.tsx`
Expected: clean (no warnings/errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/profile/profile-form.tsx
git commit -m "feat: add trainer ProfileForm component"
```

---

### Task 2: Trainer Profile page + nav integration

**Files:**
- Create: `src/app/trainer/profile/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts:31`

**Interfaces:**
- Consumes: `ProfileForm` from `@/components/dashboard/profile/profile-form` (Task 1) — exact props `{ initialHeadline: string; initialCity: string; initialBio: string }`.
- Produces: nothing further downstream (last code task).

- [ ] **Step 1: Write the server page**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ProfileForm } from "@/components/dashboard/profile/profile-form";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function TrainerProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <ProfileForm
        initialHeadline={trainer.headline}
        initialCity={trainer.city}
        initialBio={trainer.bio}
      />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Enable the nav entry**

In `src/components/dashboard/nav-config.ts`, change line 31 from:

```ts
  { label: "Profile", href: "/trainer/profile", icon: User, disabled: true },
```

to:

```ts
  { label: "Profile", href: "/trainer/profile", icon: User },
```

Do not change any other `TRAINER_NAV` entry — Documents and Billing keep `disabled: true`.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/trainer/profile/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/profile/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer profile page, enable nav entry"
```

---

### Task 3: Manual verification

**Files:** none (verification only, no code changes).

**Interfaces:** none — this task exercises the running app built by Tasks 1-2.

- [ ] **Step 1: Start the dev server**

Run: `npm run dev` (background)
Expected: `✓ Ready` on `localhost:3000` (or the next available port if 3000 is in use).

- [ ] **Step 2: Log in and open the page**

Navigate to `/trainer/login`, sign in as the demo trainer, then open
`/trainer/profile` from the sidebar nav (the Profile entry should now be a
clickable link, not a disabled "Soon" item).

Expected: the three fields show the real `dr-amara-okafor` values from
`src/data/trainers.json` — headline "Cosmetic Doctor & Advanced
Injectables Trainer", city "London", and the seed bio. Save button is
disabled (nothing changed yet).

- [ ] **Step 3: Trigger a single-field empty error**

Clear the headline field only, click Save.

Expected: inline error "Add a headline." appears under the headline field
in `text-error`. City and bio show no errors. No "Saved" confirmation
appears. The Save button remains clickable (not disabled) throughout this
step.

- [ ] **Step 4: Trigger the bio empty error**

Restore the headline text, clear the bio field, click Save.

Expected: inline error "Add a bio." appears under the bio field. Headline
and city show no errors.

- [ ] **Step 5: Save valid changes**

Restore the bio text, then edit all three fields to new values (e.g.
headline "Aesthetic Nurse Prescriber & Trainer", city "Manchester", bio
"Updated bio text for verification."), click Save.

Expected: "Saved" confirmation appears in `text-success` next to the Save
button. Save button becomes disabled again (values now match the
just-saved values).

- [ ] **Step 6: Confirm the confirmation clears on edit**

Edit any one field again (append any character).

Expected: the "Saved" confirmation disappears immediately, Save button
re-enables.

- [ ] **Step 7: Confirm no persistence**

Reload `/trainer/profile`.

Expected: all three fields revert to the original seed values from
`trainers.json` — the in-session edits are gone (expected, matches the
Availability/Courses local-only convention).

- [ ] **Step 8: Confirm the public profile is unaffected**

Navigate to `/trainer/dr-amara-okafor`.

Expected: the hero section and About section still show the original seed
`headline`, `city`, and `bio`, unaffected by the in-session dashboard edits
(expected).

- [ ] **Step 9: Final full-project check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

Run: `npx eslint src`
Expected: exit code 0, no errors/warnings introduced by this feature (any
pre-existing unrelated warnings in the codebase are out of scope).
