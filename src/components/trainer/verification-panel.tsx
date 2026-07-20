import type { Trainer } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import {
  VerificationPassport,
  type PassportRow,
} from "@/components/verification-passport";

/** The trust engine of the profile — the Verification Passport, full form. */
export function VerificationPanel({ trainer }: { trainer: Trainer }) {
  const v = trainer.verification;
  const rows: PassportRow[] = [
    { label: "Insurance in date", note: formatMonthYear(v.insuranceCheckedAt) },
    {
      label: "Qualifications checked",
      note: formatMonthYear(v.qualificationCheckedAt),
    },
  ];
  if (v.professionalRegistration) {
    rows.push({
      label: `${v.professionalRegistration.body} ${v.professionalRegistration.number} confirmed`,
      note: formatMonthYear(v.qualificationCheckedAt),
    });
  }
  rows.push({
    label: "Human review passed",
    note: formatMonthYear(v.humanReviewedAt),
  });

  return (
    <VerificationPassport
      rows={rows}
      sealSize={44}
      footer={`Renewal due ${formatMonthYear(v.nextRenewalDue)} · Listings pause automatically if cover lapses.`}
    />
  );
}
