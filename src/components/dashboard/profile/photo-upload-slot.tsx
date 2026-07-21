"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function PhotoUploadSlot({
  previewUrl,
  shape,
  ariaLabel,
  className,
  onFileSelect,
  onRemove,
}: {
  previewUrl?: string;
  shape: "banner" | "circle";
  /** e.g. "cover photo" / "headshot" — used to build accessible button labels. */
  ariaLabel: string;
  className?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is over 5MB — choose a smaller file.");
      return;
    }
    setError(null);
    setBroken(false);
    onFileSelect(file);
  }

  return (
    <div className={cn("group/photo relative", className)}>
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border border-linen bg-linen/50",
          shape === "circle" ? "rounded-full" : "rounded-card",
        )}
      >
        {previewUrl && !broken ? (
          <Image
            src={previewUrl}
            alt={`Current ${ariaLabel}`}
            fill
            unoptimized={previewUrl.startsWith("blob:")}
            className="object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-stone">
            <Camera className={shape === "circle" ? "h-5 w-5" : "h-6 w-6"} />
            {broken && (
              <span className="px-2 text-center text-micro text-error">
                Couldn&rsquo;t load that image
              </span>
            )}
          </div>
        )}
      </div>

      <div
        className={cn(
          "absolute flex items-center gap-1.5",
          shape === "circle" ? "-bottom-1 -right-1" : "bottom-3 right-3",
        )}
      >
        <button
          type="button"
          aria-label={`${previewUrl ? "Replace" : "Upload"} ${ariaLabel}`}
          onClick={() => inputRef.current?.click()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-ivory shadow-e1 outline-none transition-all hover:scale-105 hover:bg-ink focus-visible:scale-105 focus-visible:bg-ink"
        >
          {previewUrl ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Camera className="h-4 w-4" />
          )}
        </button>
        {previewUrl && (
          <button
            type="button"
            aria-label={`Remove ${ariaLabel}`}
            onClick={() => {
              setError(null);
              setBroken(false);
              onRemove();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-ivory shadow-e1 outline-none transition-all hover:scale-105 hover:bg-error focus-visible:scale-105 focus-visible:bg-error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={handleChange}
      />

      {error && (
        <p
          role="alert"
          className={cn(
            "mt-2 text-micro text-error",
            shape === "circle" && "absolute top-full left-1/2 w-40 -translate-x-1/2 text-center",
          )}
        >
          {error}
        </p>
      )}
    </div>
  );
}
