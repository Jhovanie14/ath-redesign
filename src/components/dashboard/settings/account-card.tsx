"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AccountCard({ email }: { email: string }) {
  const [draft, setDraft] = useState(email);
  const [saved, setSaved] = useState(email);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const unchanged = draft.trim() === saved.trim();

  function onChange(value: string) {
    setDraft(value);
    setError(null);
    setJustSaved(false);
  }

  function save() {
    if (!draft.trim() || !draft.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    setSaving(true);
    // No real backend here (see src/lib/auth.ts) — a short simulated delay
    // stands in for a network round trip so the loading state is real to
    // see, not instant.
    setTimeout(() => {
      setSaved(draft);
      setSaving(false);
      setJustSaved(true);
    }, 500);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Account
        </h2>
        <p className="text-small text-ink-soft">
          Your login details for this dashboard.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <label
            htmlFor="settings-email"
            className="mb-2 block text-small font-medium text-ink-soft"
          >
            Email address
          </label>
          <Input
            id="settings-email"
            type="email"
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
          />
          {error && (
            <p role="alert" className="mt-1.5 text-micro text-error">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={save}
            disabled={unchanged || saving}
            className="gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save"}
          </Button>
          {justSaved && !saving && (
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
