"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileForm({
  initialHeadline,
  initialCity,
  initialBio,
}: {
  initialHeadline: string;
  initialCity: string;
  initialBio: string;
}) {
  const [headline, setHeadline] = useState(initialHeadline);
  const [city, setCity] = useState(initialCity);
  const [bio, setBio] = useState(initialBio);
  const [savedHeadline, setSavedHeadline] = useState(initialHeadline);
  const [savedCity, setSavedCity] = useState(initialCity);
  const [savedBio, setSavedBio] = useState(initialBio);
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
    setJustSaved(true);
  }

  const unchanged =
    headline.trim() === savedHeadline.trim() &&
    city.trim() === savedCity.trim() &&
    bio.trim() === savedBio.trim();

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Profile</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          This information appears on your public profile.
        </p>
      </div>

      <div className="mt-8 flex max-w-md flex-col gap-4 rounded-card border border-linen bg-paper p-6">
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
            <p className="mt-1.5 text-micro text-error">{errors.headline}</p>
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
          {justSaved && <span className="text-micro text-success">Saved</span>}
        </div>
      </div>
    </>
  );
}
