import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toPractitioners } from "@/lib/practitioners";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PractitionersTable } from "@/components/dashboard/practitioners/practitioners-table";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Practitioners",
};

export default async function PractitionersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const trainers = await getRepository().getAll();
  const practitioners = toPractitioners(trainers, new Date());

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Practitioners</h1>

      <div className="mt-1.5">
        <PractitionersTable initialPractitioners={practitioners} />
      </div>
    </DashboardShell>
  );
}
