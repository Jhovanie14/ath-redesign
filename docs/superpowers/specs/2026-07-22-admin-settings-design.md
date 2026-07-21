# Admin Settings Page — Design Spec

## Goal

Add a new `/admin/settings` page to the admin dashboard, mirroring the
existing `/trainer/settings` page's structure and conventions: account
email, password change, and notification preferences. This gives the admin
account the same personal-settings surface trainers already have.

## Context

The admin auth model is the same `Session { role, name, email }` /
`DEMO_ACCOUNTS` seam used by trainers (`src/lib/auth.ts`) — no per-account
mutation API, same "mock now, wire up later" convention as everywhere else
in this app.

`/admin/config` already exists in `ADMIN_NAV` and uses the gear (`Settings`)
lucide icon, but it is platform-wide configuration (marketplace category
list, via `CategoriesTable`) — not personal account settings. It has no
overlap with this page: Config changes what every trainer sees in category
pickers; Settings changes only the signed-in admin's own login/notification
preferences. Because Config already owns the gear icon, this page uses a
different icon (`UserCog`) so the two nav entries aren't visually
interchangeable.

Notification preferences are new local UI state with no existing data
model, same as the trainer version. The four rows are chosen to map 1:1 to
things already surfaced on the Admin Overview page today
(`src/app/admin/page.tsx`'s stat cards and "Needs attention" section), the
same way the trainer version's rows mapped to real trainer-dashboard
features:

1. "New practitioner applications" (default **on**) — mirrors the
   "Pending applications" stat / needs-attention card.
2. "Insurance & document expirations" (default **on**) — mirrors the
   "Insurance expiring" stat.
3. "New reviews to moderate" (default **on**) — mirrors the Reviews page.
4. "Billing renewals & churn alerts" (default **off**) — mirrors the
   "Renewals due" needs-attention card and churn stat.

## Data Model Change

None. No changes to `src/lib/types.ts`, `src/lib/auth.ts`, or seed data.
Email/password/notification state is local component state only, seeded
from `session.email` for the Account card.

## Nav Integration

`src/components/dashboard/nav-config.ts` — add one entry to `ADMIN_NAV`,
after Config:

```ts
{ label: "Settings", href: "/admin/settings", icon: UserCog },
```

`UserCog` is a new import from `lucide-react` (not currently imported in
this file).

## Layout Decision

Same deliberate exception as the trainer Settings page: content wrapped in
`<div className="max-w-2xl">` (672px, left-aligned), not the shared
`max-w-[1600px]` shell width every other redesigned page uses. Same
reasoning — this is stacked narrow forms, not a data grid.

## Admin Settings Page

### `src/app/admin/settings/page.tsx` (new, server component)

- Auth guard: redirect to `/admin/login` if no session or
  `role !== "admin"` (same pattern as `/admin/config`).
- No repository lookup needed.
- Renders inside `DashboardShell`:

```tsx
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
```

No page-level status badge, matching the trainer Settings precedent.

### `src/components/dashboard/settings/account-card.tsx` and `security-card.tsx`

These two components are reused directly by the admin Settings page — no
new files, no duplication, no prop changes to `SecurityCard` (its copy is
already role-neutral: "Update the password you use to sign in.").

`AccountCard`'s supporting copy is currently trainer-specific: "Your login
details for the trainer dashboard." This task generalizes it to "Your
login details for this dashboard." — a one-line text change with no
behavior change, so the single component serves both roles without a new
prop.

### `src/components/dashboard/settings/notification-preferences-card.tsx` (existing component — needs a new role-aware variant)

The existing `NotificationPreferencesCard` (already built, currently
`src/components/dashboard/settings/notification-preferences-card.tsx`)
hardcodes the trainer's four `ROWS: NotificationRow[]` (each
`{ id, label, description, defaultOn }`) as a module-level constant, and
keeps a single `useState<Record<string, boolean>>` seeded from
`Object.fromEntries(ROWS.map((row) => [row.id, row.defaultOn]))`. Since the
admin page needs different row content, this task adds a `rows` prop and
exports the existing `NotificationRow` interface (currently unexported):

```ts
export interface NotificationRow {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export function NotificationPreferencesCard({ rows }: { rows: NotificationRow[] })
```

The component body is otherwise unchanged — it maps over the `rows` prop
instead of the module-level `ROWS` constant, and seeds the same
`useState<Record<string, boolean>>` from whichever rows array it's given.

The current hardcoded trainer `ROWS` array is renamed to an exported
constant `TRAINER_NOTIFICATION_ROWS` in the same file, and the trainer
`/trainer/settings/page.tsx` call site is updated to pass it explicitly:
`<NotificationPreferencesCard rows={TRAINER_NOTIFICATION_ROWS} />`. This
keeps the trainer page's behavior byte-for-byte identical while making the
component reusable. A new `ADMIN_NOTIFICATION_ROWS` constant (exported from
the same file, for symmetry) holds the four admin rows listed in Context
above, and `/admin/settings/page.tsx` passes that instead.

Same instant-toggle-is-the-save behavior, no shared draft/Save button,
`divide-y divide-linen` between rows — none of that changes.

## Global Constraints

- Next.js 16 App Router / React 19 / Tailwind v4 (real stack).
- No backend — every save on this page is local `useState`, never written
  back, resets on reload.
- Reuse existing components: `AccountCard` and `SecurityCard` are imported
  unmodified from the trainer Settings work; only
  `NotificationPreferencesCard` gains a `rows` prop.
- `UserCog` icon for the nav entry — do not reuse the gear (`Settings`)
  icon already used by Config.
- Settings page content is capped at `max-w-2xl`, left-aligned — same
  exception as trainer Settings.
- Do not modify `/admin/config` or its `CategoriesTable`.

## Manual Verification

1. Log in as admin, open `/admin/settings` via the new sidebar nav entry
   (distinct `UserCog` icon, not the Config gear) — three cards render:
   Account (email pre-filled from admin session), Security (three empty
   password fields), Notification preferences (three toggles on, one off,
   admin-specific copy).
2. Account and Security behave identically to the trainer page (validation
   messages, save spinner, field-clearing) — verify by repeating the
   trainer Settings manual-verification steps 2–3 against this page.
3. Notification preferences: confirm the four rows show admin-specific
   labels/descriptions (not the trainer's enquiries/bookings copy), and
   toggle each — flips instantly, no shared Save button.
4. Revisit `/trainer/settings` and confirm its four rows are unchanged
   (still enquiries/bookings/reviews/marketing) — the refactor must not
   alter trainer behavior.
5. `npx tsc --noEmit`, `npx next build`, and `npx eslint src` all clean.
