"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MIN_LENGTH = 8;

const fieldClassName =
  "h-[46px] rounded-[10px] border-[#DED8CD] bg-[#FFFEFC] pr-11 text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)] aria-invalid:border-[#B4493F]";

function PasswordField({
  id,
  label,
  value,
  onChange,
  inputRef,
  error,
  helperText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  error?: string;
  helperText?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[13px] font-medium text-[#746F65]"
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
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-helper` : undefined
          }
          className={fieldClassName}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={
            visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`
          }
          className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-[#A49C8E] transition-colors hover:text-[#25241F] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.18)]"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-[#B4493F]">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="mt-1.5 text-[13px] text-[#A49C8E]">
          {helperText}
        </p>
      ) : null}
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
    <Card className="gap-0 rounded-2xl border-[#DED8CD] bg-[#FFFEFC] p-0 shadow-[0_8px_28px_rgba(40,35,28,0.045)]">
      <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
        <h2 className="font-sans text-[19px] font-semibold text-[#25241F]">
          Password and security
        </h2>
        <p className="text-[14px] text-[#746F65]">
          Update the password used to access your dashboard.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 px-7 pt-6 pb-7">
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
          helperText="Use at least 8 characters."
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

        <div className="flex items-center gap-3 border-t border-[#E7E1D8] pt-6">
          <Button
            onClick={save}
            disabled={saving}
            className="h-11 gap-2 rounded-[10px] hover:translate-y-0 hover:shadow-none"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Updating…" : "Update password"}
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
