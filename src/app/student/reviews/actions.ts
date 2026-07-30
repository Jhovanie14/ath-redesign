"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { enquiryStatus, getEnquiryById } from "@/lib/enquiries";
import { createStudentReview, getReviewForEnquiry } from "@/lib/student-reviews";
import { getRepository } from "@/lib/repository";

const DEMO_TRAINER_SLUG = "dr-amara-okafor";

export interface SubmitReviewState {
  error?: string;
  success?: boolean;
}

export async function submitStudentReviewAction(
  _prevState: SubmitReviewState,
  formData: FormData,
): Promise<SubmitReviewState> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const enquiryId = String(formData.get("enquiryId") ?? "");
  const ratingRaw = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  const enquiry = getEnquiryById(enquiryId);
  if (!enquiry || enquiry.studentEmail.toLowerCase() !== session.email.toLowerCase()) {
    return { error: "That enquiry couldn't be found." };
  }
  if (enquiryStatus(enquiry, new Date()) !== "attended") {
    return { error: "You can only review a course you've attended." };
  }
  if (!Number.isInteger(ratingRaw) || ratingRaw < 1 || ratingRaw > 5) {
    return { error: "Choose a rating from 1 to 5 stars." };
  }
  if (!body) {
    return { error: "Add a few words about the course." };
  }

  const trainer = await getRepository().getBySlug(DEMO_TRAINER_SLUG);

  // This check must be the last thing evaluated before the write below, with
  // no `await` in between — otherwise two concurrent submissions for the same
  // enquiry could both pass the check before either has written its review
  // (TOCTOU race), producing two reviews for one enquiry.
  if (getReviewForEnquiry(enquiryId)) {
    return { error: "You've already reviewed this course." };
  }

  createStudentReview({
    enquiryId,
    studentEmail: session.email,
    trainerSlug: DEMO_TRAINER_SLUG,
    trainerName: trainer?.name ?? "Your trainer",
    courseTitle: enquiry.courseTitle,
    rating: ratingRaw as 1 | 2 | 3 | 4 | 5,
    body,
    now: new Date(),
  });

  revalidatePath("/student/reviews");
  return { success: true };
}
