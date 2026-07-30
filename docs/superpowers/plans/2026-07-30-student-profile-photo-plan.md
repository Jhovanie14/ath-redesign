# Student Profile Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a student pick, preview, and remove a profile photo on their Profile page, reusing the trainer role's existing (fake, page-local, non-persisted) photo-upload component — no new backend, no new session/account field.

**Architecture:** `src/components/dashboard/student/student-profile-form.tsx` gains a new "Profile photo" `Card` above its existing "Your details" `Card`, rendering one `PhotoUploadSlot` (`shape="circle"`, already built for the trainer role at `src/components/dashboard/profile/photo-upload-slot.tsx`, unmodified). The selected photo lives in a local `useState<string | undefined>` holding a `URL.createObjectURL()` blob URL — entirely independent of the form's existing real, server-persisted name/email/password save flow.

**Tech Stack:** Next.js 16 (App Router, Client Components), React 19, TypeScript, existing shadcn/ui primitives (`Card`).

## Global Constraints

- No database and no test runner exist in this repo — every "test" step in this plan is `npx tsc --noEmit`, `npm run lint`, and a concrete manual dev-server check, matching every prior plan in `docs/superpowers/plans/`.
- No changes to `PhotoUploadSlot` (`src/components/dashboard/profile/photo-upload-slot.tsx`) — reused exactly as-is.
- No new field on `Session` (`src/lib/auth.ts`) or `StudentAccount` (`src/lib/students.ts`), no server action, no persistence of any kind — the photo is page-local state only, matching the trainer role's existing equivalent feature.
- The student Profile page's existing real name/email/password save flow (`updateStudentProfileAction`) is untouched — the photo slot is not wired into that form submission.
- The site header avatar, dashboard topbar, and every other `InitialsAvatar` call site continue to show initials for a student, unchanged.

---

## File Structure

**Modified files only — no new files:**

| File | Change |
|---|---|
| `src/components/dashboard/student/student-profile-form.tsx` | Add a "Profile photo" `Card` with one `PhotoUploadSlot`, above the existing "Your details" `Card` |

---

### Task 1: Add a profile photo slot to the student Profile page

**Files:**
- Modify: `src/components/dashboard/student/student-profile-form.tsx`

**Interfaces:**
- Consumes: `PhotoUploadSlot` from `src/components/dashboard/profile/photo-upload-slot.tsx` — props `{ previewUrl?: string; shape: "banner" | "circle"; ariaLabel: string; className?: string; onFileSelect: (file: File) => void; onRemove: () => void; }` (existing, unchanged)
- Produces: no new exports — `StudentProfileForm`'s existing `{ session: Session }` prop signature is unchanged

- [ ] **Step 1: Replace the full contents of `student-profile-form.tsx`**

