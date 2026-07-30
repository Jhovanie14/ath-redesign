# Student profile photo — design

## Context

Students currently have no way to add a photo — `Session` (`src/lib/auth.ts`)
and `StudentAccount` (`src/lib/students.ts`) have no avatar field, and
`InitialsAvatar` (`src/components/dashboard/initials-avatar.tsx`) always falls
back to initials for a student.

The trainer role already has a photo-upload UI
(`src/components/dashboard/profile/photo-upload-slot.tsx`,
`profile-media-section.tsx`), but it's entirely fake: the selected file
becomes a `URL.createObjectURL()` blob held in `ProfileForm`'s React state
(`src/components/dashboard/profile/profile-form.tsx`), never sent anywhere,
and gone on reload. It isn't even wired into the trainer's own dashboard
topbar avatar — that's hardcoded to a static file
(`src/components/dashboard/dashboard-shell.tsx`).

There is no image-persistence layer anywhere in this app.
`src/lib/media.ts`'s `resolveImage()` only reads static files from `/public`
by naming convention; nothing ever writes an uploaded file anywhere.

## Goal

A student can pick, preview, and remove a profile photo from their Profile
page, using the same upload interaction the trainer role already has. This
explicitly matches the trainer's existing fake pattern rather than building
real persistence: the photo lives in page-local component state for the
current page view only.

## Scope boundary

**In scope:**
- `src/components/dashboard/student/student-profile-form.tsx` — add a
  "Profile photo" card above the existing "Your details" card, using the
  existing `PhotoUploadSlot` component (`shape="circle"` only, no banner).

**Out of scope:**
- Any real persistence — no new field on `Session`/`StudentAccount`, no
  server action, no write path in `src/lib/students.ts`, no in-memory store.
- Seeding an initial photo from anywhere (there is nothing to seed from).
- Reflecting the photo anywhere else in the app — site header avatar
  (`src/components/site-header-client.tsx`), dashboard topbar
  (`src/components/dashboard/dashboard-shell.tsx`), `InitialsAvatar` call
  sites elsewhere. All continue to show initials for a student, exactly as
  today.
- Any change to the trainer's own profile-photo feature.
- Any change to the student Profile page's existing real name/email/password
  save flow (`updateStudentProfileAction`).

## Design

**Component reuse:** `PhotoUploadSlot` (drag/drop, JPG/PNG/WEBP, ≤5MB
validation, already built and used by the trainer role) is reused as-is —
no changes to that component. A student gets exactly one instance,
`shape="circle"`, no `shape="banner"` slot — students have no public profile
page for a cover banner to appear on, unlike
`ProfileMediaSection`'s two-slot trainer layout.

**Placement:** In `StudentProfileForm`, add a small `Card` titled
"Profile photo" immediately above the existing "Your details" `Card`,
containing a single `PhotoUploadSlot` at a similar size to the trainer's
headshot slot (`h-24 w-24`, i.e. the same 96×96 circle).

**State:** A local `useState<string | undefined>` in `StudentProfileForm`,
initialized to `undefined` (rendering `PhotoUploadSlot`'s built-in
camera-icon placeholder — there is nothing to seed it from). `onFileSelect`
calls `URL.createObjectURL(file)`; `onRemove` clears it. Both reuse the same
`replaceObjectUrl(prev, next)` blob-cleanup helper already defined in the
trainer's `profile-form.tsx` (revokes the previous blob URL before swapping
in a new one, so repeated changes in one session don't leak object URLs) —
copied into `student-profile-form.tsx` rather than imported, since importing
a helper from the trainer's profile directory would be an odd cross-role
dependency for four lines of code.

**Independent of the real save flow:** the photo slot has no "Save" step of
its own and is not wired into the form's `action={formAction}` submission —
`updateStudentProfileAction` gains no new field, and `StudentAccount` gains
no new property. Choosing or removing a photo takes effect immediately in
the slot's own preview (inherent to `PhotoUploadSlot`'s dialog/"Done"
button). This is a deliberate scope choice, not an oversight: it matches the
trainer's existing fake pattern and avoids attaching fake photo state to an
otherwise-real, persisted form.

## Error handling / edge cases

- Invalid file type or a file over 5MB — already handled entirely inside
  `PhotoUploadSlot` (client-side validation, inline error message); no new
  handling needed.
- Navigating away from the Profile page and back, or reloading — the photo
  reverts to no-photo (blank placeholder), since the state lives in this one
  client component and nothing seeds or persists it. This matches the
  design's explicit scope choice, not a bug.

## Testing

No automated test suite covers this (mock-data app, per existing
convention). Manual walkthrough: log in as the demo student, visit
`/student/profile`, confirm a "Profile photo" card renders above "Your
details" with an empty circular slot; click it, upload a JPG/PNG/WEBP under
5MB, confirm it previews in the slot; try an invalid file type and an
oversized file, confirm the existing validation messages appear; remove the
photo, confirm it reverts to the placeholder; reload the page, confirm the
photo is gone (expected, not a bug); confirm the site header and dashboard
topbar still show the student's initials, unchanged.

## Known limitations

- **Not persisted.** The photo is lost on reload or on navigating away and
  back — there is no backend to persist it to, matching the trainer's
  existing equivalent feature exactly.
- **Not reflected elsewhere.** The site header avatar and dashboard topbar
  continue to show initials for a student even while a photo is selected on
  the Profile page, since nothing outside `StudentProfileForm` knows about
  the local blob URL.
