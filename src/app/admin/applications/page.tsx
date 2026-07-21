import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DEMO_APPLICATIONS } from "@/lib/applications";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ApplicationsTable } from "@/components/dashboard/applications/applications-table";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Applications",
};

export default async function ApplicationsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const applications = [...DEMO_APPLICATIONS].sort((a, b) =>
    a.submittedAt.localeCompare(b.submittedAt),
  );

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Applications</h1>

      <div className="mt-1.5">
        <ApplicationsTable initialApplications={applications} />
      </div>
    </DashboardShell>
  );
}
