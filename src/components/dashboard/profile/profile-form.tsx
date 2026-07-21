"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Monitor, Smartphone } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TrainerCard } from "@/components/trainer-card";
import { ProfileMediaSection } from "./profile-media-section";
import { SaveToast } from "./save-toast";

const HEADLINE_MAX = 80;
const BIO_MAX = 500;

/** Revoke the previous blob URL (if any) before swapping in a new one, so
 * repeated replace/remove clicks in one session don't leak object URLs. */
function replaceObjectUrl(
  prev: string | undefined,
  next: string | undefined,
) {
  if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
  return next;
}

function FieldLabel({
  htmlFor,
  required,
  count,
  children,
}: {
  htmlFor: string;
  required?: boolean;
  count?: { value: number; max: number };
  children: React.ReactNode;
}) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-small font-medium text-ink-soft">
        {children}
        {required && (
          <span aria-hidden className="ml-0.5 text-error">
            *
          </span>
        )}
      </label>
      {count && (
        <span
          className={cn(
            "font-data text-micro",
            count.value > count.max ? "text-error" : "text-stone",
          )}
        >
          {count.value}/{count.max}
        </span>
      )}
    </div>
  );
}

export function ProfileForm({
  trainer,
  coverSrc,
  headshotSrc,
  liveInSearch,
}: {
  trainer: Trainer;
  coverSrc?: string;
  headshotSrc?: string;
  liveInSearch: boolean;
}) {
  const [name, setName] = useState(trainer.name);
  const [headline, setHeadline] = useState(trainer.headline);
  const [city, setCity] = useState(trainer.city);
  const [bio, setBio] = useState(trainer.bio);
  const [coverUrl, setCoverUrl] = useState(coverSrc);
  const [headshotUrl, setHeadshotUrl] = useState(headshotSrc);

  const [savedName, setSavedName] = useState(trainer.name);
  const [savedHeadline, setSavedHeadline] = useState(trainer.headline);
  const [savedCity, setSavedCity] = useState(trainer.city);
  const [savedBio, setSavedBio] = useState(trainer.bio);
  const [savedCoverUrl, setSavedCoverUrl] = useState(coverSrc);
  const [savedHeadshotUrl, setSavedHeadshotUrl] = useState(headshotSrc);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  const nameRef = useRef<HTMLInputElement>(null);
  const headlineRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLTextAreaElement>(null);

  const unchanged =
    name.trim() === savedName.trim() &&
    headline.trim() === savedHeadline.trim() &&
    city.trim() === savedCity.trim() &&
    bio.trim() === savedBio.trim() &&
    coverUrl === savedCoverUrl &&
    headshotUrl === savedHeadshotUrl;

  // Warn on tab close / refresh while a save hasn't been made yet.
  useEffect(() => {
    if (unchanged) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unchanged]);

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 4000);
    return () => clearTimeout(t);
  }, [showToast]);

  function onCoverFileSelect(file: File) {
    setCoverUrl((prev) => replaceObjectUrl(prev, URL.createObjectURL(file)));
  }
  function onCoverRemove() {
    setCoverUrl((prev) => replaceObjectUrl(prev, undefined));
  }
  function onHeadshotFileSelect(file: File) {
    setHeadshotUrl((prev) =>
      replaceObjectUrl(prev, URL.createObjectURL(file)),
    );
  }
  function onHeadshotRemove() {
    setHeadshotUrl((prev) => replaceObjectUrl(prev, undefined));
  }

  function save() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Add your display name.";
    if (!headline.trim()) next.headline = "Add a headline.";
    if (!city.trim()) next.city = "Add a city.";
    if (!bio.trim()) next.bio = "Add a bio.";
    setErrors(next);

    if (Object.keys(next).length > 0) {
      const firstInvalidRef = next.name
        ? nameRef
        : next.headline
          ? headlineRef
          : next.city
            ? cityRef
            : bioRef;
      firstInvalidRef.current?.focus();
      return;
    }

    setSaving(true);
    // No real backend here (see src/lib/repository.ts) — a short simulated
    // delay stands in for a network round trip so the loading state is real
    // to see, not instant.
    setTimeout(() => {
      setSavedName(name);
      setSavedHeadline(headline);
      setSavedCity(city);
      setSavedBio(bio);
      setSavedCoverUrl(coverUrl);
      setSavedHeadshotUrl(headshotUrl);
      setSaving(false);
      setShowToast(true);
    }, 600);
  }

  const completionChecks = [
    name.trim().length > 0,
    headline.trim().length > 0,
    city.trim().length > 0,
    bio.trim().length > 0,
    Boolean(coverUrl),
    Boolean(headshotUrl),
  ];
  const completionPercent = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  const previewTrainer: Trainer = { ...trainer, name, headline, city, bio };

  return (
    <div className="mx-auto max-w-[1220px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">Profile</h1>
          <p className="mt-1.5 max-w-xl text-body text-ink-soft">
            Manage how your trainer profile appears to prospective students.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <Badge variant={completionPercent === 100 ? "success" : "neutral"}>
              {completionPercent === 100
                ? "Profile complete"
                : `${completionPercent}% complete`}
            </Badge>
            <Button onClick={save} disabled={unchanged || saving} className="gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
          {!unchanged && !saving && (
            <span className="text-micro text-stone">Unsaved changes</span>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[65fr_35fr] lg:items-start">
        <div className="flex flex-col gap-6">
          <ProfileMediaSection
            coverUrl={coverUrl}
            headshotUrl={headshotUrl}
            onCoverFileSelect={onCoverFileSelect}
            onCoverRemove={onCoverRemove}
            onHeadshotFileSelect={onHeadshotFileSelect}
            onHeadshotRemove={onHeadshotRemove}
          />

          <Card>
            <CardHeader>
              <CardTitle>Professional details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div>
                <FieldLabel htmlFor="profile-name" required>
                  Display name
                </FieldLabel>
                <Input
                  id="profile-name"
                  ref={nameRef}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="Dr Amara Okafor"
                  aria-invalid={Boolean(errors.name)}
                  aria-required="true"
                />
                {errors.name && (
                  <p role="alert" className="mt-1.5 text-micro text-error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel
                  htmlFor="profile-headline"
                  required
                  count={{ value: headline.length, max: HEADLINE_MAX }}
                >
                  Professional headline
                </FieldLabel>
                <Input
                  id="profile-headline"
                  ref={headlineRef}
                  value={headline}
                  onChange={(e) => {
                    setHeadline(e.target.value);
                    setErrors((prev) => ({ ...prev, headline: "" }));
                  }}
                  placeholder="Aesthetic Medical Practitioner & Trainer"
                  aria-invalid={Boolean(errors.headline)}
                  aria-required="true"
                />
                {errors.headline && (
                  <p role="alert" className="mt-1.5 text-micro text-error">
                    {errors.headline}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel htmlFor="profile-city" required>
                  City / location
                </FieldLabel>
                <Input
                  id="profile-city"
                  ref={cityRef}
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  placeholder="London"
                  aria-invalid={Boolean(errors.city)}
                  aria-required="true"
                />
                {errors.city && (
                  <p role="alert" className="mt-1.5 text-micro text-error">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel
                  htmlFor="profile-bio"
                  required
                  count={{ value: bio.length, max: BIO_MAX }}
                >
                  Bio
                </FieldLabel>
                <Textarea
                  id="profile-bio"
                  ref={bioRef}
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setErrors((prev) => ({ ...prev, bio: "" }));
                  }}
                  className="min-h-[170px]"
                  placeholder="Tell students about your background and approach."
                  aria-invalid={Boolean(errors.bio)}
                  aria-required="true"
                />
                {errors.bio && (
                  <p role="alert" className="mt-1.5 text-micro text-error">
                    {errors.bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-small leading-relaxed text-ink-soft">
                Changes you save here update your public trainer listing
                immediately for prospective students browsing the Hub.
              </p>
              <div className="mt-4 flex items-center gap-2.5">
                <Badge variant={liveInSearch ? "success" : "neutral"}>
                  {liveInSearch ? "Live in search" : "Not listed"}
                </Badge>
                <span className="text-small text-ink-soft">
                  {liveInSearch
                    ? "Your profile is visible in search results."
                    : "Your profile is currently hidden from search."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-title text-ink">
              Public profile preview
            </h2>
            <div className="flex items-center gap-1 rounded-full border border-linen bg-paper p-1">
              <button
                type="button"
                aria-label="Preview as desktop"
                aria-pressed={previewDevice === "desktop"}
                onClick={() => setPreviewDevice("desktop")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  previewDevice === "desktop"
                    ? "bg-ink text-ivory"
                    : "text-stone hover:text-ink",
                )}
              >
                <Monitor className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Preview as mobile"
                aria-pressed={previewDevice === "mobile"}
                onClick={() => setPreviewDevice("mobile")}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full transition-colors",
                  previewDevice === "mobile"
                    ? "bg-ink text-ivory"
                    : "text-stone hover:text-ink",
                )}
              >
                <Smartphone className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="sticky top-24 mt-4">
            <div
              className={cn(
                "mx-auto transition-[max-width] duration-200",
                previewDevice === "mobile" ? "max-w-[300px]" : "max-w-none",
              )}
            >
              <TrainerCard
                trainer={previewTrainer}
                coverSrc={coverUrl}
                headshotSrc={headshotUrl}
                className="border border-linen shadow-e1"
              />
            </div>

            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href={`/trainer/${trainer.slug}`}>View public profile</Link>
            </Button>

            {!unchanged && (
              <p className="mt-3 text-center text-micro text-stone">
                Previewing unsaved changes — click Save changes to publish.
              </p>
            )}
          </div>
        </div>
      </div>

      {showToast && <SaveToast message="Profile updated" />}
    </div>
  );
}
