"use client";

import { useRef, useState } from "react";
import type { VerificationSnapshot } from "@/lib/trainer-insights";
import { VERIFICATION_URGENCY_BADGE } from "@/lib/trainer-insights";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VerifiedSeal } from "@/components/verified-seal";

export type DocSlot = {
  id: "insurance" | "qualification" | "registration";
  label: string;
  status: "not_uploaded" | "on_file";
  verifiedNote?: string;
};

type SlotState = {
  status: "not_uploaded" | "on_file" | "pending_review";
  fileName?: string;
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
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function triggerUpload(id: DocSlot["id"]) {
    fileInputRefs.current[id]?.click();
  }

  function handleFileChange(
    id: DocSlot["id"],
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSlotStates((prev) => ({
      ...prev,
      [id]: {
        status: "pending_review",
        fileName: file.name,
        verifiedNote: undefined,
      },
    }));
    e.target.value = "";
  }

  function handleRemove(id: DocSlot["id"]) {
    setSlotStates((prev) => ({
      ...prev,
      [id]: { status: "not_uploaded", fileName: undefined, verifiedNote: undefined },
    }));
  }

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Documents</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          Keep your compliance documents up to date. Listings pause
          automatically if cover lapses.
        </p>
      </div>

      <div className="mt-5 flex max-w-md items-center gap-2.5 rounded-card border border-linen bg-paper px-5 py-4">
        <Badge variant={badge.variant}>{badge.label}</Badge>
        <span className="text-small text-ink-soft">
          {snapshot.urgency === "overdue" ? (
            <>
              Cover lapsed on{" "}
              <span className="font-medium text-error">
                {formatShortDate(snapshot.renewalDue)}
              </span>
            </>
          ) : (
            <>
              Next renewal {formatShortDate(snapshot.renewalDue)} &middot;{" "}
              {snapshot.daysUntilRenewal} days away
            </>
          )}
        </span>
      </div>

      <div className="mt-6 flex max-w-md flex-col gap-4">
        {slots.map((slot) => {
          const state = slotStates[slot.id];
          return (
            <div
              key={slot.id}
              className="rounded-card border border-linen bg-paper p-6"
            >
              <p className="eyebrow">{slot.label}</p>

              <div className="mt-3 flex items-center gap-2">
                {state.status === "on_file" && <VerifiedSeal size={16} />}
                <span className="text-micro text-stone">
                  {state.status === "not_uploaded" && "Not on file"}
                  {state.status === "on_file" &&
                    `On file · ${state.verifiedNote}`}
                  {state.status === "pending_review" &&
                    `${state.fileName} · Pending review`}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {state.status === "not_uploaded" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerUpload(slot.id)}
                  >
                    Upload
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => triggerUpload(slot.id)}
                    >
                      Replace
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(slot.id)}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>

              <input
                ref={(el) => {
                  fileInputRefs.current[slot.id] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileChange(slot.id, e)}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
