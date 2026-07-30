import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { listEnquiries } from "@/lib/enquiries";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EnquiriesList } from "@/components/dashboard/enquiries/enquiries-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Enquiries",
};

export default async function TrainerEnquiriesPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const now = new Date();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <h1 className="font-display text-display-md text-[#25241F]">
        Enquiries
      </h1>
      <p className="mt-1.5 text-body text-[#746F65]">
        Messages from students interested in your courses.
      </p>

      <div className="mt-8">
        <EnquiriesList enquiries={listEnquiries()} now={now} />
      </div>
    </DashboardShell>
  );
}
