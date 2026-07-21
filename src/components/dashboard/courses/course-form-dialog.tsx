"use client";

import { useState } from "react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type Course,
  type CourseCategory,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const FIELD_CLASS =
  "h-11 rounded-[10px] border-[#DED8CD] bg-[#FFFEFC] text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:outline-none focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)] aria-invalid:border-[#B4493F]";

interface CourseFormState {
  title: string;
  category: CourseCategory;
  priceGBP: string;
  durationDays: string;
  maxDelegates: string;
  cpdAccredited: boolean;
  summary: string;
}

function emptyForm(): CourseFormState {
  return {
    title: "",
    category: ALL_CATEGORIES[0],
    priceGBP: "",
    durationDays: "",
    maxDelegates: "",
    cpdAccredited: false,
    summary: "",
  };
}

function formFromCourse(course: Course): CourseFormState {
  return {
    title: course.title,
    category: course.category,
    priceGBP: String(course.priceGBP),
    durationDays: String(course.durationDays),
    maxDelegates: String(course.maxDelegates),
    cpdAccredited: course.cpdAccredited,
    summary: course.summary,
  };
}

export function CourseFormDialog({
  course,
  onSave,
  children,
}: {
  course?: Course;
  onSave: (course: Course) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CourseFormState>(
    course ? formFromCourse(course) : emptyForm(),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setForm(course ? formFromCourse(course) : emptyForm());
      setErrors({});
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Give the course a title.";
    if (!form.summary.trim())
      next.summary = "Add a short summary for students.";
    const price = Number(form.priceGBP);
    if (!form.priceGBP || Number.isNaN(price) || price <= 0)
      next.priceGBP = "Enter a price greater than £0.";
    const duration = Number(form.durationDays);
    if (!form.durationDays || Number.isNaN(duration) || duration <= 0)
      next.durationDays = "Enter a duration of at least 1 day.";
    const maxDelegates = Number(form.maxDelegates);
    if (!form.maxDelegates || Number.isNaN(maxDelegates) || maxDelegates <= 0)
      next.maxDelegates = "Enter at least 1 delegate.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      id: course?.id ?? crypto.randomUUID(),
      title: form.title.trim(),
      category: form.category,
      priceGBP: price,
      durationDays: duration,
      cpdAccredited: form.cpdAccredited,
      maxDelegates,
      summary: form.summary.trim(),
      archived: course?.archived ?? false,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <form onSubmit={submit} noValidate>
          <DialogTitle className="text-title">
            {course ? "Edit course" : "Add a course"}
          </DialogTitle>
          <DialogDescription className="mt-1">
            {course
              ? "Update the details students see on your listing."
              : "This appears on your public profile once saved."}
          </DialogDescription>

          <div className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="course-title"
                className="mb-2 block text-[13px] font-medium text-[#746F65]"
              >
                Title
              </label>
              <Input
                id="course-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Advanced Cheek & Midface Filler"
                aria-invalid={Boolean(errors.title)}
                className={FIELD_CLASS}
              />
              {errors.title && (
                <p className="mt-1.5 text-[13px] text-[#B4493F]">
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="course-category"
                className="mb-2 block text-[13px] font-medium text-[#746F65]"
              >
                Category
              </label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, category: v as CourseCategory }))
                }
              >
                <SelectTrigger id="course-category" className={FIELD_CLASS}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABELS[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="course-price"
                  className="mb-2 block text-[13px] font-medium text-[#746F65]"
                >
                  Price (GBP)
                </label>
                <Input
                  id="course-price"
                  type="number"
                  min="1"
                  value={form.priceGBP}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, priceGBP: e.target.value }))
                  }
                  placeholder="1450"
                  aria-invalid={Boolean(errors.priceGBP)}
                  className={FIELD_CLASS}
                />
                {errors.priceGBP && (
                  <p className="mt-1.5 text-[13px] text-[#B4493F]">
                    {errors.priceGBP}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="course-duration"
                  className="mb-2 block text-[13px] font-medium text-[#746F65]"
                >
                  Duration (days)
                </label>
                <Input
                  id="course-duration"
                  type="number"
                  min="1"
                  value={form.durationDays}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, durationDays: e.target.value }))
                  }
                  placeholder="2"
                  aria-invalid={Boolean(errors.durationDays)}
                  className={FIELD_CLASS}
                />
                {errors.durationDays && (
                  <p className="mt-1.5 text-[13px] text-[#B4493F]">
                    {errors.durationDays}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="course-max-delegates"
                className="mb-2 block text-[13px] font-medium text-[#746F65]"
              >
                Max delegates
              </label>
              <Input
                id="course-max-delegates"
                type="number"
                min="1"
                value={form.maxDelegates}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxDelegates: e.target.value }))
                }
                placeholder="4"
                aria-invalid={Boolean(errors.maxDelegates)}
                className={FIELD_CLASS}
              />
              {errors.maxDelegates && (
                <p className="mt-1.5 text-[13px] text-[#B4493F]">
                  {errors.maxDelegates}
                </p>
              )}
            </div>

            <label className="flex items-center gap-2.5 text-[14px] text-[#25241F]">
              <Checkbox
                checked={form.cpdAccredited}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, cpdAccredited: checked === true }))
                }
              />
              CPD accredited
            </label>

            <div>
              <label
                htmlFor="course-summary"
                className="mb-2 block text-[13px] font-medium text-[#746F65]"
              >
                Summary
              </label>
              <Textarea
                id="course-summary"
                rows={3}
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
                placeholder="What students will learn on this course…"
                aria-invalid={Boolean(errors.summary)}
                className="rounded-xl border-[#DED8CD] bg-[#FFFEFC] p-4 text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:outline-none focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)] aria-invalid:border-[#B4493F]"
              />
              {errors.summary && (
                <p className="mt-1.5 text-[13px] text-[#B4493F]">
                  {errors.summary}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="mt-6 w-full">
            {course ? "Save changes" : "Add course"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
