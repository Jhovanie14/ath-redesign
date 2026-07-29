"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { appendMessage } from "@/lib/enquiries";

export async function sendTrainerReplyAction(enquiryId: string, body: string) {
  const session = await getSession();
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
