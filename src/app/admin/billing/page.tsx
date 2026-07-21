import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toSubscriptions } from "@/lib/billing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BillingTable } from "@/components/dashboard/billing/billing-table";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function BillingPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const trainers = await getRepository().getAll();
  const subscriptions = toSubscriptions(trainers, new Date());

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Billing</h1>

      <div className="mt-1.5">
        <BillingTable initialSubscriptions={subscriptions} />
      </div>
    </DashboardShell>
  );
}
