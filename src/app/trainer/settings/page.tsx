import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccountCard } from "@/components/dashboard/settings/account-card";
import { SecurityCard } from "@/components/dashboard/settings/security-card";
import {
  NotificationPreferencesCard,
  TRAINER_NOTIFICATION_ROWS,
} from "@/components/dashboard/settings/notification-preferences-card";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function TrainerSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <div>
        <h1 className="font-display text-display-md text-[#25241F]">
          Settings
        </h1>
        <p className="mt-2.5 max-w-xl text-body text-[#746F65]">
          Manage your account, security, and notification preferences.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[60fr_40fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <AccountCard email={session.email} />
          <SecurityCard />
        </div>

        <div className="lg:sticky lg:top-24">
          <NotificationPreferencesCard rows={TRAINER_NOTIFICATION_ROWS} />
        </div>
      </div>
    </DashboardShell>
  );
}
