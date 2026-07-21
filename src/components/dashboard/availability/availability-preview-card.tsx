import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AvailabilityPreviewCard({ note }: { note: string }) {
  return (
    <div className="lg:sticky lg:top-24">
      <Card>
        <CardHeader>
          <h2 className="font-sans text-[17px] font-semibold text-ink">
            Public profile preview
          </h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-tint text-gold-deep"
            >
              <CalendarClock className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="eyebrow">Availability</p>
              <p className="mt-1 text-small font-medium leading-relaxed text-ink">
                {note.trim() || "No availability note yet."}
              </p>
            </div>
          </div>

          <p className="mt-4 border-t border-linen pt-4 text-small text-ink-soft">
            This is how your note appears to prospective students.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
