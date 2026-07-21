"use client";

import { useRef, useState } from "react";
import {
  BadgeCheck,
  CircleDashed,
  Clock,
  GraduationCap,
  Loader2,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RenewalUrgency } from "@/lib/practitioners";
import { VERIFICATION_URGENCY_BADGE } from "@/lib/trainer-insights";
import { cn } from "@/lib/utils";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DocSlot } from "./documents-list";

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export type SlotState = {
  status: "not_uploaded" | "on_file" | "pending_review";
  fileName?: string;
  verifiedNote?: string;
};

const DOC_ICON: Record<DocSlot["id"], LucideIcon> = {
  insurance: ShieldCheck,
  qualification: GraduationCap,
  registration: BadgeCheck,
};

function statusBadge(
  state: SlotState,
  isInsurance: boolean,
  urgency: RenewalUrgency,
): { variant: BadgeProps["variant"]; label: string; Icon: LucideIcon } {
  if (state.status === "pending_review") {
    return { variant: "warning", label: "Pending review", Icon: Clock };
  }
  if (state.status === "not_uploaded") {
    return { variant: "outline", label: "Not uploaded", Icon: CircleDashed };
  }
  if (isInsurance) {
    const b = VERIFICATION_URGENCY_BADGE[urgency];
    return {
      variant: b.variant,
      label: b.label,
      Icon: urgency === "current" ? ShieldCheck : ShieldAlert,
    };
  }
  return { variant: "success", label: "Verified", Icon: ShieldCheck };
}

function supportingLine(
  state: SlotState,
  isInsurance: boolean,
  urgency: RenewalUrgency,
): string {
  if (state.status === "not_uploaded") {
    return "Not yet uploaded — required to keep your listing active.";
  }
  if (state.status === "pending_review") {
    return `${state.fileName} · awaiting review`;
  }
  if (isInsurance) {
    if (urgency === "overdue") {
      return "Cover has lapsed — upload a renewed certificate.";
    }
    if (urgency === "due-soon") {
      return "Approved — renewal due soon.";
    }
  }
  return "Approved and on file.";
}

export function DocumentCard({
  slot,
  state,
  isInsurance,
  urgency,
  renewalDate,
  onFileSelect,
  onRemove,
}: {
  slot: DocSlot;
  state: SlotState;
  isInsurance: boolean;
  urgency: RenewalUrgency;
  /** Formatted renewal date — only set for the insurance slot. */
  renewalDate?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const Icon = DOC_ICON[slot.id];
  const badge = statusBadge(state, isInsurance, urgency);
  const line = supportingLine(state, isInsurance, urgency);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a PDF, JPG, or PNG file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is over 10MB — choose a smaller file.");
      return;
    }
    setError(null);
    setUploading(true);
    // No real backend here — a short simulated delay stands in for a
    // network round trip so the loading state is real to see, not instant.
    setTimeout(() => {
      onFileSelect(file);
      setUploading(false);
    }, 500);
  }

  function confirmRemove() {
    onRemove();
    setConfirmOpen(false);
  }

  return (
    <div className="rounded-card border border-linen bg-paper p-5 shadow-e1 transition-shadow duration-200 hover:shadow-e2 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linen/60 text-ink-soft"
          >
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-body font-semibold text-ink">{slot.label}</p>
            <p className="mt-0.5 text-small text-ink-soft">{line}</p>
          </div>
        </div>

        <Badge variant={badge.variant} className="shrink-0 gap-1">
          <badge.Icon className="h-3 w-3" />
          {badge.label}
        </Badge>
      </div>

      {(state.verifiedNote || renewalDate) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-linen pt-3 text-micro text-stone">
          {state.verifiedNote && <span>{state.verifiedNote}</span>}
          {renewalDate && (
            <span
              className={cn(
                urgency === "overdue" && "font-medium text-error",
                urgency === "due-soon" && "font-medium text-warning",
              )}
            >
              Renewal due {renewalDate}
            </span>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4">
        {state.status === "not_uploaded" ? (
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="gap-2"
            >
              {uploading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {uploading ? "Uploading…" : "Replace"}
            </Button>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="text-small font-medium text-stone transition-colors duration-150 hover:text-error focus-visible:text-error"
            >
              Remove
            </button>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-micro text-error">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleChange}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-title">
              Remove {slot.label.toLowerCase()}?
            </DialogTitle>
            <DialogDescription>
              This removes it from your file. Your listing may pause if it
              was a required document — you can upload a replacement at any
              time.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmRemove}
              className="bg-error text-ivory hover:bg-error/90"
            >
              Remove document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
