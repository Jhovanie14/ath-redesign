import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { formatMonthYear } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  DocumentsList,
  type DocSlot,
} from "@/components/dashboard/documents/documents-list";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Documents",
};

export default async function TrainerDocumentsPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  const v = trainer.verification;
  const slots: DocSlot[] = [
    {
      id: "insurance",
      label: "Insurance certificate",
      status: "on_file",
      verifiedNote: `Verified ${formatMonthYear(v.insuranceCheckedAt)}`,
    },
    {
      id: "qualification",
      label: "Qualification certificate",
      status: "on_file",
      verifiedNote: `Verified ${formatMonthYear(v.qualificationCheckedAt)}`,
    },
    {
      id: "registration",
      label: "Professional registration proof",
      status: v.professionalRegistration ? "on_file" : "not_uploaded",
      verifiedNote: v.professionalRegistration
        ? `Verified ${formatMonthYear(v.qualificationCheckedAt)}`
        : undefined,
    },
  ];

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <DocumentsList slots={slots} />
    </DashboardShell>
  );
}
