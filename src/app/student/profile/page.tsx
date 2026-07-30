import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { StudentShell } from "@/components/dashboard/student/student-shell";
import { StudentProfileForm } from "@/components/dashboard/student/student-profile-form";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function StudentProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "student") {
    redirect("/student/login");
  }

  return (
    <StudentShell session={session}>
      <h1 className="font-display text-display-md text-ink">Profile</h1>
      <p className="mt-1.5 text-body text-ink-soft">
        Manage your account details.
      </p>
      <div className="mt-8 max-w-lg">
        <StudentProfileForm session={session} />
      </div>
    </StudentShell>
  );
}
