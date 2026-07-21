"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MIN_LENGTH = 8;

function PasswordField({
  id,
  label,
  value,
  onChange,
  inputRef,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  error?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-small font-medium text-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          ref={inputRef}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone transition-colors hover:text-ink"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-micro text-error">
          {error}
        </p>
      )}
    </div>
  );
}

export function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const currentRef = useRef<HTMLInputElement>(null);
  const nextRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  function save() {
    const nextErrors: Record<string, string> = {};
    if (!current.trim()) {
      nextErrors.current = "Enter your current password.";
    } else if (next.length < MIN_LENGTH) {
      nextErrors.next = `Use at least ${MIN_LENGTH} characters.`;
    } else if (confirm !== next) {
      nextErrors.confirm = "Passwords don't match.";
    }
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstRef = nextErrors.current
        ? currentRef
        : nextErrors.next
          ? nextRef
          : confirmRef;
      firstRef.current?.focus();
      return;
    }

    setSaving(true);
    // No real backend here (see src/lib/auth.ts) — a short simulated delay
    // stands in for a network round trip. "Current password" is collected
    // for realism but not checked against anything real: there is no
    // account-mutation API to check it against.
    setTimeout(() => {
      setCurrent("");
      setNext("");
      setConfirm("");
      setSaving(false);
      setJustSaved(true);
    }, 500);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Security
        </h2>
        <p className="text-small text-ink-soft">
          Update the password you use to sign in.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <PasswordField
          id="settings-current-password"
          label="Current password"
          value={current}
          inputRef={currentRef}
          onChange={(v) => {
            setCurrent(v);
            setErrors((prev) => ({ ...prev, current: "" }));
            setJustSaved(false);
          }}
          error={errors.current}
        />
        <PasswordField
          id="settings-new-password"
          label="New password"
          value={next}
          inputRef={nextRef}
          onChange={(v) => {
            setNext(v);
            setErrors((prev) => ({ ...prev, next: "" }));
            setJustSaved(false);
          }}
          error={errors.next}
        />
        <PasswordField
          id="settings-confirm-password"
          label="Confirm new password"
          value={confirm}
          inputRef={confirmRef}
          onChange={(v) => {
            setConfirm(v);
            setErrors((prev) => ({ ...prev, confirm: "" }));
            setJustSaved(false);
          }}
          error={errors.confirm}
        />

        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving} className="gap-2">
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
