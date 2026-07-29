"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { appendMessage, setBookedDate, setArchived } from "@/lib/enquiries";

export async function sendTrainerReplyAction(enquiryId: string, body: string) {
  const session = await getSession();
  // No ownership check needed here (unlike the student-side reply action):
  // there is exactly one demo trainer account, and it legitimately owns
  // every enquiry in the store, so there's no cross-tenant write to guard
  // against.
  if (!session || session.role !== "trainer") return;

  const trimmed = body.trim();
  if (!trimmed) return;

  appendMessage(enquiryId, {
    from: "trainer",
    body: trimmed,
    sentAt: new Date().toISOString(),
  });

  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath("/student");
}

export async function markBookedAction(enquiryId: string, bookedDate: string) {
  const session = await getSession();
  if (!session || session.role !== "trainer") return;
  if (!bookedDate) return;
  setBookedDate(enquiryId, bookedDate);
  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath("/student");
}

export async function archiveEnquiryAction(enquiryId: string) {
  const session = await getSession();
  if (!session || session.role !== "trainer") return;
  setArchived(enquiryId, true);
  revalidatePath(`/trainer/enquiries/${enquiryId}`);
  revalidatePath("/trainer/enquiries");
  revalidatePath("/trainer");
  revalidatePath(`/student/messages/${enquiryId}`);
  revalidatePath("/student/messages");
  revalidatePath("/student");
}
