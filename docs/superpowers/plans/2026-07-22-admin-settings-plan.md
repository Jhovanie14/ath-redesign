# Admin Settings Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/admin/settings` page (Account, Security, Notification preferences) mirroring the existing `/trainer/settings` page, reusing its components where they're already role-agnostic and generalizing the one component (`NotificationPreferencesCard`) that currently hardcodes trainer-specific content.

**Architecture:** Two tasks. Task 1 generalizes the two existing Settings components that need it (`NotificationPreferencesCard` gets a `rows` prop; `AccountCard`'s copy becomes role-neutral) without changing trainer behavior. Task 2 adds the new admin page plus its nav entry, reusing `AccountCard`/`SecurityCard` unmodified and passing a new `ADMIN_NOTIFICATION_ROWS` constant to the now-generic `NotificationPreferencesCard`.

**Tech Stack:** Next.js 16 App Router / React 19 / Tailwind v4. No test runner in this repo (`package.json` has no `test` script, no jest/vitest) — verification is `tsc --noEmit`, `eslint`, `next build`, and manual browser walkthrough, matching the precedent set by the trainer Settings page.

## Global Constraints

- No backend anywhere in this app. Every save on this page is local `useState`, never written back, resets on reload.
- The Security card's "current password" field stays collected-but-unverified — unchanged, this task doesn't touch `security-card.tsx`.
- Do not modify `/admin/config` or `src/components/dashboard/config/categories-table.tsx`.
- Do not change trainer Settings behavior: `/trainer/settings` must render the same four notification rows (enquiries/bookings/reviews/marketing) with the same defaults after this plan lands.
- New admin nav entry uses the `UserCog` icon from `lucide-react` — NOT the gear (`Settings`) icon already used by the Config entry.
- Page content wrapper: `<div className="max-w-2xl">` — same deliberate exception as trainer Settings (see spec's "Layout Decision").
- Auth guard pattern: redirect to `/admin/login` if `!session || session.role !== "admin"` (exact pattern in `src/app/admin/config/page.tsx`).
- Card heading style stays `<h2 className="font-sans text-[17px] font-semibold text-ink">` (already baked into the reused components — no change needed, noted here so no task "fixes" it).

---

### Task 1: Generalize shared Settings components for multi-role reuse

**Files:**
- Modify: `src/components/dashboard/settings/notification-preferences-card.tsx`
- Modify: `src/components/dashboard/settings/account-card.tsx`
- Modify: `src/app/trainer/settings/page.tsx`

**Interfaces:**
- Consumes: nothing from other tasks (first task).
- Produces:
  - `export interface NotificationRow { id: string; label: string; description: string; defaultOn: boolean }` from `notification-preferences-card.tsx`.
  - `export const TRAINER_NOTIFICATION_ROWS: NotificationRow[]` from the same file (the current four trainer rows, unchanged content).
  - `export function NotificationPreferencesCard({ rows }: { rows: NotificationRow[] })` — Task 2 imports this and passes its own rows array.
  - `AccountCard`'s exported signature (`export function AccountCard({ email }: { email: string })`) is unchanged — only its internal copy string changes.

- [ ] **Step 1: Read the current file to confirm the exact current content**

Run: `cat src/components/dashboard/settings/notification-preferences-card.tsx`
Expected: matches the version below before edits (module-level `interface NotificationRow` at lines 7-12, unexported `const ROWS` at lines 14-39, `export function NotificationPreferencesCard()` with no props at line 41).

- [ ] **Step 2: Rewrite the file to accept a `rows` prop**

Replace the full contents of `src/components/dashboard/settings/notification-preferences-card.tsx` with:

```tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export interface NotificationRow {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export const TRAINER_NOTIFICATION_ROWS: NotificationRow[] = [
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

export function NotificationPreferencesCard({
  rows,
}: {
  rows: NotificationRow[];
}) {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, row.defaultOn])),
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
          {rows.map((row) => (
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

- [ ] **Step 3: Update the trainer Settings page to pass the rows explicitly**

In `src/app/trainer/settings/page.tsx`, change the import line:

```tsx
import { NotificationPreferencesCard } from "@/components/dashboard/settings/notification-preferences-card";
```

to:

```tsx
import {
  NotificationPreferencesCard,
  TRAINER_NOTIFICATION_ROWS,
} from "@/components/dashboard/settings/notification-preferences-card";
```

And change the usage:

```tsx
<NotificationPreferencesCard />
```

to:

```tsx
<NotificationPreferencesCard rows={TRAINER_NOTIFICATION_ROWS} />
```

- [ ] **Step 4: Generalize `AccountCard`'s copy**

In `src/components/dashboard/settings/account-card.tsx`, change:

```tsx
        <p className="text-small text-ink-soft">
          Your login details for the trainer dashboard.
        </p>
```

to:

```tsx
        <p className="text-small text-ink-soft">
          Your login details for this dashboard.
        </p>
```

- [ ] **Step 5: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/components/dashboard/settings/notification-preferences-card.tsx src/components/dashboard/settings/account-card.tsx src/app/trainer/settings/page.tsx`
Expected: clean.

- [ ] **Step 6: Manual verification — trainer Settings unchanged**

Run: `npx next dev`, log in as trainer (`trainer@ath.demo` / `trainer123`), open `/trainer/settings`.
Expected: Account card now reads "Your login details for this dashboard."; Notification preferences card still shows the same four rows (New student enquiries / Booking confirmations & reminders / New reviews / Product updates & tips) with the same on/on/on/off defaults as before this change.

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/settings/notification-preferences-card.tsx src/components/dashboard/settings/account-card.tsx src/app/trainer/settings/page.tsx
git commit -m "refactor: generalize Settings components for multi-role reuse"
```

---

### Task 2: Admin Settings page and nav entry

**Files:**
- Create: `src/app/admin/settings/page.tsx`
- Modify: `src/components/dashboard/nav-config.ts`

**Interfaces:**
- Consumes: `NotificationPreferencesCard`, `NotificationRow` (both from Task 1's `notification-preferences-card.tsx`); `AccountCard` from `account-card.tsx`; `SecurityCard` from `security-card.tsx` (unchanged); `DashboardShell` from `src/components/dashboard/dashboard-shell.tsx`; `getSession` from `src/lib/auth.ts`; `logoutAdmin` from `src/app/admin/actions.ts`.
- Produces: the routable page at `/admin/settings`; a new `ADMIN_NAV` entry. Nothing later depends on this task.

- [ ] **Step 1: Write the admin settings page**

Create `src/app/admin/settings/page.tsx`:

```tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccountCard } from "@/components/dashboard/settings/account-card";
import { SecurityCard } from "@/components/dashboard/settings/security-card";
import {
  NotificationPreferencesCard,
  type NotificationRow,
} from "@/components/dashboard/settings/notification-preferences-card";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Settings",
};

