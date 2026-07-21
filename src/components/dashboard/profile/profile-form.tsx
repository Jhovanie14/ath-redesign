"use client";

import { useState } from "react";
import type { Trainer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrainerCard } from "@/components/trainer-card";
import { PhotoUploadSlot } from "./photo-upload-slot";

/** Revoke the previous blob URL (if any) before swapping in a new one, so
 * repeated replace/remove clicks in one session don't leak object URLs. */
function replaceObjectUrl(
  prev: string | undefined,
  next: string | undefined,
) {
  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
  return next;
}

export function ProfileForm({
  trainer,
  coverSrc,
  headshotSrc,
}: {
  trainer: Trainer;
  coverSrc?: string;
  headshotSrc?: string;
}) {
  const [headline, setHeadline] = useState(trainer.headline);
  const [city, setCity] = useState(trainer.city);
  const [bio, setBio] = useState(trainer.bio);
  const [coverUrl, setCoverUrl] = useState(coverSrc);
  const [headshotUrl, setHeadshotUrl] = useState(headshotSrc);
  const [savedHeadline, setSavedHeadline] = useState(trainer.headline);
  const [savedCity, setSavedCity] = useState(trainer.city);
  const [savedBio, setSavedBio] = useState(trainer.bio);
  const [savedCoverUrl, setSavedCoverUrl] = useState(coverSrc);
  const [savedHeadshotUrl, setSavedHeadshotUrl] = useState(headshotSrc);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [justSaved, setJustSaved] = useState(false);

  function onHeadlineChange(e: React.ChangeEvent<HTMLInputElement>) {
    setHeadline(e.target.value);
    setErrors((prev) => ({ ...prev, headline: "" }));
    setJustSaved(false);
  }

  function onCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCity(e.target.value);
    setErrors((prev) => ({ ...prev, city: "" }));
    setJustSaved(false);
  }

  function onBioChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setBio(e.target.value);
    setErrors((prev) => ({ ...prev, bio: "" }));
    setJustSaved(false);
  }

  function onCoverFileSelect(file: File) {
    setCoverUrl((prev) => replaceObjectUrl(prev, URL.createObjectURL(file)));
    setJustSaved(false);
  }

  function onCoverRemove() {
    setCoverUrl((prev) => replaceObjectUrl(prev, undefined));
    setJustSaved(false);
  }

  function onHeadshotFileSelect(file: File) {
    setHeadshotUrl((prev) =>
      replaceObjectUrl(prev, URL.createObjectURL(file)),
    );
    setJustSaved(false);
  }

  function onHeadshotRemove() {
    setHeadshotUrl((prev) => replaceObjectUrl(prev, undefined));
    setJustSaved(false);
  }

  function save() {
    const next: Record<string, string> = {};
    if (!headline.trim()) next.headline = "Add a headline.";
    if (!city.trim()) next.city = "Add a city.";
    if (!bio.trim()) next.bio = "Add a bio.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSavedHeadline(headline);
    setSavedCity(city);
    setSavedBio(bio);
    setSavedCoverUrl(coverUrl);
    setSavedHeadshotUrl(headshotUrl);
    setJustSaved(true);
  }

  const unchanged =
    headline.trim() === savedHeadline.trim() &&
    city.trim() === savedCity.trim() &&
    bio.trim() === savedBio.trim() &&
    coverUrl === savedCoverUrl &&
    headshotUrl === savedHeadshotUrl;

  const previewTrainer: Trainer = {
    ...trainer,
    headline: savedHeadline,
    city: savedCity,
    bio: savedBio,
  };

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Profile</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          This information appears on your public profile.
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,26rem)_18rem] lg:items-start">
        <div className="flex flex-col gap-6 rounded-card border border-linen bg-paper p-6">
          <div className="grid grid-cols-[1fr_auto] gap-6">
            <PhotoUploadSlot
              label="Cover photo"
              previewUrl={coverUrl}
              onFileSelect={onCoverFileSelect}
              onRemove={onCoverRemove}
            />
            <PhotoUploadSlot
              label="Headshot"
              previewUrl={headshotUrl}
              shape="circle"
              onFileSelect={onHeadshotFileSelect}
              onRemove={onHeadshotRemove}
            />
          </div>

          <div>
            <label htmlFor="profile-headline" className="eyebrow mb-2 block">
              Headline
            </label>
            <Input
              id="profile-headline"
              value={headline}
              onChange={onHeadlineChange}
              placeholder="Aesthetic Medical Practitioner & Trainer"
              aria-invalid={Boolean(errors.headline)}
            />
            {errors.headline && (
              <p className="mt-1.5 text-micro text-error">
                {errors.headline}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="profile-city" className="eyebrow mb-2 block">
              City
            </label>
            <Input
              id="profile-city"
              value={city}
              onChange={onCityChange}
              placeholder="London"
              aria-invalid={Boolean(errors.city)}
            />
            {errors.city && (
              <p className="mt-1.5 text-micro text-error">{errors.city}</p>
            )}
          </div>

          <div>
            <label htmlFor="profile-bio" className="eyebrow mb-2 block">
              Bio
            </label>
            <Textarea
              id="profile-bio"
              rows={4}
              value={bio}
              onChange={onBioChange}
              placeholder="Tell students about your background and approach."
              aria-invalid={Boolean(errors.bio)}
            />
            {errors.bio && (
              <p className="mt-1.5 text-micro text-error">{errors.bio}</p>
            )}
          </div>

          <div className="mt-1 flex items-center gap-3">
            <Button onClick={save} disabled={unchanged}>
              Save
            </Button>
            {justSaved && (
              <span className="text-micro text-success">Saved</span>
            )}
          </div>
        </div>

        <div>
          <p className="eyebrow mb-3">How you appear in search</p>
          <TrainerCard
            trainer={previewTrainer}
            coverSrc={savedCoverUrl}
            headshotSrc={savedHeadshotUrl}
            className="border border-linen shadow-e1"
          />
          {!unchanged && (
            <p className="mt-3 text-micro text-stone">
              Save to update your live listing with these changes.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
