"use client";

import { useState } from "react";
import type { UpcomingBooking } from "@/lib/trainer-insights";
import { AvailabilityNoteCard } from "./availability-note-card";
import { AvailabilityPreviewCard } from "./availability-preview-card";
import { UpcomingBookingsList } from "./upcoming-bookings-list";

export function AvailabilityForm({
  initialNote,
  bookings,
}: {
  initialNote: string;
  bookings: UpcomingBooking[];
}) {
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const unchanged = note.trim() === savedNote.trim();

  function onChange(value: string) {
    setNote(value);
    setError(null);
    setJustSaved(false);
  }

  function save() {
    if (!note.trim()) {
      setError("Add a note before saving");
      return;
    }
    setError(null);
    setSaving(true);
    // No real backend here (see src/lib/repository.ts) — a short simulated
    // delay stands in for a network round trip so the loading state is real
    // to see, not instant.
    setTimeout(() => {
      setSavedNote(note);
      setSaving(false);
      setJustSaved(true);
    }, 500);
  }

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">
          Availability
        </h1>
        <p className="mt-2.5 max-w-xl text-body text-ink-soft">
          This note appears on your public profile alongside your booking
          availability.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[65fr_35fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <AvailabilityNoteCard
            note={note}
            onChange={onChange}
            onSave={save}
            saving={saving}
            justSaved={justSaved && !saving}
            error={error}
            unchanged={unchanged}
          />
          <UpcomingBookingsList bookings={bookings} />
        </div>

        <AvailabilityPreviewCard note={note} />
      </div>
    </>
  );
}
