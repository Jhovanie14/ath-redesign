import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toSubscriptions } from "@/lib/billing";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BillingPanel } from "@/components/dashboard/trainer-billing/billing-panel";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Billing",
};

export default async function TrainerBillingPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainers = await getRepository().getAll();
  const subscription = toSubscriptions(trainers, new Date()).find(
    (s) => s.slug === "dr-amara-okafor",
  );
  if (!subscription) notFound();

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <BillingPanel subscription={subscription} />
    </DashboardShell>
  );
}
