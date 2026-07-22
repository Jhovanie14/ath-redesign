"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <Card className="gap-0 rounded-2xl border-[#DED8CD] bg-[#FFFEFC] p-0 shadow-[0_8px_28px_rgba(40,35,28,0.045)]">
      <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
        <h2 className="font-sans text-[19px] font-semibold text-[#25241F]">
          Account
        </h2>
        <p className="text-[14px] text-[#746F65]">
          Manage the email address associated with your dashboard.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 px-7 pt-6 pb-7">
        <div>
          <label
            htmlFor="settings-email"
            className="mb-2 block text-[13px] font-medium text-[#746F65]"
          >
            Email address
          </label>
          <Input
            id="settings-email"
            type="email"
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "settings-email-error" : undefined}
            className="h-[46px] rounded-[10px] border-[#DED8CD] bg-[#FFFEFC] text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)] aria-invalid:border-[#B4493F]"
          />
          {error && (
            <p
              id="settings-email-error"
              role="alert"
              className="mt-1.5 text-[13px] text-[#B4493F]"
            >
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-[#E7E1D8] pt-6">
          <Button
            onClick={save}
            disabled={unchanged || saving}
            className={cn(
              "h-11 gap-2 rounded-[10px] hover:translate-y-0 hover:shadow-none",
              unchanged &&
                !saving &&
                "disabled:bg-[#E8E3DA] disabled:text-[#9A9388] disabled:opacity-100",
            )}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving…" : "Save account changes"}
          </Button>
          {justSaved && !saving && (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-[#4F7658]">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
