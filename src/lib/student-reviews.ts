// src/lib/student-reviews.ts
//
// A student's own reviews of attended courses, backed by a mutable
// in-memory store — same "mock now, wire up later" seam as
// enquiries.ts. Resets on server restart.
//
// These reviews are student-facing only: they are never merged into
// Trainer.reviews (src/lib/types.ts), so they don't appear on the public
// trainer profile, change the trainer's rating average, or show up on
// admin's review moderation page. That's an explicit, accepted scope
// decision — see
// docs/superpowers/specs/2026-07-30-student-module-expansion-design.md —
// not a bug to fix later.

export interface StudentReview {
  id: string;
  enquiryId: string; // one review per enquiry, enforced at write time
  studentEmail: string;
  trainerSlug: string;
  trainerName: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: string; // ISO datetime
}

let studentReviews: StudentReview[] = [];

export function getReviewsForStudent(email: string): StudentReview[] {
  const target = email.trim().toLowerCase();
  return studentReviews.filter((r) => r.studentEmail.toLowerCase() === target);
}

export function getReviewForEnquiry(enquiryId: string): StudentReview | undefined {
  return studentReviews.find((r) => r.enquiryId === enquiryId);
}

export function createStudentReview(input: {
  enquiryId: string;
  studentEmail: string;
  trainerSlug: string;
  trainerName: string;
  courseTitle: string;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  now: Date;
}): StudentReview {
  const review: StudentReview = {
    id: `rev-${input.now.getTime()}-${Math.random().toString(36).slice(2, 7)}`,
    enquiryId: input.enquiryId,
    studentEmail: input.studentEmail,
    trainerSlug: input.trainerSlug,
    trainerName: input.trainerName,
    courseTitle: input.courseTitle,
    rating: input.rating,
    body: input.body,
    createdAt: input.now.toISOString(),
  };
  studentReviews = [review, ...studentReviews];
  return review;
}
