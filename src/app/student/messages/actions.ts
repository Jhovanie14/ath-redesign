"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { appendMessage, createEnquiry } from "@/lib/enquiries";

export async function createEnquiryAction(input: {
  courseTitle: string;
  body: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const body = input.body.trim();
  if (!body) return;

  const enquiry = createEnquiry({
    studentName: session.name,
    studentEmail: session.email,
    courseTitle: input.courseTitle,
    body,
    now: new Date(),
  });

  revalidatePath("/student/messages");
  revalidatePath("/student");
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  redirect(`/student/messages/${enquiry.id}`);
}

export async function sendStudentReplyAction(enquiryId: string, body: string) {
  const session = await getSession();
  if (!session || session.role !== "student") return;

  const trimmed = body.trim();
  if (!trimmed) return;

  appendMessage(enquiryId, {
    from: "student",
    body: trimmed,
    sentAt: new Date().toISOString(),
  });

  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
}
