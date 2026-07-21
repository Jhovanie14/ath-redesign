# Trainer Enquiries Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the trainer-side Enquiries inbox (`/trainer/enquiries` list + `/trainer/enquiries/[id]` detail) against seed data, per `docs/superpowers/specs/2026-07-21-trainer-enquiries-design.md`, and wire it into nav and the Overview stat card.

**Architecture:** A new pure data module (`src/lib/enquiries.ts`) mirrors the existing `(trainers, now) -> derived data` / `DEMO_*` seed conventions used by `toPractitioners`/`toAdminReviews`/`applications.ts`, with a `renewalUrgency`-style derived-status function (`enquiryStatus`). Two new presentational client components under `src/components/dashboard/enquiries/` (list + detail) reuse existing dashboard primitives (`Card`, `Badge`, `InitialsAvatar`, `usePagination`/`TablePagination`, `Input`, `Select`, `Button`). A new `Textarea` UI primitive is added alongside the existing shadcn-style primitives. Two server-component route pages (`src/app/trainer/enquiries/page.tsx`, `src/app/trainer/enquiries/[id]/page.tsx`) handle the auth guard, compute `now` once, and pass data down. Final integration task drops the nav's `disabled` flag and makes the Overview "New enquiries" stat card live-derived, removing the now-redundant hardcoded fields from `dashboard-stats.ts`.

**Tech Stack:** Next.js 16 (Turbopack) App Router, React 19, Tailwind v4, TypeScript. No new dependencies.

## Global Constraints

