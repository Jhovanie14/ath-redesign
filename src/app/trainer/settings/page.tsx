import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccountCard } from "@/components/dashboard/settings/account-card";
import { SecurityCard } from "@/components/dashboard/settings/security-card";
import { NotificationPreferencesCard } from "@/components/dashboard/settings/notification-preferences-card";
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
      <div className="max-w-2xl">
        <h1 className="font-display text-display-md text-ink">Settings</h1>
        <p className="mt-2.5 text-body text-ink-soft">
          Manage your account, security, and notification preferences.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <AccountCard email={session.email} />
          <SecurityCard />
          <NotificationPreferencesCard />
        </div>
      </div>
    </DashboardShell>
  );
}
