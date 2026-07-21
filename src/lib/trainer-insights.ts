// src/lib/trainer-insights.ts
//
// Data-shaping for the trainer Overview page. Same (data, now) -> derived
// convention as toPractitioners()/toSubscriptions()/dashboard-charts.ts.
//
// Everything here is derived from the same seed data the detail pages read,
// so Overview can never silently drift from the Enquiries, Reviews, Courses,
// or Documents pages it summarises. No synthetic padding — if a number has
// no real source it doesn't belong on this page.

import type { Course, Verification } from "./types";
import { CATEGORY_LABELS } from "./types";
import type { Enquiry } from "./enquiries";
import { enquiryStatus } from "./enquiries";
import type { RenewalUrgency } from "./practitioners";
import { renewalUrgency } from "./practitioners";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Threads still waiting on the trainer — the most recent message came from
 * the student and the thread isn't archived. Oldest first, so the person
 * who has been waiting longest is at the top.
 */
export function getAwaitingReply(enquiries: Enquiry[]): Enquiry[] {
  return enquiries
    .filter((e) => {
      if (e.archived) return false;
      const latest = e.messages[e.messages.length - 1];
      return latest?.from === "student";
    })
    .sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
}

export interface UpcomingBooking {
  id: string;
  studentName: string;
  courseTitle: string;
  bookedDate: string; // ISO date
  daysAway: number;
}

/** Confirmed bookings that haven't happened yet, soonest first. */
export function getUpcomingBookings(
  enquiries: Enquiry[],
  now: Date,
): UpcomingBooking[] {
  const upcoming: UpcomingBooking[] = [];

  for (const e of enquiries) {
    if (e.archived || e.bookedDate === null) continue;
    const when = new Date(e.bookedDate).getTime();
    if (when < now.getTime()) continue;

    upcoming.push({
      id: e.id,
      studentName: e.studentName,
      courseTitle: e.courseTitle,
      bookedDate: e.bookedDate,
      daysAway: Math.round((when - now.getTime()) / MS_PER_DAY),
    });
  }

  return upcoming.sort((a, b) => a.daysAway - b.daysAway);
}

export interface EnquiryActivityPoint {
  month: string; // e.g. "Jul 2026"
  received: number;
  booked: number;
}

/**
 * Enquiries received per month across the trailing `months` window, and how
 * many of them converted to a booking. Real counts bucketed from
 * `receivedAt` — enquiries older than the window are simply not counted.
 */
export function getEnquiryActivity(
  enquiries: Enquiry[],
  now: Date,
  months = 6,
): EnquiryActivityPoint[] {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  });

  const points: EnquiryActivityPoint[] = [];
  const indexByMonth = new Map<string, number>();

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    indexByMonth.set(`${d.getFullYear()}-${d.getMonth()}`, points.length);
    points.push({ month: fmt.format(d), received: 0, booked: 0 });
  }

  for (const e of enquiries) {
    const d = new Date(e.receivedAt);
    const at = indexByMonth.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (at === undefined) continue; // outside the window

    points[at].received += 1;
    if (e.bookedDate !== null) points[at].booked += 1;
  }

  return points;
}

export interface EnquiryFunnel {
  total: number;
  replied: number;
  booked: number;
  attended: number;
  /** (booked + attended) / total, 0..1. Zero when there are no enquiries. */
  conversionRate: number;
}

/** Headline conversion numbers across all non-archived enquiries. */
export function getEnquiryFunnel(
  enquiries: Enquiry[],
  now: Date,
): EnquiryFunnel {
  const live = enquiries.filter((e) => !e.archived);
  const replied = live.filter((e) =>
    e.messages.some((m) => m.from === "trainer"),
  ).length;

  let booked = 0;
  let attended = 0;
  for (const e of live) {
    const status = enquiryStatus(e, now);
    if (status === "booked") booked += 1;
    if (status === "attended") attended += 1;
  }

  const total = live.length;
  return {
    total,
    replied,
    booked,
    attended,
    conversionRate: total === 0 ? 0 : (booked + attended) / total,
  };
}

export interface CourseLineupDatum {
  title: string;
  category: string;
  priceGBP: number;
  durationDays: number;
  maxDelegates: number;
  cpdAccredited: boolean;
}

/** Active (non-archived) courses, most expensive first. Real data. */
export function getCourseLineup(courses: Course[]): CourseLineupDatum[] {
  return courses
    .filter((c) => !c.archived)
    .map((c) => ({
      title: c.title,
      category: CATEGORY_LABELS[c.category],
      priceGBP: c.priceGBP,
      durationDays: c.durationDays,
      maxDelegates: c.maxDelegates,
      cpdAccredited: c.cpdAccredited,
    }))
    .sort((a, b) => b.priceGBP - a.priceGBP);
}

export interface VerificationSnapshot {
  renewalDue: string; // ISO date
  daysUntilRenewal: number;
  urgency: RenewalUrgency;
  insuranceCheckedAt: string;
  qualificationCheckedAt: string;
  regBody?: string;
  regNumber?: string;
}

/**
 * The trainer's own view of the verification data the admin Practitioners
 * table already surfaces — same renewalUrgency() thresholds, so both sides
 * agree on what counts as "due soon".
 */
export function getVerificationSnapshot(
  verification: Verification,
  now: Date,
): VerificationSnapshot {
  const daysUntilRenewal = Math.round(
    (new Date(verification.nextRenewalDue).getTime() - now.getTime()) /
      MS_PER_DAY,
  );

  return {
    renewalDue: verification.nextRenewalDue,
    daysUntilRenewal,
    urgency: renewalUrgency(daysUntilRenewal),
    insuranceCheckedAt: verification.insuranceCheckedAt,
    qualificationCheckedAt: verification.qualificationCheckedAt,
    regBody: verification.professionalRegistration?.body,
    regNumber: verification.professionalRegistration?.number,
  };
}