```tsx
"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Session } from "@/lib/auth";
import { updateStudentProfileAction } from "@/app/student/profile/actions";
import { PhotoUploadSlot } from "@/components/dashboard/profile/photo-upload-slot";

/** Revoke the previous blob URL (if any) before swapping in a new one, so
 * repeated replace/remove clicks in one session don't leak object URLs.
 * Copied from src/components/dashboard/profile/profile-form.tsx rather than
 * imported — four lines don't justify a cross-role dependency. */
function replaceObjectUrl(
  prev: string | undefined,
  next: string | undefined,
) {
  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
  return next;
}

export function StudentProfileForm({ session }: { session: Session }) {
  const [state, formAction, pending] = useActionState(
    updateStudentProfileAction,
    {},
  );
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  function onPhotoFileSelect(file: File) {
    setPhotoUrl((prev) => replaceObjectUrl(prev, URL.createObjectURL(file)));
  }
  function onPhotoRemove() {
    setPhotoUrl((prev) => replaceObjectUrl(prev, undefined));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-0 rounded-2xl p-0">
        <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
          <h2 className="font-display text-title text-ink">Profile photo</h2>
          <p className="text-small text-ink-soft">
            Your photo updates instantly below — it isn&rsquo;t saved
            anywhere yet.
          </p>
        </CardHeader>
        <CardContent className="px-7 pt-6 pb-7">
          <PhotoUploadSlot
            shape="circle"
            className="h-24 w-24"
            previewUrl={photoUrl}
            ariaLabel="profile photo"
            onFileSelect={onPhotoFileSelect}
            onRemove={onPhotoRemove}
          />
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-2xl p-0">
        <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
          <h2 className="font-display text-title text-ink">Your details</h2>
          <p className="text-small text-ink-soft">
            Update the name, email, and password used to sign in.
          </p>
        </CardHeader>
        <CardContent className="px-7 pt-6 pb-7">
          <form action={formAction} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="profile-name" className="mb-2 block text-small font-medium text-ink-soft">
                Full name
              </label>
              <Input id="profile-name" name="name" defaultValue={session.name} required />
            </div>
            <div>
              <label htmlFor="profile-email" className="mb-2 block text-small font-medium text-ink-soft">
                Email
              </label>
              <Input id="profile-email" name="email" type="email" defaultValue={session.email} required />
            </div>
            <div>
              <label htmlFor="profile-password" className="mb-2 block text-small font-medium text-ink-soft">
                New password
              </label>
              <Input
                id="profile-password"
                name="password"
                type="password"
                placeholder="Leave blank to keep your current password"
                minLength={8}
              />
            </div>

            {state.error && (
              <p role="alert" className="text-micro text-error">
                {state.error}
              </p>
            )}

            <div className="flex items-center gap-3 border-t border-linen pt-6">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
              {state.success && !pending && (
                <span className="flex items-center gap-1.5 text-small font-medium text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verify types and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run lint`
Expected: no errors (only the same pre-existing, unrelated problems in `.claude/skills/*.cjs` and `src/components/dev/design-tweak-panel.tsx` that exist on this branch already).

- [ ] **Step 3: Manual check — upload, validation, remove, reload**

Run: `npm run dev` (skip if already running). Log in as `student@ath.demo` / `student123`, visit `http://localhost:3000/student/profile`.

Expected: a "Profile photo" card renders above "Your details", showing an empty circular slot with a camera icon.

Click the slot's edit (pencil) button, upload a JPG/PNG/WEBP image under 5MB.
Expected: the dialog's drop zone shows the image; click "Done"; the circular slot now shows that image.

Click the edit button again, try uploading a non-image file (e.g. a `.txt` renamed to have no valid extension, or any file whose type isn't `image/png`/`image/jpeg`/`image/webp`).
Expected: inline error "Use a JPG, PNG, or WEBP image." — no crash, existing photo unchanged.

Try uploading an image file over 5MB (if you don't have one handy, skip this specific check and note it in your report as unverified — the validation logic itself is pre-existing and untouched by this task).
Expected: inline error "That image is over 5MB — choose a smaller file."

Click the edit button, click "Remove photo", confirm the removal.
Expected: slot reverts to the empty camera-icon placeholder.

Upload a photo again, then reload the page (`F5` / full navigation, not client-side).
Expected: the slot is back to the empty placeholder — the photo does not persist across a reload. This is expected per the design (page-local state only), not a bug.

- [ ] **Step 4: Manual check — nothing else changed**

While still logged in as `student@ath.demo`, select a photo on `/student/profile`, then check:
- The site header (any public page, e.g. `http://localhost:3000/`) still shows your initials, not the selected photo.
- The dashboard topbar (visible on `/student`, `/student/messages`, etc.) still shows your initials.
- The "Your details" card's name/email/password fields and its own "Save changes" button still work exactly as before (e.g. change your name, save, confirm the "Saved" confirmation appears) — confirming the new photo card didn't interfere with the existing real save flow.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/student/student-profile-form.tsx
git commit -m "feat: let a student add or change a profile photo (preview-only, matches trainer's existing pattern)"
```

---
