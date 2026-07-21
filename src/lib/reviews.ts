import type { Trainer } from "./types";

export type ReviewStatus = "visible" | "hidden";

export interface AdminReview {
  id: string;
  practitionerName: string;
  practitionerSlug: string;
  studentInitials: string;
  rating: 1 | 2 | 3 | 4 | 5;
  courseTitle: string;
  date: string; // ISO
  body: string;
  /** Always "visible" — no seed review starts hidden. */
  initialStatus: ReviewStatus;
}

export function toAdminReviews(trainers: Trainer[]): AdminReview[] {
  return trainers
    .flatMap((t) =>
      t.reviews.map(
        (r): AdminReview => ({
          id: r.id,
          practitionerName: t.name,
          practitionerSlug: t.slug,
          studentInitials: r.studentInitials,
          rating: r.rating,
          courseTitle: r.courseTitle,
          date: r.date,
          body: r.body,
          initialStatus: "visible",
        }),
      ),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}
