import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import {
  NotificationPreferencesCard,
  STUDENT_NOTIFICATION_ROWS,
} from "@/components/dashboard/settings/notification-preferences-card";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function StudentSettingsPage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Settings</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Control how the Hub keeps you in the loop.
      </p>
      <div className="mt-8 max-w-lg">
        <NotificationPreferencesCard rows={STUDENT_NOTIFICATION_ROWS} />
      </div>
    </StudentShell>
  );
}
