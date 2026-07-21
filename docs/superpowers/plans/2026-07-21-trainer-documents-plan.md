# Trainer Documents Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a trainer view and manage three fixed compliance document slots (insurance certificate, qualification certificate, professional registration proof) from a new `/trainer/documents` dashboard page, enabling the currently-disabled nav entry.

**Architecture:** One new client component (`DocumentsList`) holding local per-slot `useState`, seeded once from server-computed slot state derived from `trainer.verification`, following the established no-persistence pattern. One new server page following the exact auth-guard/fetch/`notFound()` pattern already used by `src/app/trainer/courses/page.tsx`, plus a one-line nav-config change. No data model change — `Trainer.verification` already exists.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, and manual browser walkthrough, matching the precedent set by Courses/Availability/Reviews/Profile.

## Global Constraints

- No backend — file selection updates local `useState` only, seeded once from server-computed props derived from `trainer.verification`, never written back. Reloading the page reverts to the seed state. Deliberate, matching every other trainer-dashboard mutation in this app.
- No new upload/file library — a plain hidden `<input type="file">` per slot, triggered via ref + `.click()` from a `Button`.
- Card container: exactly `className="rounded-card border border-linen bg-paper p-6"`, one per document slot (three cards, not one shared card).
- Status/note text: exactly `className="text-micro text-stone"`.
- Button variants: `variant="outline" size="sm"` for Upload/Replace, `variant="ghost" size="sm"` for Remove.
- `VerifiedSeal` (from `@/components/verified-seal`) at `size={16}` next to `"on_file"` status lines only — never shown for `"not_uploaded"` or `"pending_review"`.
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in `src/app/trainer/courses/page.tsx:14-17`).
- Demo trainer hardcode: `getRepository().getBySlug("dr-amara-okafor")`, `notFound()` if null (exact pattern in `src/app/trainer/courses/page.tsx:19-20`).
- Selecting a file in the input immediately updates that slot's state to `"pending_review"` with the picked file's `name` and no `verifiedNote` (a fresh upload isn't re-verified, so it must not keep showing a stale "Verified" date). Clicking "Remove" immediately sets the slot back to `"not_uploaded"` with no `fileName`/`verifiedNote`. Neither action has a separate Save step — the picker/remove action is itself the confirmation.

---

### Task 1: `DocumentsList` client component

**Files:**
- Create: `src/components/dashboard/documents/documents-list.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task).
- Produces: `export type DocSlot = { id: "insurance" | "qualification" | "registration"; label: string; status: "not_uploaded" | "on_file"; verifiedNote?: string }` and `export function DocumentsList({ slots }: { slots: DocSlot[] })`. Task 2 imports both this exact named type and named function from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { VerifiedSeal } from "@/components/verified-seal";

export type DocSlot = {
  id: "insurance" | "qualification" | "registration";
  label: string;
  status: "not_uploaded" | "on_file";
  verifiedNote?: string;
};

type SlotState = {
  status: "not_uploaded" | "on_file" | "pending_review";
  fileName?: string;
  verifiedNote?: string;
};

export function DocumentsList({ slots }: { slots: DocSlot[] }) {
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(
    () =>
      Object.fromEntries(
        slots.map((slot) => [
          slot.id,
          { status: slot.status, verifiedNote: slot.verifiedNote },
        ]),
      ),
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function triggerUpload(id: DocSlot["id"]) {
    fileInputRefs.current[id]?.click();
  }

  function handleFileChange(
    id: DocSlot["id"],
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlotStates((prev) => ({
      ...prev,
      [id]: {
        status: "pending_review",
        fileName: file.name,
        verifiedNote: undefined,
      },
    }));
    e.target.value = "";
  }

  function handleRemove(id: DocSlot["id"]) {
    setSlotStates((prev) => ({
      ...prev,
      [id]: { status: "not_uploaded", fileName: undefined, verifiedNote: undefined },
    }));
  }

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Documents</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          Keep your compliance documents up to date. Listings pause
          automatically if cover lapses.
        </p>
      </div>

      <div className="mt-8 flex max-w-md flex-col gap-4">
        {slots.map((slot) => {
          const state = slotStates[slot.id];
          return (
            <div
              key={slot.id}
              className="rounded-card border border-linen bg-paper p-6"
            >
              <p className="eyebrow">{slot.label}</p>

              <div className="mt-3 flex items-center gap-2">
                {state.status === "on_file" && <VerifiedSeal size={16} />}
                <span className="text-micro text-stone">
                  {state.status === "not_uploaded" && "Not on file"}
                  {state.status === "on_file" &&
                    `On file · ${state.verifiedNote}`}
                  {state.status === "pending_review" &&
                    `${state.fileName} · Pending review`}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {state.status === "not_uploaded" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerUpload(slot.id)}
                  >
                    Upload
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerUpload(slot.id)}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(slot.id)}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>

              <input
                ref={(el) => {
                  fileInputRefs.current[slot.id] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileChange(slot.id, e)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/documents/documents-list.tsx`
Expected: clean (no warnings/errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/documents/documents-list.tsx
git commit -m "feat: add trainer DocumentsList component"
```

---

### Task 2: Trainer Documents page + nav integration

**Files:**
- Create: `src/app/trainer/documents/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts:32`

**Interfaces:**
- Consumes: `DocumentsList` and `DocSlot` from `@/components/dashboard/documents/documents-list` (Task 1) — exact prop `{ slots: DocSlot[] }`.
- Produces: nothing further downstream (last code task).

- [ ] **Step 1: Write the server page**

```tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { formatMonthYear } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DocumentsList,
  type DocSlot,
} from "@/components/dashboard/documents/documents-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function TrainerDocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  const v = trainer.verification;
  const slots: DocSlot[] = [
    {
      id: "insurance",
      label: "Insurance certificate",
      status: "on_file",
      verifiedNote: `Verified ${formatMonthYear(v.insuranceCheckedAt)}`,
    },
    {
      id: "qualification",
      label: "Qualification certificate",
      status: "on_file",
      verifiedNote: `Verified ${formatMonthYear(v.qualificationCheckedAt)}`,
    },
    {
      id: "registration",
      label: "Professional registration proof",
      status: v.professionalRegistration ? "on_file" : "not_uploaded",
      verifiedNote: v.professionalRegistration
        ? `Verified ${formatMonthYear(v.qualificationCheckedAt)}`
        : undefined,
    },
  ];

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <DocumentsList slots={slots} />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Enable the nav entry**

In `src/components/dashboard/nav-config.ts`, change line 32 from:

```ts
  { label: "Documents", href: "/trainer/documents", icon: FileText, disabled: true },
```

to:

```ts
  { label: "Documents", href: "/trainer/documents", icon: FileText },
```

Do not change any other `TRAINER_NAV` entry — Billing keeps `disabled: true`.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/trainer/documents/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/documents/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer documents page, enable nav entry"
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
`/trainer/documents` from the sidebar nav (the Documents entry should now be
a clickable link, not a disabled "Soon" item).

Expected: all three cards ("Insurance certificate", "Qualification
certificate", "Professional registration proof") show "On file · Verified
{month year}" with a gold verified seal next to the status text (this demo
trainer has `professionalRegistration` set, so all three seed as on-file).

- [ ] **Step 3: Replace a document**

Click "Replace" on the "Insurance certificate" card, and pick any local
file from the OS file picker.

Expected: the card now shows "{the picked file's name} · Pending review"
with no verified seal. The buttons remain "Replace" and "Remove".

- [ ] **Step 4: Remove a document**

Click "Remove" on the same card.

Expected: the card reverts to "Not on file" with a single "Upload" button
(no "Replace"/"Remove").

- [ ] **Step 5: Upload into an empty slot**

Click "Upload" on that same now-empty card, and pick a local file.

Expected: the card shows "{the picked file's name} · Pending review" again,
with "Replace"/"Remove" buttons.

- [ ] **Step 6: Confirm no persistence**

Reload `/trainer/documents`.

Expected: all three cards revert to their original seed state from Step 2
— the in-session upload/remove actions are gone (expected, matches the
Availability/Courses/Profile local-only convention).

- [ ] **Step 7: Confirm the public profile is unaffected**

Navigate to `/trainer/dr-amara-okafor`.

Expected: the Verification Passport section still shows the same original
verification dates, unaffected by the in-session dashboard edits (expected,
read-only shared source data, not a copy).

- [ ] **Step 8: Final full-project check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

Run: `npx eslint src`
Expected: exit code 0, no errors/warnings introduced by this feature (any
pre-existing unrelated warnings in the codebase are out of scope).
