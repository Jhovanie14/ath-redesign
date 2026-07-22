"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImagePlus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  /** e.g. "cover photo" / "headshot" — used to build accessible labels and copy. */
  ariaLabel: string;
  className?: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broken, setBroken] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);

  const isBanner = shape === "banner";

  function onOpenChange(next: boolean) {
    setDialogOpen(next);
    if (!next) {
      setError(null);
      setConfirmingRemove(false);
      setDragActive(false);
    }
  }

  function validateAndSelect(file: File) {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) validateAndSelect(file);
  }

  function handleDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSelect(file);
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "relative h-full w-full overflow-hidden border border-linen bg-linen/50",
          isBanner ? "rounded-[18px] shadow-e1" : "rounded-full",
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
            <Camera className={isBanner ? "h-6 w-6" : "h-5 w-5"} />
            {broken && (
              <span className="px-2 text-center text-micro text-error">
                Couldn&rsquo;t load that image
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        aria-label={`Change ${ariaLabel}`}
        onClick={() => setDialogOpen(true)}
        className={cn(
          "absolute flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-ivory/10 bg-ink/[0.88] text-ivory shadow-e2 outline-none transition-[background-color,box-shadow] duration-[180ms] ease-out hover:bg-[#35342c] focus-visible:bg-[#35342c] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.18)]",
          isBanner
            ? "bottom-3.5 right-3.5 h-9 w-9"
            : "-bottom-1.5 -right-1.5 h-8 w-8",
        )}
      >
        <Pencil className="h-4 w-4" />
      </button>

      <Dialog open={dialogOpen} onOpenChange={onOpenChange}>
        <DialogContent className="p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-title">
              {previewUrl ? `Update ${ariaLabel}` : `Add ${ariaLabel}`}
            </DialogTitle>
            <DialogDescription>
              Drag and drop an image, or click below to browse. Changes apply
              to your draft — save your profile to publish them.
            </DialogDescription>
          </DialogHeader>

          <button
            type="button"
            aria-label={`Drop or browse to upload ${ariaLabel}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={cn(
              "group relative mt-6 flex w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed text-center outline-none transition-colors duration-200",
              isBanner ? "aspect-[21/9]" : "mx-auto aspect-square w-40",
              dragActive
                ? "border-gold bg-gold-tint/40"
                : "border-linen bg-ivory/60 hover:border-stone/60",
              "focus-visible:border-gold focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.18)]",
            )}
          >
            {previewUrl && !broken ? (
              <>
                <Image
                  src={previewUrl}
                  alt=""
                  fill
                  unoptimized={previewUrl.startsWith("blob:")}
                  className="object-cover"
                />
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-ink/55 text-ivory opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
                    dragActive && "opacity-100",
                  )}
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-small font-medium">
                    Drop or click to replace
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-stone">
                <ImagePlus className="h-6 w-6" />
                <span className="text-small font-medium text-ink-soft">
                  Drag and drop, or click to browse
                </span>
                <span className="text-micro text-stone">
                  {isBanner ? "1200×480px recommended" : "400×400px square"}{" "}
                  · JPG, PNG or WEBP, up to 5MB
                </span>
              </div>
            )}
          </button>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={handleChange}
          />

          {error && (
            <p role="alert" className="mt-3 text-small text-error">
              {error}
            </p>
          )}

          {previewUrl && (
            <div className="mt-4 flex items-center justify-center">
              {confirmingRemove ? (
                <div className="flex items-center gap-3 text-small">
                  <span className="text-ink-soft">Remove this photo?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onRemove();
                      setConfirmingRemove(false);
                    }}
                    className="font-medium text-error hover:underline"
                  >
                    Remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingRemove(false)}
                    className="text-stone hover:text-ink-soft"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingRemove(true)}
                  className="text-small text-stone transition-colors hover:text-error"
                >
                  Remove photo
                </button>
              )}
            </div>
          )}

          <DialogFooter className="mt-7">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
