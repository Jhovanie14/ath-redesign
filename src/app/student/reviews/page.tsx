import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { enquiryStatus, getEnquiriesForStudent } from "@/lib/enquiries";
import { getReviewForEnquiry, getReviewsForStudent } from "@/lib/student-reviews";
import { formatShortDate } from "@/lib/utils";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { LeaveReviewDialog } from "@/components/dashboard/student/leave-review-dialog";
import { RatingStars } from "@/components/rating-stars";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

export const metadata: Metadata = {
  title: "Reviews",
};

export default async function StudentReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const reviewable = enquiries.filter(
    (e) => enquiryStatus(e, now) === "attended" && !getReviewForEnquiry(e.id),
  );
  const reviews = getReviewsForStudent(session.email);

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Reviews</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Share feedback on courses you&rsquo;ve attended.
      </p>

      <h2 className="mt-10 font-display text-title text-ink">
        Courses you can review
      </h2>
      <div className="mt-4">
        {reviewable.length === 0 ? (
          <EmptyState
            title="Nothing to review yet"
            description="Once a booked course date has passed, it'll show up here for you to review."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {reviewable.map((enquiry) => (
              <Card key={enquiry.id} className="rounded-2xl p-0">
                <CardContent className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink">
                      {enquiry.courseTitle}
                    </p>
                    {enquiry.bookedDate && (
                      <p className="mt-0.5 text-small text-ink-soft">
                        Attended {formatShortDate(enquiry.bookedDate)}
                      </p>
                    )}
                  </div>
                  <LeaveReviewDialog
                    enquiryId={enquiry.id}
                    courseTitle={enquiry.courseTitle}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-10 font-display text-title text-ink">Your reviews</h2>
      <div className="mt-4">
        {reviews.length === 0 ? (
          <EmptyState
            title="You haven't left any reviews"
            description="Reviews you submit for attended courses will appear here."
          />
        ) : (
          <div className="flex flex-col gap-2.5">
            {reviews.map((review) => (
              <Card key={review.id} className="rounded-2xl p-0">
                <CardContent className="px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-medium text-ink">{review.courseTitle}</p>
                    <p className="shrink-0 whitespace-nowrap text-micro text-stone">
                      {formatShortDate(review.createdAt)}
                    </p>
                  </div>
                  <RatingStars rating={review.rating} size={14} className="mt-2" />
                  <p className="mt-2 text-small text-ink-soft">{review.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
