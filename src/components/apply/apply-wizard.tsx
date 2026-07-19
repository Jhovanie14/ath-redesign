"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from "lucide-react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type CourseCategory,
} from "@/lib/types";
import { cn, formatGBP } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerifiedSeal } from "@/components/verified-seal";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

const STEPS = [
  { key: "about", label: "About you" },
  { key: "training", label: "Your training" },
  { key: "verification", label: "Verification" },
  { key: "review", label: "Review & submit" },
] as const;

interface CourseDraft {
  id: string;
  title: string;
  category: CourseCategory | "";
  price: string;
  duration: string;
  maxDelegates: string;
}

interface ApplyForm {
  name: string;
  headline: string;
  city: string;
  email: string;
  years: string;
  bio: string;
  categories: CourseCategory[];
  courses: CourseDraft[];
  regBody: "" | "GMC" | "NMC" | "GDC";
  regNumber: string;
  insuranceRenewal: string;
  insuranceConfirmed: boolean;
  qualsConfirmed: boolean;
  tier: "standard" | "premium";
  consent: boolean;
}

const emptyCourse = (id: string): CourseDraft => ({
  id,
  title: "",
  category: "",
  price: "",
  duration: "",
  maxDelegates: "",
});

const INITIAL: ApplyForm = {
  name: "",
  headline: "",
  city: "",
  email: "",
  years: "",
  bio: "",
  categories: [],
  courses: [emptyCourse("c0")],
  regBody: "",
  regNumber: "",
  insuranceRenewal: "",
  insuranceConfirmed: false,
  qualsConfirmed: false,
  tier: "standard",
  consent: false,
};

type Errors = Record<string, string>;

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="eyebrow mb-2 block">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-micro text-stone">{hint}</p>}
      {error && <p className="mt-1.5 text-micro text-error">{error}</p>}
    </div>
  );
}

