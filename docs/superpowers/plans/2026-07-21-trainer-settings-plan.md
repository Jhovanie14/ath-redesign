# Trainer Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/trainer/settings` page covering Account (login email), Security (change password), and Notification preferences — the one area of the trainer dashboard no existing page owns.

**Architecture:** Three independent client card components (no shared state between them), one new shared `Switch` UI primitive, one new server page that assembles the three cards inside `DashboardShell`, plus a one-line nav-config addition. No data model change.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, `next build`, and manual browser walkthrough, matching the precedent set by every other trainer-dashboard feature this branch.

## Global Constraints

- No backend anywhere in this app. Every save on this page is local `useState`, never written back, resets on reload — same convention as Profile/Availability/Documents.
- The Security card's "current password" field is collected but **never verified against any real value** — there is no account-mutation API to check it against. Do not implement or simulate an "incorrect current password" error path.
- Reuse existing components only: `Card`/`CardHeader`/`CardContent` (`src/components/ui/card.tsx`), `Button` (`src/components/ui/button.tsx`), `Input` (`src/components/ui/input.tsx`), `Loader2`/`CheckCircle2`/`Eye`/`EyeOff` from `lucide-react`.
- New `Switch` component (`src/components/ui/switch.tsx`) uses the `radix-ui` package already in `package.json` (`import { Switch as SwitchPrimitive } from "radix-ui"`) — do **not** add `@radix-ui/react-switch` or any other new dependency.
- Card heading style: `<h2 className="font-sans text-[17px] font-semibold text-ink">` — NOT the default serif `CardTitle`, matching the "Public availability note" heading precedent on the Availability page (`font-sans` explicitly overrides the global `h1,h2,h3,h4{font-family:serif}` base rule).
- Save/loading/success pattern (Account + Security cards): a `saving` boolean drives a `Loader2` spinner + "Saving…" label via a 500ms `setTimeout` (comment: "No real backend here... a short simulated delay stands in for a network round trip"), then a `CheckCircle2` + "Saved" `text-success` confirmation, cleared on the next edit. Exact pattern already used in `src/components/dashboard/availability/availability-note-card.tsx`.
- Error text: `role="alert" className="mt-1.5 text-micro text-error"` (matches every other field error this session).
- Page content wrapper: `<div className="max-w-2xl">` — deliberately narrower than the `max-w-[1600px]` shell width every other redesigned page now relies on (see spec's "Layout Decision" section). Left-aligned, not centered.
- Auth guard pattern: redirect to `/trainer/login` if `!session || session.role !== "trainer"` (exact pattern in every other `src/app/trainer/*/page.tsx`).
- `publicProfileHref="/trainer/dr-amara-okafor"` passed to `DashboardShell` (exact pattern in every other trainer page).

---

### Task 1: `Switch` UI primitive

**Files:**
- Create: `src/components/ui/switch.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks (first task). Consumes the `radix-ui` package already in `package.json`.
- Produces: `export function Switch` (forwardRef) — a drop-in Radix `Switch.Root`/`Switch.Thumb` wrapper accepting the standard Radix Switch props (`checked`, `onCheckedChange`, `aria-label`, `disabled`, `className`, etc.). Task 4 imports this exact named export from this exact path and uses `checked`/`onCheckedChange`/`aria-label`.

- [ ] **Step 1: Confirm `radix-ui` exports `Switch`**

Run: `node -e "console.log(Object.keys(require('radix-ui')).filter(k => /switch/i.test(k)))"`
Expected: `[ 'Switch' ]`

- [ ] **Step 2: Write the component**

```tsx
"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-linen bg-linen transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-ink data-[state=checked]:bg-ink",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-paper shadow-e1 transition-transform data-[state=checked]:translate-x-[22px]" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/ui/switch.tsx`
Expected: clean.

Visual verification of this component happens in Task 4, where it's first rendered on a page — a props-forwarding primitive with no page yet has nothing to visually check in isolation.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/switch.tsx
git commit -m "feat: add Switch UI primitive"
```

---

### Task 2: `AccountCard` client component

**Files:**
- Create: `src/components/dashboard/settings/account-card.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`/`CardContent`/`CardHeader`, `Input` (existing, unchanged).
- Produces: `export function AccountCard({ email }: { email: string })` — self-contained, no other props. Task 5 imports this exact named export from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AccountCard({ email }: { email: string }) {
  const [draft, setDraft] = useState(email);
  const [saved, setSaved] = useState(email);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const unchanged = draft.trim() === saved.trim();

  function onChange(value: string) {
    setDraft(value);
    setError(null);
    setJustSaved(false);
  }

  function save() {
    if (!draft.trim() || !draft.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSaving(true);
    // No real backend here (see src/lib/auth.ts) — a short simulated delay
    // stands in for a network round trip so the loading state is real to
    // see, not instant.
    setTimeout(() => {
      setSaved(draft);
      setSaving(false);
      setJustSaved(true);
    }, 500);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Account
        </h2>
        <p className="text-small text-ink-soft">
          Your login details for the trainer dashboard.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="settings-email"
            className="mb-2 block text-small font-medium text-ink-soft"
          >
            Email address
          </label>
          <Input
            id="settings-email"
            type="email"
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p role="alert" className="mt-1.5 text-micro text-error">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={save}
            disabled={unchanged || saving}
            className="gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          {justSaved && !saving && (
            <span className="flex items-center gap-1.5 text-small font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/settings/account-card.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/settings/account-card.tsx
git commit -m "feat: add trainer settings AccountCard"
```

---

### Task 3: `SecurityCard` client component

**Files:**
- Create: `src/components/dashboard/settings/security-card.tsx`

**Interfaces:**
- Consumes: `Button`, `Card`/`CardContent`/`CardHeader`, `Input` (existing, unchanged).
- Produces: `export function SecurityCard()` — self-contained, no props. Task 5 imports this exact named export from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MIN_LENGTH = 8;

function PasswordField({
  id,
  label,
  value,
  onChange,
  inputRef,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-small font-medium text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone transition-colors hover:text-ink"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-micro text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function save() {
    const nextErrors: Record<string, string> = {};
    if (!current.trim()) {
      nextErrors.current = "Enter your current password.";
    } else if (next.length < MIN_LENGTH) {
      nextErrors.next = `Use at least ${MIN_LENGTH} characters.`;
    } else if (confirm !== next) {
      nextErrors.confirm = "Passwords don't match.";
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstRef = nextErrors.current
        ? currentRef
        : nextErrors.next
          ? nextRef
          : confirmRef;
      firstRef.current?.focus();
      return;
    }

    setSaving(true);
    // No real backend here (see src/lib/auth.ts) — a short simulated delay
    // stands in for a network round trip. "Current password" is collected
    // for realism but not checked against anything real: there is no
    // account-mutation API to check it against.
    setTimeout(() => {
      setCurrent("");
      setNext("");
      setConfirm("");
      setSaving(false);
      setJustSaved(true);
    }, 500);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Security
        </h2>
        <p className="text-small text-ink-soft">
          Update the password you use to sign in.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <PasswordField
          id="settings-current-password"
          label="Current password"
          value={current}
          inputRef={currentRef}
          onChange={(v) => {
            setCurrent(v);
            setErrors((prev) => ({ ...prev, current: "" }));
            setJustSaved(false);
          }}
          error={errors.current}
        />
        <PasswordField
          id="settings-new-password"
          label="New password"
          value={next}
          inputRef={nextRef}
          onChange={(v) => {
            setNext(v);
            setErrors((prev) => ({ ...prev, next: "" }));
            setJustSaved(false);
          }}
          error={errors.next}
        />
        <PasswordField
          id="settings-confirm-password"
          label="Confirm new password"
          value={confirm}
          inputRef={confirmRef}
          onChange={(v) => {
            setConfirm(v);
            setErrors((prev) => ({ ...prev, confirm: "" }));
            setJustSaved(false);
          }}
          error={errors.confirm}
        />

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          {justSaved && !saving && (
            <span className="flex items-center gap-1.5 text-small font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/settings/security-card.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/settings/security-card.tsx
git commit -m "feat: add trainer settings SecurityCard"
```

---

### Task 4: `NotificationPreferencesCard` client component

**Files:**
- Create: `src/components/dashboard/settings/notification-preferences-card.tsx`

**Interfaces:**
- Consumes: `Switch` from `@/components/ui/switch` (Task 1) — props `checked: boolean`, `onCheckedChange: (checked: boolean) => void`, `aria-label`. Also consumes `Card`/`CardContent`/`CardHeader` (existing, unchanged).
- Produces: `export function NotificationPreferencesCard()` — self-contained, no props. Task 5 imports this exact named export from this exact path.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface NotificationRow {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const ROWS: NotificationRow[] = [
  {
    id: "enquiries",
    label: "New student enquiries",
    description: "Get an email when a prospective student contacts you.",
    defaultOn: true,
  },
  {
    id: "bookings",
    label: "Booking confirmations & reminders",
    description: "Get an email when a session is booked or coming up soon.",
    defaultOn: true,
  },
  {
    id: "reviews",
    label: "New reviews",
    description: "Get an email when a student leaves a review.",
    defaultOn: true,
  },
  {
    id: "marketing",
    label: "Product updates & tips",
    description: "Occasional emails about new features and best practices.",
    defaultOn: false,
  },
];

export function NotificationPreferencesCard() {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ROWS.map((row) => [row.id, row.defaultOn])),
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Notification preferences
        </h2>
        <p className="text-small text-ink-soft">
          Choose which updates you receive by email.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-linen">
          {ROWS.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-small font-medium text-ink">{row.label}</p>
                <p className="mt-0.5 text-micro text-stone">
                  {row.description}
                </p>
              </div>
              <Switch
                checked={state[row.id]}
                onCheckedChange={(checked) =>
                  setState((prev) => ({ ...prev, [row.id]: checked }))
                }
                aria-label={row.label}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors related to this file.

Run: `npx eslint src/components/dashboard/settings/notification-preferences-card.tsx`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/settings/notification-preferences-card.tsx
git commit -m "feat: add trainer settings NotificationPreferencesCard"
```

---

### Task 5: Trainer Settings page + nav integration

**Files:**
- Create: `src/app/trainer/settings/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `AccountCard` (Task 2, prop `email: string`), `SecurityCard` (Task 3, no props), `NotificationPreferencesCard` (Task 4, no props), `DashboardShell` (existing, unchanged), `getSession` from `@/lib/auth` (existing).
- Produces: nothing further downstream (last code task).

- [ ] **Step 1: Write the server page**

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccountCard } from "@/components/dashboard/settings/account-card";
import { SecurityCard } from "@/components/dashboard/settings/security-card";
import { NotificationPreferencesCard } from "@/components/dashboard/settings/notification-preferences-card";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function TrainerSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
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
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Add the nav entry**

In `src/components/dashboard/nav-config.ts`, change:

```ts
export const TRAINER_NAV: NavItem[] = [
  { label: "Overview", href: "/trainer", icon: LayoutGrid },
  { label: "Enquiries", href: "/trainer/enquiries", icon: MessageSquare },
  { label: "Courses", href: "/trainer/courses", icon: BookOpen },
  { label: "Availability", href: "/trainer/availability", icon: Calendar },
  { label: "Reviews", href: "/trainer/reviews", icon: Star },
  { label: "Profile", href: "/trainer/profile", icon: User },
  { label: "Documents", href: "/trainer/documents", icon: FileText },
  { label: "Billing", href: "/trainer/billing", icon: CreditCard },
];
```

to:

```ts
export const TRAINER_NAV: NavItem[] = [
  { label: "Overview", href: "/trainer", icon: LayoutGrid },
  { label: "Enquiries", href: "/trainer/enquiries", icon: MessageSquare },
  { label: "Courses", href: "/trainer/courses", icon: BookOpen },
  { label: "Availability", href: "/trainer/availability", icon: Calendar },
  { label: "Reviews", href: "/trainer/reviews", icon: Star },
  { label: "Profile", href: "/trainer/profile", icon: User },
  { label: "Documents", href: "/trainer/documents", icon: FileText },
  { label: "Billing", href: "/trainer/billing", icon: CreditCard },
  { label: "Settings", href: "/trainer/settings", icon: Settings },
];
```

`Settings` is already imported at the top of this file (used by `ADMIN_NAV`'s Config entry) — no new import needed. Do not change `ADMIN_NAV` or any existing `TRAINER_NAV` entry.

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/trainer/settings/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/app/trainer/settings/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add trainer settings page, wire up nav entry"
```

---

### Task 6: Manual verification

**Files:** none (verification only, no code changes).

**Interfaces:** none — this task exercises the running app built by Tasks 1-5.

- [ ] **Step 1: Full project build**

Run: `npx next build`
Expected: succeeds, `/trainer/settings` appears in the route list.

- [ ] **Step 2: Start the dev server and open the page**

Run: `npm run dev` (background)
Navigate to `/trainer/login`, sign in as the demo trainer, then click
"Settings" in the sidebar nav (new entry, gear icon, below Billing).

Expected: three cards render top to bottom — Account (email pre-filled
with `trainer@ath.demo`), Security (three empty password fields), and
Notification preferences (three toggles on: enquiries/bookings/reviews;
one off: marketing). Page content is visibly narrower than the
Documents/Billing/Availability pages (capped, left-aligned column, not
stretched full-width).

- [ ] **Step 3: Account card**

Clear the email field, click Save.
Expected: inline error "Enter a valid email address." No "Saved"
confirmation.

Type `new-email@example.com`, click Save.
Expected: brief spinner + "Saving…", then a "Saved" confirmation with a
check icon next to the button. Save button disables again (matches the
just-saved value).

- [ ] **Step 4: Security card**

Click Save with all three fields empty.
Expected: "Enter your current password." error under the first field,
focus moves to it.

Fill "Current password" only, click Save.
Expected: "Use at least 8 characters." error under the second field,
focus moves to it.

Fill current password + an 8+ character new password + a non-matching
confirm value, click Save.
Expected: "Passwords don't match." error under the third field, focus
moves to it.

Fill all three consistently (new and confirm identical, 8+ characters),
click Save.
Expected: spinner + "Saving…", then "Saved" confirmation, and all three
password fields clear back to empty.

- [ ] **Step 5: Notification preferences card**

Click each of the four toggles in turn.
Expected: each flips instantly (no Save button on this card), the
marketing toggle starts off and the other three start on, state holds
across multiple toggles within the same page view.

- [ ] **Step 6: Confirm no persistence**

Reload `/trainer/settings`.
Expected: Account email reverts to `trainer@ath.demo`, Security fields
are empty, notification toggles are back to their defaults (expected — no
backend, matches every other page's save behavior this session).

- [ ] **Step 7: Confirm keyboard accessibility**

Tab through the Security card's password fields and their show/hide
buttons.
Expected: visible focus ring on every field and every show/hide button;
each show/hide button has an accessible name ("Show current password" /
"Hide current password", etc.) that updates when toggled.

- [ ] **Step 8: Final full-project check**

Run: `npx tsc --noEmit`
Expected: exit code 0, no errors.

Run: `npx eslint src`
Expected: exit code 0, no new errors/warnings introduced by this feature
(pre-existing unrelated warnings elsewhere in the codebase are out of
scope).
