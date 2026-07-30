import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnquiriesForStudent } from "@/lib/enquiries";
import { getRepository } from "@/lib/repository";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentMessagesList } from "@/components/dashboard/student/student-messages-list";

export const metadata: Metadata = {
  title: "Messages",
};

const DEMO_TRAINER_SLUG = "dr-amara-okafor";

export default async function StudentMessagesPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const now = new Date();
  const enquiries = getEnquiriesForStudent(session.email);
  const trainer = await getRepository().getBySlug(DEMO_TRAINER_SLUG);
  const courseTitles = trainer?.courses.map((c) => c.title) ?? [];

  return (
    <StudentShell session={session}>
      <StudentMessagesList
        enquiries={enquiries}
        courseTitles={courseTitles}
        now={now}
      />
    </StudentShell>
  );
}
