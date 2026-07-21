import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AccountCard } from "@/components/dashboard/settings/account-card";
import { SecurityCard } from "@/components/dashboard/settings/security-card";
import {
  NotificationPreferencesCard,
  type NotificationRow,
} from "@/components/dashboard/settings/notification-preferences-card";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Settings",
};

const ADMIN_NOTIFICATION_ROWS: NotificationRow[] = [
  {
    id: "applications",
    label: "New practitioner applications",
    description: "Get an email when a new application is submitted.",
    defaultOn: true,
  },
  {
    id: "expirations",
    label: "Insurance & document expirations",
    description:
      "Get an email when a practitioner's insurance or qualifications are expiring soon.",
    defaultOn: true,
  },
  {
    id: "reviews",
    label: "New reviews to moderate",
    description: "Get an email when a student leaves a new review.",
    defaultOn: true,
  },
  {
    id: "billing",
    label: "Billing renewals & churn alerts",
    description:
      "Get an email for upcoming subscription renewals and cancellations.",
    defaultOn: false,
  },
];

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <div className="max-w-2xl">
        <h1 className="font-display text-display-md text-ink">Settings</h1>
        <p className="mt-2.5 text-body text-ink-soft">
          Manage your account, security, and notification preferences.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          <AccountCard email={session.email} />
          <SecurityCard />
          <NotificationPreferencesCard rows={ADMIN_NOTIFICATION_ROWS} />
        </div>
      </div>
    </DashboardShell>
  );
}