export function ApplyWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ApplyForm>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [maxReached, setMaxReached] = useState(0);
  const nextCourseId = useRef(1);

  function set<K extends keyof ApplyForm>(key: K, value: ApplyForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleCategory(cat: CourseCategory) {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  }

  function updateCourse(id: string, patch: Partial<CourseDraft>) {
    setForm((f) => ({
      ...f,
      courses: f.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function addCourse() {
    setForm((f) => ({
      ...f,
      courses: [...f.courses, emptyCourse(`c${nextCourseId.current++}`)],
    }));
  }

  function removeCourse(id: string) {
    setForm((f) => ({
      ...f,
      courses: f.courses.filter((c) => c.id !== id),
    }));
  }

  function validate(current: number): Errors {
    const e: Errors = {};
    if (current === 0) {
      if (!form.name.trim()) e.name = "Add your full name.";
      if (!form.headline.trim()) e.headline = "Add a professional title.";
      if (!form.city.trim()) e.city = "Add the city you train in.";
      if (!EMAIL_RE.test(form.email)) e.email = "Enter a valid email address.";
    }
    if (current === 1) {
      if (form.categories.length === 0)
        e.categories = "Choose at least one specialism.";
      form.courses.forEach((c) => {
        if (!c.title.trim()) e[`course-${c.id}-title`] = "Add a course title.";
        if (!c.category) e[`course-${c.id}-category`] = "Choose a category.";
        if (!c.price || Number(c.price) <= 0)
          e[`course-${c.id}-price`] = "Add a price.";
      });
    }
    if (current === 2) {
      if (!form.insuranceRenewal)
        e.insuranceRenewal = "Add your insurance renewal date.";
      if (!form.insuranceConfirmed)
        e.insuranceConfirmed = "Please confirm your cover is current.";
      if (!form.qualsConfirmed)
        e.qualsConfirmed = "Please confirm your qualifications are accurate.";
      if (form.regBody && !form.regNumber.trim())
        e.regNumber = "Add your registration number.";
    }
    if (current === 3) {
      if (!form.consent) e.consent = "Please confirm before submitting.";
    }
    return e;
  }

  function goNext() {
    const e = validate(step);
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    if (step === STEPS.length - 1) {
      setSubmitted(true);
      return;
    }
    const next = step + 1;
    setStep(next);
    setMaxReached((m) => Math.max(m, next));
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  function goTo(target: number) {
    if (target <= maxReached && target < step) {
      setStep(target);
      setErrors({});
    }
  }

  if (submitted) return <SuccessView form={form} />;

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-16">
      {/* Stepper */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="eyebrow mb-4 lg:hidden">
          Step {step + 1} of {STEPS.length}
        </p>
        <ol className="hidden lg:block">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const reachable = i <= maxReached;
            return (
              <li key={s.key} className="flex items-start gap-3 pb-6 last:pb-0">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-data text-micro",
                    active && "border-ink bg-ink text-ivory",
                    done && "border-ink bg-ink text-ivory",
                    !active && !done && "border-linen bg-paper text-stone",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={!reachable || i >= step}
                  className={cn(
                    "pt-1 text-left text-small transition-colors",
                    active ? "font-medium text-ink" : "text-stone",
                    reachable && i < step && "hover:text-ink",
                    (i >= step || !reachable) && "cursor-default",
                  )}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
        {/* Mobile progress bar */}
        <div className="h-1 w-full overflow-hidden rounded-full bg-linen lg:hidden">
          <div
            className="h-full rounded-full bg-ink transition-[width] duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </aside>

      {/* Step content */}
      <div>
        <div className="rounded-card border border-linen bg-paper p-6 sm:p-8">
          <h2 className="font-display text-display-md text-ink">
            {STEPS[step].label}
          </h2>

          {step === 0 && (
            <div className="mt-6 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Full name" htmlFor="name" error={errors.name}>
                  <input
                    id="name"
                    className={FIELD}
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Dr Jordan Ellis"
                  />
                </Field>
                <Field label="City" htmlFor="city" error={errors.city}>
                  <input
                    id="city"
                    className={FIELD}
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    placeholder="Manchester"
                  />
                </Field>
              </div>
              <Field
                label="Professional title"
                htmlFor="headline"
                error={errors.headline}
                hint="How you'll be introduced — e.g. Aesthetic Nurse Prescriber & Trainer."
              >
                <input
                  id="headline"
                  className={FIELD}
                  value={form.headline}
                  onChange={(e) => set("headline", e.target.value)}
                  placeholder="Aesthetic Medical Practitioner & Trainer"
                />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Email" htmlFor="email" error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    className={FIELD}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@clinic.com"
                  />
                </Field>
                <Field
                  label="Years of experience"
                  htmlFor="years"
                  error={errors.years}
                >
                  <input
                    id="years"
                    type="number"
                    min={0}
                    className={FIELD}
                    value={form.years}
                    onChange={(e) => set("years", e.target.value)}
                    placeholder="8"
                  />
                </Field>
              </div>
              <Field
                label="Short bio"
                htmlFor="bio"
                hint="A few lines on your background and how you teach. Optional for now."
              >
                <textarea
                  id="bio"
                  rows={4}
                  className={`${FIELD} h-auto resize-none py-2.5`}
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="I moved into aesthetics after eight years in emergency medicine…"
                />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 flex flex-col gap-7">
              <div>
                <p className="eyebrow mb-3">Specialisms</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ALL_CATEGORIES.map((cat) => {
                    const checked = form.categories.includes(cat);
                    return (
                      <label
                        key={cat}
                        className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-linen bg-paper px-3 py-2.5 text-small text-ink-soft hover:border-stone/50"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        {CATEGORY_LABELS[cat]}
                      </label>
                    );
                  })}
                </div>
                {errors.categories && (
                  <p className="mt-2 text-micro text-error">{errors.categories}</p>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="eyebrow">Courses</p>
                  <span className="font-data text-micro text-stone">
                    {form.courses.length} listed
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  {form.courses.map((course, i) => (
                    <div
                      key={course.id}
                      className="rounded-xl border border-linen bg-ivory/40 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="font-data text-micro text-stone">
                          Course {i + 1}
                        </span>
                        {form.courses.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCourse(course.id)}
                            className="flex items-center gap-1 text-micro text-stone hover:text-error"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-3">
                        <Field
                          label="Title"
                          error={errors[`course-${course.id}-title`]}
                        >
                          <input
                            className={FIELD}
                            value={course.title}
                            onChange={(e) =>
                              updateCourse(course.id, { title: e.target.value })
                            }
                            placeholder="Foundation in Facial Aesthetics"
                          />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field
                            label="Category"
                            error={errors[`course-${course.id}-category`]}
                          >
                            <Select
                              value={course.category}
                              onValueChange={(v) =>
                                updateCourse(course.id, {
                                  category: v as CourseCategory,
                                })
                              }
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Choose a category" />
                              </SelectTrigger>
                              <SelectContent>
                                {ALL_CATEGORIES.map((c) => (
                                  <SelectItem key={c} value={c}>
                                    {CATEGORY_LABELS[c]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </Field>
                          <Field
                            label="Price (£)"
                            error={errors[`course-${course.id}-price`]}
                          >
                            <input
                              type="number"
                              min={0}
                              className={FIELD}
                              value={course.price}
                              onChange={(e) =>
                                updateCourse(course.id, { price: e.target.value })
                              }
                              placeholder="550"
                            />
                          </Field>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Duration (days)">
                            <input
                              type="number"
                              min={1}
                              className={FIELD}
                              value={course.duration}
                              onChange={(e) =>
                                updateCourse(course.id, {
                                  duration: e.target.value,
                                })
                              }
                              placeholder="2"
                            />
                          </Field>
                          <Field label="Max delegates">
                            <input
                              type="number"
                              min={1}
                              className={FIELD}
                              value={course.maxDelegates}
                              onChange={(e) =>
                                updateCourse(course.id, {
                                  maxDelegates: e.target.value,
                                })
                              }
                              placeholder="6"
                            />
                          </Field>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={addCourse}
                >
                  <Plus className="h-4 w-4" />
                  Add another course
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-6 flex flex-col gap-6">
              <p className="text-small leading-relaxed text-ink-soft">
                We verify every listing by hand. Share the details below — we may
                ask for certificates during review, and your listing pauses
                automatically if cover lapses.
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="Professional register"
                  hint="Optional — for doctors, nurses and dentists."
                >
                  <Select
                    value={form.regBody}
                    onValueChange={(v) =>
                      set("regBody", v as ApplyForm["regBody"])
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="None / not applicable" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GMC">GMC (doctor)</SelectItem>
                      <SelectItem value="NMC">NMC (nurse)</SelectItem>
                      <SelectItem value="GDC">GDC (dentist)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Registration number"
                  htmlFor="regNumber"
                  error={errors.regNumber}
                >
                  <input
                    id="regNumber"
                    className={FIELD}
                    value={form.regNumber}
                    onChange={(e) => set("regNumber", e.target.value)}
                    placeholder="7000199"
                    disabled={!form.regBody}
                  />
                </Field>
              </div>

              <Field
                label="Insurance renewal date"
                htmlFor="insuranceRenewal"
                error={errors.insuranceRenewal}
              >
                <input
                  id="insuranceRenewal"
                  type="date"
                  className={`${FIELD} max-w-xs`}
                  value={form.insuranceRenewal}
                  onChange={(e) => set("insuranceRenewal", e.target.value)}
                />
              </Field>

              <div className="flex flex-col gap-3 rounded-xl border border-linen bg-ivory/40 p-4">
                <label className="flex cursor-pointer items-start gap-3 text-small text-ink-soft">
                  <Checkbox
                    checked={form.insuranceConfirmed}
                    onCheckedChange={(v) =>
                      set("insuranceConfirmed", v === true)
                    }
                  />
                  I hold current medical malpractice and public liability
                  insurance, and can provide the certificate on request.
                </label>
                <label className="flex cursor-pointer items-start gap-3 text-small text-ink-soft">
                  <Checkbox
                    checked={form.qualsConfirmed}
                    onCheckedChange={(v) => set("qualsConfirmed", v === true)}
                  />
                  The qualifications behind every course I&rsquo;ve listed are
                  accurate and verifiable.
                </label>
              </div>
              {(errors.insuranceConfirmed || errors.qualsConfirmed) && (
                <p className="text-micro text-error">
                  {errors.insuranceConfirmed || errors.qualsConfirmed}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="mt-6 flex flex-col gap-7">
              <div>
                <p className="eyebrow mb-3">Choose your tier</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      {
                        key: "standard",
                        name: "Standard",
                        note: "Verified listing in search and on the map.",
                        price: "£24 / month",
                      },
                      {
                        key: "premium",
                        name: "Premium",
                        note: "Priority placement, gold frame and homepage feature.",
                        price: "£69 / month",
                      },
                    ] as const
                  ).map((t) => {
                    const active = form.tier === t.key;
                    const premium = t.key === "premium";
                    return (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => set("tier", t.key)}
                        className={cn(
                          "relative rounded-card border p-5 text-left transition-colors",
                          active
                            ? premium
                              ? "border-gold/50 bg-gold-tint/30"
                              : "border-ink bg-linen/40"
                            : "border-linen bg-paper hover:border-stone/50",
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-display text-title text-ink">
                            {t.name}
                          </span>
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border",
                              active
                                ? "border-ink bg-ink text-ivory"
                                : "border-stone/50",
                            )}
                          >
                            {active && (
                              <Check className="h-3 w-3" strokeWidth={3} />
                            )}
                          </span>
                        </div>
                        <p className="mt-1 text-small text-ink-soft">{t.note}</p>
                        <p className="mt-3 font-data text-small text-ink">
                          {t.price}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="eyebrow mb-3">Review</p>
                <dl className="divide-y divide-linen rounded-xl border border-linen">
                  <SummaryRow label="Name" value={form.name} />
                  <SummaryRow label="Title" value={form.headline} />
                  <SummaryRow label="City" value={form.city} />
                  <SummaryRow label="Email" value={form.email} />
                  <SummaryRow
                    label="Specialisms"
                    value={form.categories
                      .map((c) => CATEGORY_LABELS[c])
                      .join(", ")}
                  />
                  <SummaryRow
                    label="Courses"
                    value={form.courses
                      .filter((c) => c.title.trim())
                      .map(
                        (c) =>
                          `${c.title}${c.price ? ` · ${formatGBP(Number(c.price))}` : ""}`,
                      )
                      .join(" • ")}
                  />
                  <SummaryRow
                    label="Registration"
                    value={
                      form.regBody
                        ? `${form.regBody} ${form.regNumber}`
                        : "Not applicable"
                    }
                  />
                  <SummaryRow
                    label="Tier"
                    value={form.tier === "premium" ? "Premium" : "Standard"}
                  />
                </dl>
              </div>

              <div>
                <label className="flex cursor-pointer items-start gap-3 text-small text-ink-soft">
                  <Checkbox
                    checked={form.consent}
                    onCheckedChange={(v) => set("consent", v === true)}
                  />
                  I confirm the information above is accurate and agree to the
                  Hub&rsquo;s vetting checks. I understand I won&rsquo;t be
                  charged until my listing is approved and live.
                </label>
                {errors.consent && (
                  <p className="mt-1.5 text-micro text-error">{errors.consent}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" onClick={goNext}>
            {step === STEPS.length - 1 ? "Submit application" : "Continue"}
            {step < STEPS.length - 1 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
      <dt className="eyebrow shrink-0 sm:w-32 sm:pt-0.5">{label}</dt>
      <dd className="text-small text-ink">{value || "—"}</dd>
    </div>
  );
}

function SuccessView({ form }: { form: ApplyForm }) {
  const firstName = form.name.trim().split(/\s+/).slice(-1)[0] || "there";
  return (
    <div className="mx-auto max-w-xl py-10 text-center">
      <div className="mx-auto w-fit animate-[goldPulse_1.2s_ease-out] rounded-full">
        <VerifiedSeal size={56} title="Application received" />
      </div>
      <h2 className="mt-6 font-display text-display-lg text-ink">
        Application received.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-body leading-relaxed text-ink-soft">
        Thanks, {firstName}. We&rsquo;ll verify your insurance, qualifications
        and registration by hand and be in touch within 3 working days. You
        won&rsquo;t be charged until your {form.tier === "premium" ? "Premium" : "Standard"}{" "}
        listing is approved and live.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/how-it-works">How vetting works</Link>
        </Button>
      </div>
    </div>
  );
}
