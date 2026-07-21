"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AvailabilityForm({ initialNote }: { initialNote: string }) {
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [error, setError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNote(e.target.value);
    setError(null);
    setJustSaved(false);
  }

  function save() {
    if (!note.trim()) {
      setError("Add a note before saving");
      return;
    }
    setError(null);
    setSavedNote(note);
    setJustSaved(true);
  }

  const unchanged = note.trim() === savedNote.trim();

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">
          Availability
        </h1>
        <p className="mt-1.5 text-body text-ink-soft">
          This note appears on your public profile next to your booking
          details.
        </p>
      </div>

      <div className="mt-8 max-w-md rounded-card border border-linen bg-paper p-6">
        <label htmlFor="availability-note" className="eyebrow mb-2 block">
          Availability note
        </label>
        <Input
          id="availability-note"
          value={note}
          onChange={onChange}
          placeholder="Next cohort: March 2026"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="mt-1.5 text-micro text-error">{error}</p>}

        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} disabled={unchanged}>
            Save
          </Button>
          {justSaved && <span className="text-micro text-success">Saved</span>}
        </div>
      </div>
    </>
  );
}