const ADMIN_NOTIFICATION_ROWS: NotificationRow[] = [
  {
    id: "applications",
    label: "New practitioner applications",
    description: "Get an email when a new application is submitted.",
    defaultOn: true,
  },
  {
    id: "expirations",
    label: "Insurance & document expirations",
    description:
      "Get an email when a practitioner's insurance or qualifications are expiring soon.",
    defaultOn: true,
  },
  {
    id: "reviews",
    label: "New reviews to moderate",
    description: "Get an email when a student leaves a new review.",
    defaultOn: true,
  },
  {
    id: "billing",
    label: "Billing renewals & churn alerts",
    description:
      "Get an email for upcoming subscription renewals and cancellations.",
    defaultOn: false,
  },
];

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <div className="max-w-2xl">
        <h1 className="font-display text-display-md text-ink">Settings</h1>
        <p className="mt-2.5 text-body text-ink-soft">
          Manage your account, security, and notification preferences.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <AccountCard email={session.email} />
          <SecurityCard />
          <NotificationPreferencesCard rows={ADMIN_NOTIFICATION_ROWS} />
        </div>
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Add the nav entry**

In `src/components/dashboard/nav-config.ts`, add `UserCog` to the `lucide-react` import:

```ts
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  LayoutGrid,
  MessageSquare,
  Settings,
  Star,
  User,
  UserCog,
  Users,
} from "lucide-react";
```

Then add an entry to `ADMIN_NAV`, after Config:

```ts
export const ADMIN_NAV: NavItem[] = [
  { label: "Overview", href: "/admin", icon: LayoutGrid },
  { label: "Applications", href: "/admin/applications", icon: FileText },
  { label: "Practitioners", href: "/admin/practitioners", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Billing", href: "/admin/billing", icon: CreditCard },
  { label: "Config", href: "/admin/config", icon: Settings },
  { label: "Settings", href: "/admin/settings", icon: UserCog },
];
```

- [ ] **Step 3: Type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src/app/admin/settings/page.tsx src/components/dashboard/nav-config.ts`
Expected: clean.

- [ ] **Step 4: Build**

Run: `npx next build`
Expected: succeeds, `/admin/settings` listed in the route output.

- [ ] **Step 5: Manual verification**

Run: `npx next dev`, log in as admin (`admin@ath.demo` / `admin123`).

1. Sidebar shows a new "Settings" entry after Config, with a distinct `UserCog` icon (not the Config gear).
2. Open `/admin/settings` — three cards render: Account (email pre-filled `admin@ath.demo`, copy "Your login details for this dashboard."), Security (three empty password fields), Notification preferences (rows: "New practitioner applications" on, "Insurance & document expirations" on, "New reviews to moderate" on, "Billing renewals & churn alerts" off).
3. Account: clear the email, click Save — inline error, no "Saved". Type a valid email, click Save — spinner then "Saved".
4. Security: click Save with everything empty — "Enter your current password." Fill only current, click Save — "Use at least 8 characters." Fill a valid new password with a mismatched confirm — "Passwords don't match." Fill all three consistently — spinner then "Saved", fields clear.
5. Notification preferences: click each toggle — flips instantly, no button to click.
6. Reload `/admin/settings` — everything reverts to the defaults above (expected, no backend).
7. Revisit `/admin/config` — unchanged, still shows the categories table.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/settings/page.tsx src/components/dashboard/nav-config.ts
git commit -m "feat: add admin settings page"
```