- Real stack is Next 16 / React 19 / Tailwind v4 — do not follow Next 14/React 18 patterns from training data. Route params are `Promise<{ ... }>` and must be `await`ed (confirmed in `src/app/trainer/[slug]/page.tsx`'s `generateMetadata`).
- **No automated test framework exists in this repo** (no jest/vitest/testing-library). Every task below substitutes `npx tsc --noEmit` and `npx eslint <files>` for the "write failing test" step, and the final task is a full manual browser walkthrough in place of an integration test suite. This matches every prior dashboard feature built in this codebase.
- Status is **derived, never stored redundantly** — `enquiryStatus(e, now)` is the single source of truth for `new`/`booked`/`attended`/`archived`, computed from `archived`/`bookedDate` plus one `now` snapshot. No component may compute its own clock or duplicate this logic.
- `now = new Date()` is computed exactly once per page render, in the server component, and threaded down as a prop — never called again inside a child component.
- `gold` badge variant is reserved for Premium-tier subscription badges only (see `src/app/trainer/page.tsx`'s subscription card) — never use it for enquiry status badges.
- `STATUS_BADGE` mapping is exactly: `new` → `neutral` "New", `booked` → `warning` "Booked", `attended` → `success` "Attended", `archived` → `outline` "Archived".
- Nothing in this feature persists past a reload (matches `ReviewsTable`'s in-memory-only status changes) — reply/booking/archive state lives in local `useState` in the detail client component only.
- Connecting the public `EnquiryDialog` (`src/components/trainer/enquiry-dialog.tsx`) to this data, email notifications, cross-reload persistence, and multi-trainer routing are all explicitly out of scope.
- Every task must leave the repo `tsc`-clean and `eslint`-clean on its own.
- Never commit unless this plan's own steps say to; each task's commit step is scoped to only the files that task touches.

---

### Task 1: Data model — `src/lib/enquiries.ts`

**Files:**
- Create: `src/lib/enquiries.ts`

**Interfaces:**
- Consumes: nothing (pure seed module, same as `applications.ts`).
- Produces (consumed by Tasks 2, 3, 4, 5, 6):
  - `interface EnquiryMessage { from: "student" | "trainer"; body: string; sentAt: string }`
  - `interface Enquiry { id: string; studentName: string; courseTitle: string; receivedAt: string; messages: EnquiryMessage[]; bookedDate: string | null; archived: boolean }`
  - `type EnquiryStatus = "new" | "booked" | "attended" | "archived"`
  - `const DEMO_ENQUIRIES: Enquiry[]`
  - `function enquiryStatus(e: Enquiry, now: Date): EnquiryStatus`
  - `const STATUS_BADGE: Record<EnquiryStatus, { label: string; variant: BadgeProps["variant"] }>`

- [ ] **Step 1: Write the module**

```ts
// src/lib/enquiries.ts
//
// Placeholder trainer enquiry inbox — there is no backend yet (same "mock
// now, wire up later" seam as applications.ts and dashboard-stats.ts). The
// public-facing EnquiryDialog (src/components/trainer/enquiry-dialog.tsx)
// simulates a student submitting an enquiry but doesn't persist anywhere —
// there is no real connection between that dialog and this seed data.

import type { BadgeProps } from "@/components/ui/badge";

export interface EnquiryMessage {
  from: "student" | "trainer";
  body: string;
  sentAt: string; // ISO datetime
}

export interface Enquiry {
  id: string;
  studentName: string;
  courseTitle: string;
  receivedAt: string; // ISO date
  messages: EnquiryMessage[];
  bookedDate: string | null; // agreed date, set via "Mark as booked"
  archived: boolean;
}

export type EnquiryStatus = "new" | "booked" | "attended" | "archived";

/** Status is derived, never stored redundantly — same renewalUrgency-style
 * pattern as toPractitioners() in practitioners.ts. */
export function enquiryStatus(e: Enquiry, now: Date): EnquiryStatus {
  if (e.archived) return "archived";
  if (e.bookedDate) {
    return new Date(e.bookedDate).getTime() < now.getTime()
      ? "attended"
      : "booked";
  }
  return "new";
}

export const STATUS_BADGE: Record<
  EnquiryStatus,
  { label: string; variant: BadgeProps["variant"] }
> = {
  new: { label: "New", variant: "neutral" },
  booked: { label: "Booked", variant: "warning" },
  attended: { label: "Attended", variant: "success" },
  archived: { label: "Archived", variant: "outline" },
};

export const DEMO_ENQUIRIES: Enquiry[] = [
  {
    id: "enq-1",
    studentName: "Freya Marsh",
    courseTitle: "Advanced Cheek & Midface Filler",
    receivedAt: "2026-07-19",
    messages: [
      {
        from: "student",
        body: "Hi Dr Okafor, I'm a nurse prescriber with two years of injectables experience — do you have space on your next Advanced Cheek & Midface course? I'm flexible on dates in August.",
        sentAt: "2026-07-19T09:14:00",
      },
    ],
    bookedDate: null,
    archived: false,
  },
  {
    id: "enq-2",
    studentName: "Callum Reid",
    courseTitle: "Jawline & Chin Definition",
    receivedAt: "2026-07-17",
    messages: [
      {
        from: "student",
        body: "Hello, I'd like to book onto the Jawline & Chin Definition course. Is the 14th of August still available?",
        sentAt: "2026-07-17T13:02:00",
      },
    ],
    bookedDate: "2026-08-14",
    archived: false,
  },
  {
    id: "enq-3",
    studentName: "Priti Anand",
    courseTitle: "Masterclass: Full-Face Assessment",
    receivedAt: "2026-07-10",
    messages: [
      {
        from: "student",
        body: "I'm keen to attend the Full-Face Assessment masterclass — could you confirm what's covered on the day?",
        sentAt: "2026-07-10T10:20:00",
      },
      {
        from: "trainer",
        body: "Hi Priti, it covers a structured full-face consult framework plus live assessment practice on models. I've got a date free on the 2nd of July if that works?",
        sentAt: "2026-07-10T16:45:00",
      },
    ],
    bookedDate: "2026-07-02",
    archived: false,
  },
  {
    id: "enq-4",
    studentName: "Owen Blackwood",
    courseTitle: "Lip Filler Refinement",
    receivedAt: "2026-06-28",
    messages: [
      {
        from: "student",
        body: "Do you run the Lip Filler Refinement course as a one-to-one, or only in groups?",
        sentAt: "2026-06-28T08:55:00",
      },
      {
        from: "trainer",
        body: "It's small-group only, max 4 delegates, to keep enough hands-on time per person.",
        sentAt: "2026-06-28T11:30:00",
      },
    ],
    bookedDate: "2026-06-30",
    archived: false,
  },
  {
    id: "enq-5",
    studentName: "Nadia Hussein",
    courseTitle: "Advanced Cheek & Midface Filler",
    receivedAt: "2026-07-15",
    messages: [
      {
        from: "student",
        body: "Is there a payment plan available for the Advanced Cheek & Midface course, or is it full payment upfront?",
        sentAt: "2026-07-15T15:40:00",
      },
    ],
    bookedDate: null,
    archived: false,
  },
  {
    id: "enq-6",
    studentName: "Ben Okoro",
    courseTitle: "Jawline & Chin Definition",
    receivedAt: "2026-06-05",
    messages: [
      {
        from: "student",
        body: "I had to change my plans and won't be able to make the course after all — sorry for the late notice.",
        sentAt: "2026-06-05T12:00:00",
      },
    ],
    bookedDate: null,
    archived: true,
  },
  {
    id: "enq-7",
    studentName: "Sadia Karim",
    courseTitle: "Masterclass: Full-Face Assessment",
    receivedAt: "2026-05-20",
    messages: [
      {
        from: "student",
        body: "Loved the masterclass last month — do you have a follow-up or advanced session planned?",
        sentAt: "2026-05-20T09:30:00",
      },
      {
        from: "trainer",
        body: "So glad it was useful! Nothing scheduled yet, but I'll let you know as soon as I open dates for an advanced follow-up.",
        sentAt: "2026-05-20T14:10:00",
      },
    ],
    bookedDate: "2026-05-01",
    archived: false,
  },
  {
    id: "enq-8",
    studentName: "Tomasz Nowak",
    courseTitle: "Lip Filler Refinement",
    receivedAt: "2026-07-20",
    messages: [
      {
        from: "student",
        body: "Hi, I'm relatively new to aesthetics (6 months in) — would the Refinement course be suitable, or should I look at a foundation course first?",
        sentAt: "2026-07-20T17:25:00",
      },
    ],
    bookedDate: null,
    archived: false,
  },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/lib/enquiries.ts`
Expected: no errors.

- [ ] **Step 4: Hand-verify the derived-status function against the seed data**

Run: `node -e "const now=new Date('2026-07-21');const data=[['none',null,false],['future','2026-08-14',false],['past','2026-07-02',false],['archived',null,true],['archived-with-date','2026-05-01',true]];for(const[label,bookedDate,archived] of data){let status;if(archived)status='archived';else if(bookedDate)status=new Date(bookedDate).getTime()<now.getTime()?'attended':'booked';else status='new';console.log(label,'->',status)}"`
Expected output: `none -> new`, `future -> booked`, `past -> attended`, `archived -> archived`, `archived-with-date -> archived` — confirms `enq-1`/`enq-5`/`enq-8` will show "New", `enq-2` "Booked" (14 Aug is future relative to the spec's 2026-07-21 "today"), `enq-3`/`enq-4`/`enq-7` "Attended" (booked dates all in the past), `enq-6` "Archived" regardless of its null `bookedDate`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/enquiries.ts
git commit -m "feat: add trainer enquiries data model and seed data"
```

---

### Task 2: `Textarea` UI primitive

**Files:**
- Create: `src/components/ui/textarea.tsx`

**Interfaces:**
- Consumes: `cn` (`src/lib/utils.ts`).
- Produces (consumed by Task 5): `function Textarea(props: React.ComponentProps<"textarea">): JSX.Element`

- [ ] **Step 1: Write the primitive**

Style it to match `Input` (`src/components/ui/input.tsx`) exactly, but as a multi-line field (no fixed height, `resize-y`, vertical padding instead of the input's fixed `h-11`):

```tsx
// src/components/ui/textarea.tsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 resize-y rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-small text-ink outline-none transition-colors placeholder:text-stone disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-stone",
        "aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/ui/textarea.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/textarea.tsx
git commit -m "feat: add Textarea UI primitive"
```

---

### Task 3: List component — `enquiries-list.tsx`

**Files:**
- Create: `src/components/dashboard/enquiries/enquiries-list.tsx`

**Interfaces:**
- Consumes: `Enquiry`/`enquiryStatus`/`EnquiryStatus`/`STATUS_BADGE` (`src/lib/enquiries.ts`, Task 1), `InitialsAvatar` (`src/components/dashboard/initials-avatar.tsx`), `usePagination` (`src/hooks/use-pagination.ts`), `TablePagination` (`src/components/dashboard/table-pagination.tsx`), `Badge` (`src/components/ui/badge.tsx`), `Input` (`src/components/ui/input.tsx`), `Select`/`SelectContent`/`SelectItem`/`SelectTrigger`/`SelectValue` (`src/components/ui/select.tsx`), `formatShortDate` (`src/lib/utils.ts`).
- Produces (consumed by Task 4): `function EnquiriesList({ enquiries, now }: { enquiries: Enquiry[]; now: Date }): JSX.Element`

- [ ] **Step 1: Write the component**

Card-feed layout (not a table — this is a personal inbox), mirroring `ReviewsTable`'s search/filter/pagination state shape (`src/components/dashboard/reviews/reviews-table.tsx`):

```tsx
// src/components/dashboard/enquiries/enquiries-list.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryStatus,
} from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { TablePagination } from "@/components/dashboard/table-pagination";

const PAGE_SIZE = 10;

function latestMessageSnippet(enquiry: Enquiry): string {
  const latest = enquiry.messages[enquiry.messages.length - 1];
  if (!latest) return "";
  const body = latest.body.trim();
  return body.length > 90 ? `${body.slice(0, 90)}…` : body;
}

export function EnquiriesList({
  enquiries,
  now,
}: {
  enquiries: Enquiry[];
  now: Date;
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<EnquiryStatus | "all">(
    "all",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enquiries.filter((e) => {
      const matchesQuery =
        q === "" ||
        e.studentName.toLowerCase().includes(q) ||
        e.courseTitle.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || enquiryStatus(e, now) === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [enquiries, query, statusFilter, now]);

  const { page, setPage, pageCount, pageItems, total } = usePagination(
    filtered,
    PAGE_SIZE,
  );

  if (enquiries.length === 0) {
    return (
      <div className="rounded-card border border-linen bg-paper px-6 py-16 text-center">
        <p className="font-display text-title text-ink">No enquiries yet</p>
        <p className="mt-1.5 text-small text-ink-soft">
          Student enquiries will appear here once they start coming in.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by student or course"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as EnquiryStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="booked">Booked</SelectItem>
            <SelectItem value="attended">Attended</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No matches</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Try a different search term or status filter.
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {pageItems.map((enquiry) => {
            const status = enquiryStatus(enquiry, now);
            const badge = STATUS_BADGE[status];
            return (
              <Link
                key={enquiry.id}
                href={`/trainer/enquiries/${enquiry.id}`}
                className="flex items-center gap-4 rounded-card border border-linen bg-paper px-5 py-4 transition-colors hover:border-stone"
              >
                <InitialsAvatar name={enquiry.studentName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium text-ink">
                      {enquiry.studentName}
                    </p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="mt-0.5 truncate text-small text-ink-soft">
                    {latestMessageSnippet(enquiry)}
                  </p>
                </div>
                <p className="shrink-0 whitespace-nowrap text-small text-ink-soft">
                  {formatShortDate(enquiry.receivedAt)}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      <TablePagination
        page={page}
        pageCount={pageCount}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/dashboard/enquiries/enquiries-list.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/enquiries/enquiries-list.tsx
git commit -m "feat: add trainer enquiries list component"
```

---

### Task 4: List page — `/trainer/enquiries`

**Files:**
- Create: `src/app/trainer/enquiries/page.tsx`

**Interfaces:**
- Consumes: `getSession` (`src/lib/auth.ts`), `DEMO_ENQUIRIES` (`src/lib/enquiries.ts`, Task 1), `DashboardShell` (`src/components/dashboard/dashboard-shell.tsx`), `EnquiriesList` (Task 3), `logoutTrainer` (`src/app/trainer/actions.ts`).
- Produces: the `/trainer/enquiries` route.

- [ ] **Step 1: Write the page**

Auth guard + `now` computation follows the exact pattern in `src/app/trainer/page.tsx`:

```tsx
// src/app/trainer/enquiries/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_ENQUIRIES } from "@/lib/enquiries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiriesList } from "@/components/dashboard/enquiries/enquiries-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Enquiries",
};

export default async function TrainerEnquiriesPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const now = new Date();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <h1 className="font-display text-display-md text-ink">Enquiries</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Messages from students interested in your courses.
      </p>

      <div className="mt-8">
        <EnquiriesList enquiries={DEMO_ENQUIRIES} now={now} />
      </div>
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/app/trainer/enquiries/page.tsx`
Expected: no errors.

- [ ] **Step 4: Manual check — page loads with the disabled nav link bypassed**

Run: `npm run dev` (background), log in at `/trainer/login` with `trainer@ath.demo` / `trainer123`, navigate directly to `http://localhost:3000/trainer/enquiries` (the sidebar link is still `disabled: true` until Task 7, so direct navigation is required for this check).
Expected: page renders the 8 seeded enquiries as card rows, search box and status filter present, badges show New (enq-1, enq-5, enq-8), Booked (enq-2), Attended (enq-3, enq-4, enq-7), Archived (enq-6). Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add src/app/trainer/enquiries/page.tsx
git commit -m "feat: add trainer enquiries list page"
```

---

### Task 5: Detail component — `enquiry-detail.tsx`

**Files:**
- Create: `src/components/dashboard/enquiries/enquiry-detail.tsx`

**Interfaces:**
- Consumes: `Enquiry`/`EnquiryMessage`/`enquiryStatus`/`STATUS_BADGE` (`src/lib/enquiries.ts`, Task 1), `Textarea` (`src/components/ui/textarea.tsx`, Task 2), `Badge` (`src/components/ui/badge.tsx`), `Button` (`src/components/ui/button.tsx`), `Card`/`CardContent` (`src/components/ui/card.tsx`), `formatLongDate` (`src/lib/utils.ts`).
- Produces (consumed by Task 6): `function EnquiryDetail({ enquiry, now }: { enquiry: Enquiry; now: Date }): JSX.Element`

- [ ] **Step 1: Write the component**

Holds all mutable state locally (messages/bookedDate/archived) since nothing persists past a reload — matches `ReviewsTable`'s in-memory-only status changes:

```tsx
// src/components/dashboard/enquiries/enquiry-detail.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryMessage,
} from "@/lib/enquiries";
import { formatLongDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function EnquiryDetail({
  enquiry,
  now,
}: {
  enquiry: Enquiry;
  now: Date;
}) {
  const [messages, setMessages] = useState<EnquiryMessage[]>(
    enquiry.messages,
  );
  const [bookedDate, setBookedDate] = useState<string | null>(
    enquiry.bookedDate,
  );
  const [archived, setArchived] = useState(enquiry.archived);
  const [reply, setReply] = useState("");
  const [dateInput, setDateInput] = useState("");

  const status = enquiryStatus({ ...enquiry, bookedDate, archived }, now);
  const badge = STATUS_BADGE[status];
  const showBookingBlock = status === "new";

  function sendReply() {
    const body = reply.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      { from: "trainer", body, sentAt: now.toISOString() },
    ]);
    setReply("");
  }

  function markBooked() {
    if (!dateInput) return;
    setBookedDate(dateInput);
  }

  return (
    <>
      <Link
        href="/trainer/enquiries"
        className="inline-flex items-center gap-1.5 text-small font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All enquiries
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md text-ink">
          {enquiry.studentName}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-1.5 text-body text-ink-soft">
        {enquiry.courseTitle} · Received {formatLongDate(enquiry.receivedAt)}
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.from === "trainer"
                  ? "ml-auto max-w-[80%] rounded-card bg-linen px-4 py-3"
                  : "mr-auto max-w-[80%] rounded-card bg-ivory px-4 py-3"
              }
            >
              <p className="text-small text-ink">{m.body}</p>
              <p className="mt-1.5 text-micro text-stone">
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.sentAt))}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 flex flex-col gap-3">
        <Textarea
          placeholder="Write a reply..."
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Button
          className="self-end"
          disabled={reply.trim() === ""}
          onClick={sendReply}
        >
          Send reply
        </Button>
      </div>

      {showBookingBlock && (
        <Card className="mt-5">
          <CardContent>
            <h2 className="font-display text-title text-ink">
              Confirm this enquiry
            </h2>
            <p className="mt-1.5 text-small text-ink-soft">
              Confirming shares your contact details with the student and
              books them in for a review invitation after the course.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="h-11 rounded-xl border border-linen bg-paper px-3.5 text-small text-ink outline-none focus-visible:border-stone"
              />
              <Button disabled={!dateInput} onClick={markBooked}>
                Mark as booked
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setArchived(true)}
              className="mt-4 block text-small font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Archive this enquiry
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/components/dashboard/enquiries/enquiry-detail.tsx`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/enquiries/enquiry-detail.tsx
git commit -m "feat: add trainer enquiry detail component"
```

---

### Task 6: Detail page — `/trainer/enquiries/[id]`

**Files:**
- Create: `src/app/trainer/enquiries/[id]/page.tsx`

**Interfaces:**
- Consumes: `getSession` (`src/lib/auth.ts`), `DEMO_ENQUIRIES` (`src/lib/enquiries.ts`, Task 1), `DashboardShell` (`src/components/dashboard/dashboard-shell.tsx`), `EnquiryDetail` (Task 5), `logoutTrainer` (`src/app/trainer/actions.ts`), `notFound` (`next/navigation`).
- Produces: the `/trainer/enquiries/[id]` route.

- [ ] **Step 1: Write the page**

`params` is a `Promise` in this Next.js version — same pattern as `generateMetadata` in `src/app/trainer/[slug]/page.tsx`:

```tsx
// src/app/trainer/enquiries/[id]/page.tsx
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_ENQUIRIES } from "@/lib/enquiries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiryDetail } from "@/components/dashboard/enquiries/enquiry-detail";
import { logoutTrainer } from "../../actions";

export const metadata: Metadata = {
  title: "Enquiry",
};

export default async function TrainerEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const { id } = await params;
  const enquiry = DEMO_ENQUIRIES.find((e) => e.id === id);
  if (!enquiry) notFound();

  const now = new Date();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <EnquiryDetail enquiry={enquiry} now={now} />
    </DashboardShell>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Lint**

Run: `npx eslint src/app/trainer/enquiries/[id]/page.tsx`
Expected: no errors.

- [ ] **Step 4: Manual check**

Run: `npm run dev` (background), while logged in as trainer navigate to `http://localhost:3000/trainer/enquiries/enq-1`.
Expected: back link, "Freya Marsh" header with "New" badge, course/date info row, one student message bubble, reply box, and a visible "Confirm this enquiry" booking block (status is `new`). Then navigate to `http://localhost:3000/trainer/enquiries/enq-2` (status `booked`): booking block is hidden. Then navigate to `http://localhost:3000/trainer/enquiries/does-not-exist`: renders the Next.js not-found page, not a crash. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add "src/app/trainer/enquiries/[id]/page.tsx"
git commit -m "feat: add trainer enquiry detail page"
```

---

### Task 7: Integration — nav, Overview stat card, `dashboard-stats.ts` cleanup

**Files:**
- Modify: `src/components/dashboard/nav-config.ts`
- Modify: `src/app/trainer/page.tsx`
- Modify: `src/lib/dashboard-stats.ts`

**Interfaces:**
- Consumes: `DEMO_ENQUIRIES`/`enquiryStatus` (`src/lib/enquiries.ts`, Task 1).
- Produces: nothing further downstream — this is the final wiring task.

- [ ] **Step 1: Drop `disabled: true` from the Enquiries nav entry**

In `src/components/dashboard/nav-config.ts`, change:

```ts
  { label: "Enquiries", href: "/trainer/enquiries", icon: MessageSquare, disabled: true },
```

to:

```ts
  { label: "Enquiries", href: "/trainer/enquiries", icon: MessageSquare },
```

- [ ] **Step 2: Remove `newEnquiries`/`enquiriesNote` from `TrainerStats`**

In `src/lib/dashboard-stats.ts`, remove these two lines from the `TrainerStats` interface:

```ts
  newEnquiries: number;
  enquiriesNote: string;
```

and these two lines from `DEMO_TRAINER_STATS`:

```ts
  newEnquiries: 1,
  enquiriesNote: "All read",
```

Update the file's header comment to reflect that `newEnquiries` is now also derived live (mirroring the existing comment above `DEMO_ADMIN_STATS`):

```ts
// Placeholder dashboard metrics — there is no backend yet (same "mock now,
// wire up later" seam as getRepository() in ./repository.ts). Swap these for
// real queries once bookings/billing exist.
//
// newEnquiries is derived live from DEMO_ENQUIRIES/enquiryStatus() in
// src/lib/enquiries.ts (see src/app/trainer/page.tsx) — no separate stub,
// so Overview can't silently drift from the Enquiries page it summarizes.
```

(This replaces the existing top-of-file comment block.)

- [ ] **Step 3: Make the Overview "New enquiries" stat card live-derived**

In `src/app/trainer/page.tsx`, add the import:

```tsx
import { DEMO_ENQUIRIES, enquiryStatus } from "@/lib/enquiries";
```

Compute `now` and the new-enquiry count right after `const stats = DEMO_TRAINER_STATS;`:

```tsx
  const now = new Date();
  const newEnquiryCount = DEMO_ENQUIRIES.filter(
    (e) => enquiryStatus(e, now) === "new",
  ).length;
```

Replace the "New enquiries" `StatCard` call:

```tsx
        <StatCard
          label="New enquiries"
          value={stats.newEnquiries}
          caption={stats.enquiriesNote}
        />
```

with:

```tsx
        <StatCard
          label="New enquiries"
          value={newEnquiryCount}
          caption={newEnquiryCount > 0 ? "Awaiting your reply" : "All read"}
        />
```

- [ ] **Step 4: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors (confirms no other file still references the removed `newEnquiries`/`enquiriesNote` fields).

- [ ] **Step 5: Lint**

Run: `npx eslint src/components/dashboard/nav-config.ts src/app/trainer/page.tsx src/lib/dashboard-stats.ts`
Expected: no errors.

- [ ] **Step 6: Manual check**

Run: `npm run dev` (background), log in as trainer. Expected: sidebar's "Enquiries" link is now clickable (no "Soon" hint) and navigates to the list page. Overview's "New enquiries" stat card shows `3` with caption "Awaiting your reply" (enq-1, enq-5, enq-8 are the only `new`-status seed entries per Task 1's Step 4 verification). Stop the dev server after checking.

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/nav-config.ts src/app/trainer/page.tsx src/lib/dashboard-stats.ts
git commit -m "feat: wire trainer enquiries into nav and Overview stat card"
```

---

### Task 8: Full verification pass

**Files:** none (verification only — no code changes expected).

- [ ] **Step 1: Full-repo type-check and lint**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx eslint src`
Expected: no new errors versus the pre-existing baseline (2 unrelated `react-hooks/set-state-in-effect` errors in `src/components/dev/design-tweak-panel.tsx`, already known and out of scope).

- [ ] **Step 2: Start the dev server**

Run: `npm run dev` (background)
Expected: starts without error, reachable at `http://localhost:3000`.

- [ ] **Step 3: List page — search, filter, pagination**

Log in as trainer, go to `/trainer/enquiries`. Search "Freya" narrows to 1 result (enq-1). Clear search, filter status to "Attended" — shows enq-3, enq-4, enq-7 only. Clear filter — all 8 show on one page (pagination controls hidden since 8 < `PAGE_SIZE` of 10).

- [ ] **Step 4: Detail page — reply, booking, archiving**

Open enq-1 (status "New"). Type a reply and click "Send reply" — new bubble appears immediately, right-aligned. Set a date input in the booking block to a date after 2026-07-21 (e.g. `2026-08-01`) and click "Mark as booked" — badge flips to "Booked", booking block disappears. Navigate back to the list — enq-1 still shows "New" there (the booking exists only in the detail page's local component state and does not persist back to the seed data or the list; this is expected, matching the plan's Global Constraint that nothing persists past a reload).

Open enq-5 (status "New") independently, set a date *before* 2026-07-21 (e.g. `2026-07-01`) and click "Mark as booked" — badge flips straight to "Attended" (confirms the auto-derivation from a past date, per the spec's approved design choice), booking block disappears.

Open enq-8 (status "New") and click "Archive this enquiry" — badge flips to "Archived", booking block disappears.

- [ ] **Step 5: Overview cross-check**

Reload `/trainer` (fresh page load resets all in-memory state from Steps 3-4 back to seed data). "New enquiries" stat card shows `3` with "Awaiting your reply", matching the count of "New"-badged rows on `/trainer/enquiries`.

- [ ] **Step 6: Responsive check**

Resize the browser (or use devtools device toolbar) to mobile (~375px), tablet (~768px), and desktop (~1440px) widths on both `/trainer/enquiries` and `/trainer/enquiries/enq-3`. Expected: no horizontal overflow, list card rows stack cleanly, message bubbles stay within `max-w-[80%]` at all widths, booking block's date input and button wrap on mobile rather than clipping.

- [ ] **Step 7: Empty-state check**

Temporarily edit `src/lib/enquiries.ts` so `DEMO_ENQUIRIES` is `[]`, reload `/trainer/enquiries`. Expected: "No enquiries yet" empty state, not a broken/blank page. Also check `/trainer` — "New enquiries" stat card shows `0` with "All read" caption (no crash from an empty array). Revert the edit afterward (do not commit this temporary change).

- [ ] **Step 8: Stop the dev server**

Stop the background `npm run dev` process.

No commit for this task — it's verification only, not a code change.
