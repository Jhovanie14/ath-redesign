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
