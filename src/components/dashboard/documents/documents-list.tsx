"use client";

import { useState } from "react";
import type { VerificationSnapshot } from "@/lib/trainer-insights";
import { VERIFICATION_URGENCY_BADGE } from "@/lib/trainer-insights";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DocumentCard, type SlotState } from "./document-card";
import { CompliancePanel } from "./compliance-panel";

export type DocSlot = {
  id: "insurance" | "qualification" | "registration";
  label: string;
  status: "not_uploaded" | "on_file";
  verifiedNote?: string;
};

export function DocumentsList({
  slots,
  snapshot,
}: {
  slots: DocSlot[];
  snapshot: VerificationSnapshot;
}) {
  const badge = VERIFICATION_URGENCY_BADGE[snapshot.urgency];
  const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(
    () =>
      Object.fromEntries(
        slots.map((slot) => [
          slot.id,
          { status: slot.status, verifiedNote: slot.verifiedNote },
        ]),
      ),
  );

  function handleFileSelect(id: DocSlot["id"], file: File) {
    setSlotStates((prev) => ({
      ...prev,
      [id]: {
        status: "pending_review",
        fileName: file.name,
        verifiedNote: undefined,
      },
    }));
  }

  function handleRemove(id: DocSlot["id"]) {
    setSlotStates((prev) => ({
      ...prev,
      [id]: { status: "not_uploaded", fileName: undefined, verifiedNote: undefined },
    }));
  }

  const verifiedCount = slots.filter(
    (slot) => slotStates[slot.id].status === "on_file",
  ).length;

  return (
    <div className="mx-auto max-w-[1220px]">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md text-ink">Documents</h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-2.5 max-w-xl text-body text-ink-soft">
        Keep your compliance documents up to date. Listings pause
        automatically if cover lapses.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[68fr_32fr] lg:items-start">
        <div className="flex flex-col gap-4">
          {slots.map((slot) => {
            const isInsurance = slot.id === "insurance";
            return (
              <DocumentCard
                key={slot.id}
                slot={slot}
                state={slotStates[slot.id]}
                isInsurance={isInsurance}
                urgency={snapshot.urgency}
                renewalDate={
                  isInsurance ? formatShortDate(snapshot.renewalDue) : undefined
                }
                onFileSelect={(file) => handleFileSelect(slot.id, file)}
                onRemove={() => handleRemove(slot.id)}
              />
            );
          })}
        </div>

        <CompliancePanel
          snapshot={snapshot}
          verifiedCount={verifiedCount}
          totalCount={slots.length}
        />
      </div>
    </div>
  );
}
