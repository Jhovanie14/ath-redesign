# Trainer Availability Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer edit their `availabilityNote` (already-existing public-profile string) from a new `/trainer/availability` dashboard page, enabling the currently-disabled nav entry.

**Architecture:** One new client component (`AvailabilityForm`) holding local `useState`, one new server page following the exact auth-guard/fetch/notFound pattern already used by `src/app/trainer/courses/page.tsx`, plus a one-line nav-config change. No data model change — `Trainer.availabilityNote: string` already exists.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, and manual browser walkthrough, matching the precedent set by the Courses and Enquiries features.

## Global Constraints

- No backend — the save is local `useState`, seeded once from the server-fetched `initialNote` prop, never written back. Reloading the page reverts to the real seed data. This is deliberate, matching every other trainer-dashboard mutation in this app.
- Reuse existing `Input`/`Button` components from `src/components/ui/` — no new form/schema library.
- Error text: exactly `className="mt-1.5 text-micro text-error"` (matches `course-form-dialog.tsx`).
- Success/"Saved" text: exactly `className="text-micro text-success"` (matches the success-tone class used in `enquiry-dialog.tsx:78` / `contact-form.tsx:49`).
- Label styling: `className="eyebrow mb-2 block"` on a `<label>` with matching `htmlFor`/`id` (matches every field in `course-form-dialog.tsx`).
- Save button disabled ONLY when `note.trim() === savedNote.trim()` — never disabled purely for being empty (clicking Save on an empty field is how the inline error is triggered).
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`, `notFound()` if null (exact pattern in `src/app/trainer/courses/page.tsx:19-20`).

---

### Task 1: `AvailabilityForm` client component

**Files:**
- Create: `src/components/dashboard/availability/availability-form.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task).
- Produces: `export function AvailabilityForm({ initialNote }: { initialNote: string })` — a self-contained client component with no other props. Task 2 imports this exact named export from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AvailabilityForm({ initialNote }: { initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNote(e.target.value);
    setError(null);
    setJustSaved(false);
  }

  function save() {
    if (!note.trim()) {
      setError("Add a note before saving");
      return;
    }
    setError(null);
    setSavedNote(note);
    setJustSaved(true);
  }

  const unchanged = note.trim() === savedNote.trim();

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">
          Availability
        </h1>
        <p className="mt-1.5 text-body text-ink-soft">
          This note appears on your public profile next to your booking
          details.
        </p>
      </div>

      <div className="mt-8 max-w-md rounded-card border border-linen bg-paper p-6">
        <label htmlFor="availability-note" className="eyebrow mb-2 block">
          Availability note
        </label>
        <Input
          id="availability-note"
          value={note}
          onChange={onChange}
          placeholder="Next cohort: March 2026"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="mt-1.5 text-micro text-error">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
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

Run: `npx eslint src/components/dashboard/availability/availability-form.tsx`
Expected: clean (no warnings/errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/availability/availability-form.tsx
git commit -m "feat: add trainer AvailabilityForm component"
```

---

### Task 2: Trainer Availability page + nav integration

**Files:**
- Create: `src/app/trainer/availability/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts:29`

**Interfaces:**
- Consumes: `AvailabilityForm` from `@/components/dashboard/availability/availability-form` (Task 1) — exact prop `initialNote: string`.
- Produces: nothing further downstream (last code task).

- [ ] **Step 1: Write the server page**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AvailabilityForm } from "@/components/dashboard/availability/availability-form";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Availability",
};

export default async function TrainerAvailabilityPage() {
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
      <AvailabilityForm initialNote={trainer.availabilityNote} />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Enable the nav entry**

In `src/components/dashboard/nav-config.ts`, change line 29 from:

```ts
  { label: "Availability", href: "/trainer/availability", icon: Calendar, disabled: true },
```

to:

```ts
  { label: "Availability", href: "/trainer/availability", icon: Calendar },
```

Do not change any other `TRAINER_NAV` entry — Reviews, Profile, Documents, and Billing all keep `disabled: true`.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/trainer/availability/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/availability/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer availability page, enable nav entry"
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
`/trainer/availability` from the sidebar nav (the Availability entry should
now be a clickable link, not a disabled "Soon" item).

Expected: the input shows the real `dr-amara-okafor` availability note from
`src/data/trainers.json`. Save button is disabled (nothing changed yet).

- [ ] **Step 3: Trigger the empty-field error**

Clear the input entirely, click Save.

Expected: inline error "Add a note before saving" appears in
`text-error`. No "Saved" confirmation appears. The Save button remains
clickable (not disabled) throughout this step.

- [ ] **Step 4: Save a new note**

Type a new note (e.g. "Next cohort: September 2026"), click Save.

Expected: "Saved" confirmation appears in `text-success` next to the Save
button. Save button becomes disabled again (value now matches the just-saved
value).

- [ ] **Step 5: Confirm the confirmation clears on edit**

Edit the input again (append any character).

Expected: the "Saved" confirmation disappears immediately, Save button
re-enables.

- [ ] **Step 6: Confirm no persistence**

Reload `/trainer/availability`.

Expected: the input reverts to the original seed note from
`trainers.json` — the in-session edit is gone (expected, matches the
Courses/Enquiries local-only convention).

- [ ] **Step 7: Confirm the public profile is unaffected**

Navigate to `/trainer/dr-amara-okafor`.

Expected: the hero section still shows the original seed
`availabilityNote`, unaffected by the in-session dashboard edit (expected).

- [ ] **Step 8: Final full-project check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

Run: `npx eslint src`
Expected: exit code 0, no errors/warnings introduced by this feature (any
pre-existing unrelated warnings in the codebase are out of scope).
