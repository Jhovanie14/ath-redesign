"use client";

import { CheckCircle2 } from "lucide-react";

export function SaveToast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 right-6 z-50 flex items-center gap-3 rounded-card border border-linen bg-paper px-5 py-4 shadow-e2 animate-[chatPanelIn_0.3s_ease-out]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <p className="text-small font-medium text-ink">{message}</p>
    </div>
  );
}
