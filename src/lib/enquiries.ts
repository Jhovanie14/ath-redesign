// src/lib/enquiries.ts
//
// Trainer enquiry inbox + student messaging thread, backed by a mutable
// in-memory store (same "mock now, wire up later" seam as students.ts) —
// there is still no real backend, but replies from either side now
// persist for the lifetime of the running server. The public-facing
// EnquiryDialog (src/components/trainer/enquiry-dialog.tsx) remains
// unconnected to this store — out of scope, see
// docs/superpowers/specs/2026-07-29-student-module-design.md.

import type { BadgeProps } from "@/components/ui/badge";

export interface EnquiryMessage {
  from: "student" | "trainer";
  body: string;
  sentAt: string; // ISO datetime
}

export interface Enquiry {
  id: string;
  studentName: string;
  studentEmail: string; // links an enquiry to a student account
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

const seedEnquiries: Enquiry[] = [
  {
    id: "enq-1",
    studentName: "Freya Marsh",
    studentEmail: "student@ath.demo",
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
    studentEmail: "callum.reid@example.com",
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
    studentEmail: "priti.anand@example.com",
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
    studentEmail: "owen.blackwood@example.com",
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
    studentEmail: "nadia.hussein@example.com",
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
    studentEmail: "ben.okoro@example.com",
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
    studentEmail: "sadia.karim@example.com",
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
    studentEmail: "tomasz.nowak@example.com",
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
  {
    id: "enq-9",
    studentName: "Freya Marsh",
    studentEmail: "student@ath.demo",
    courseTitle: "Jawline & Chin Definition",
    receivedAt: "2026-07-05",
    messages: [
      {
        from: "student",
        body: "Hi, I saw you also run Jawline & Chin Definition — do you have anything in September, and does it suit someone who's only done anti-wrinkle so far?",
        sentAt: "2026-07-05T11:20:00",
      },
      {
        from: "trainer",
        body: "Hi Freya, yes — I've got a small-group date opening up in September. It's aimed at practitioners with at least foundation-level injecting experience, so anti-wrinkle alone should be fine as long as you're comfortable with needle handling.",
        sentAt: "2026-07-05T15:40:00",
      },
    ],
    bookedDate: null,
    archived: false,
  },
];

let enquiries: Enquiry[] = seedEnquiries;

export function listEnquiries(): Enquiry[] {
  return enquiries;
}

export function getEnquiryById(id: string): Enquiry | undefined {
  return enquiries.find((e) => e.id === id);
}

export function getEnquiriesForStudent(email: string): Enquiry[] {
  const target = email.trim().toLowerCase();
  return enquiries.filter((e) => e.studentEmail.toLowerCase() === target);
}

export function appendMessage(
  id: string,
  message: EnquiryMessage,
): Enquiry | undefined {
  const index = enquiries.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const updated: Enquiry = {
    ...enquiries[index],
    messages: [...enquiries[index].messages, message],
  };
  enquiries = [
    ...enquiries.slice(0, index),
    updated,
    ...enquiries.slice(index + 1),
  ];
  return updated;
}

export function createEnquiry(input: {
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  body: string;
  now: Date;
}): Enquiry {
  const enquiry: Enquiry = {
    id: `enq-${input.now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    studentName: input.studentName,
    studentEmail: input.studentEmail,
    courseTitle: input.courseTitle,
    receivedAt: input.now.toISOString().slice(0, 10),
    messages: [{ from: "student", body: input.body, sentAt: input.now.toISOString() }],
    bookedDate: null,
    archived: false,
  };
  enquiries = [enquiry, ...enquiries];
  return enquiry;
}
