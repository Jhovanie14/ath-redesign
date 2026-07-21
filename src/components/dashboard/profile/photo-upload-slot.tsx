"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function PhotoUploadSlot({
  label,
  previewUrl,
  shape = "landscape",
  onFileSelect,
  onRemove,
}: {
  label: string;
  previewUrl?: string;
  shape?: "landscape" | "circle";
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = "";
  }

  return (
    <div>
      <p className="eyebrow mb-2">{label}</p>
      <div
        className={cn(
          "relative overflow-hidden border border-linen bg-linen/40",
          shape === "circle"
            ? "h-20 w-20 rounded-full"
            : "h-28 w-full rounded-card",
        )}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt=""
            fill
            unoptimized={previewUrl.startsWith("blob:")}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone">
            <Camera className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Replace" : "Upload"}
        </Button>
        {previewUrl && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Remove
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
