import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhotoUploadSlot } from "./photo-upload-slot";

export function ProfileMediaSection({
  coverUrl,
  headshotUrl,
  onCoverFileSelect,
  onCoverRemove,
  onHeadshotFileSelect,
  onHeadshotRemove,
}: {
  coverUrl?: string;
  headshotUrl?: string;
  onCoverFileSelect: (file: File) => void;
  onCoverRemove: () => void;
  onHeadshotFileSelect: (file: File) => void;
  onHeadshotRemove: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile media</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pb-14">
          <PhotoUploadSlot
            shape="banner"
            className="h-44 w-full sm:h-52"
            previewUrl={coverUrl}
            ariaLabel="cover photo"
            onFileSelect={onCoverFileSelect}
            onRemove={onCoverRemove}
          />
          {/* bottom-4 (not a negative offset): the avatar hangs 40px below
           * the cover's own edge while staying inside the pb-14 (56px)
           * reserve, leaving a clear 16px gap above the helper text. */}
          <div className="absolute bottom-4 left-6 h-24 w-24 rounded-full ring-4 ring-paper">
            <PhotoUploadSlot
              shape="circle"
              className="h-24 w-24"
              previewUrl={headshotUrl}
              ariaLabel="headshot"
              onFileSelect={onHeadshotFileSelect}
              onRemove={onHeadshotRemove}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-micro text-stone sm:flex-row sm:gap-8">
          <span>Cover: 1200×480px recommended · JPG, PNG or WEBP, up to 5MB</span>
          <span>Headshot: 400×400px square · JPG, PNG or WEBP, up to 5MB</span>
        </div>
      </CardContent>
    </Card>
  );
}
