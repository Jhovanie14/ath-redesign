import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const NOTE_SOFT_MAX = 160;

export function AvailabilityNoteCard({
  note,
  onChange,
  onSave,
  saving,
  justSaved,
  error,
  unchanged,
}: {
  note: string;
  onChange: (value: string) => void;
  onSave: () => void;
  saving: boolean;
  justSaved: boolean;
  error: string | null;
  unchanged: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Public availability note
        </h2>
        <p className="text-small text-ink-soft">
          Let prospective students know when new dates are released or when
          you are currently accepting bookings.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <label
              htmlFor="availability-note"
              className="text-small font-medium text-ink-soft"
            >
              Availability note
            </label>
            <span
              className={cn(
                "font-data text-micro",
                note.length > NOTE_SOFT_MAX ? "text-error" : "text-stone",
              )}
            >
              {note.length} / {NOTE_SOFT_MAX}
            </span>
          </div>
          <Textarea
            id="availability-note"
            value={note}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Next cohort: March 2026"
            className={cn(
              "min-h-[120px] transition-colors duration-150",
              "hover:border-[#C9C1B5]",
              "focus-visible:border-[#B9985A] focus-visible:ring-[3px] focus-visible:ring-[rgba(185,152,90,0.14)]",
            )}
            aria-invalid={Boolean(error)}
            aria-describedby="availability-note-helper"
          />
          <p
            id="availability-note-helper"
            className="mt-1.5 text-micro text-stone"
          >
            This appears beside your booking details on your public profile.
          </p>
          {error && (
            <p role="alert" className="mt-1.5 text-micro text-error">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onSave}
            disabled={unchanged || saving}
            className="gap-2 disabled:bg-[#E8E3DA] disabled:text-[#9A9388] disabled:opacity-100"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          {justSaved && (
            <span className="flex items-center gap-1.5 text-small font-medium text-success">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
