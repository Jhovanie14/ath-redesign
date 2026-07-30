import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getEnquiryById } from "@/lib/enquiries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiryDetail } from "@/components/dashboard/enquiries/enquiry-detail";
import { logoutTrainer } from "../../actions";

export const metadata: Metadata = {
  title: "Enquiry",
};

export default async function TrainerEnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const { id } = await params;
  const enquiry = getEnquiryById(id);
  if (!enquiry) notFound();

  const now = new Date();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <EnquiryDetail enquiry={enquiry} now={now} />
    </DashboardShell>
  );
}
