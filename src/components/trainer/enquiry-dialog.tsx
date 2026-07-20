"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Trainer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerifiedSeal } from "@/components/verified-seal";

const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EnquiryDialog({
  trainer,
  defaultCourseTitle,
  children,
}: {
  trainer: Trainer;
  defaultCourseTitle?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [course, setCourse] = useState(
    defaultCourseTitle ?? trainer.courses[0]?.title ?? "General enquiry",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function reset() {
    setSubmitted(false);
    setName("");
    setEmail("");
    setMessage("");
    setErrors({});
    setCourse(defaultCourseTitle ?? trainer.courses[0]?.title ?? "General enquiry");
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setTimeout(reset, 200);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Add your name so the trainer knows who's asking.";
    if (!EMAIL_RE.test(email)) next.email = "Enter an email the trainer can reply to.";
    if (!message.trim()) next.message = "Add a short message about what you're after.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        {submitted ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="mt-5 text-title">Enquiry sent</DialogTitle>
            <DialogDescription className="mx-auto mt-2 max-w-sm">
              Your enquiry is on its way to {trainer.name.split(" ").slice(-1)[0]}.
              Trainers typically reply within 2 working days.
            </DialogDescription>
            <DialogClose asChild>
              <Button className="mt-6">Done</Button>
            </DialogClose>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogTitle className="text-title">
              Ask about a course
            </DialogTitle>
            <DialogDescription className="mt-1">
              Enquiring with {trainer.name}.
            </DialogDescription>

            <div className="mt-6 flex flex-col gap-4">
              <div>
                <label htmlFor="enq-course" className="eyebrow mb-2 block">
                  Course
                </label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="enq-course" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {trainer.courses.map((c) => (
                      <SelectItem key={c.id} value={c.title}>
                        {c.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="General enquiry">
                      General enquiry
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="enq-name" className="eyebrow mb-2 block">
                  Your name
                </label>
                <input
                  id="enq-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={FIELD}
                  placeholder="Jordan Ellis"
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="mt-1.5 text-micro text-error">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="enq-email" className="eyebrow mb-2 block">
                  Email
                </label>
                <input
                  id="enq-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={FIELD}
                  placeholder="you@email.com"
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="mt-1.5 text-micro text-error">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="enq-message" className="eyebrow mb-2 block">
                  Message
                </label>
                <textarea
                  id="enq-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className={`${FIELD} h-auto resize-none py-2.5`}
                  placeholder="I'm looking for a first lip filler course in the spring…"
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && (
                  <p className="mt-1.5 text-micro text-error">
                    {errors.message}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-micro leading-relaxed text-stone">
              <span className="mt-0.5">
                <VerifiedSeal size={16} />
              </span>
              Your enquiry goes directly to the trainer through the Hub. No fees,
              no middleman.
            </p>

            <Button type="submit" className="mt-5 w-full">
              Send enquiry
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
