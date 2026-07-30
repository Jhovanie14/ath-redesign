import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnquiryById } from "@/lib/enquiries";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentEnquiryDetail } from "@/components/dashboard/student/student-enquiry-detail";

export const metadata: Metadata = {
  title: "Message",
};

export default async function StudentMessageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  const { id } = await params;
  const enquiry = getEnquiryById(id);
  if (!enquiry) notFound();

  // Access control between students — an id that exists but belongs to
  // someone else is treated the same as "go back to your inbox", not a
  // 404 (which would reveal the id exists) or a 403.
  if (enquiry.studentEmail.toLowerCase() !== session.email.toLowerCase()) {
    redirect("/student/messages");
  }

  const now = new Date();

  return (
    <StudentShell session={session}>
      <StudentEnquiryDetail enquiry={enquiry} now={now} />
    </StudentShell>
  );
}
