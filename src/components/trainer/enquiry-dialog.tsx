"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Trainer } from "@/lib/types";
import type { Session } from "@/lib/auth";
import { createEnquiryAction } from "@/app/student/messages/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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

export function EnquiryDialog({
  trainer,
  session,
  defaultCourseTitle,
  children,
}: {
  trainer: Trainer;
  session: Session | null;
  defaultCourseTitle?: string;
  children: React.ReactNode;
}) {
  const activeCourses = trainer.courses.filter((c) => !c.archived);
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState(
    defaultCourseTitle ?? activeCourses[0]?.title ?? "General enquiry",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const returnTo = `/trainer/${trainer.slug}`;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) {
      setError("Add a short message about what you're after.");
      return;
    }
    setError("");
    startTransition(async () => {
      await createEnquiryAction({ courseTitle: course, body: trimmed });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        {!session || session.role !== "student" ? (
          <div className="py-2">
            <DialogTitle className="text-title">
              Sign in to enquire
            </DialogTitle>
            <DialogDescription className="mt-2">
              Create a free student account or sign in to send an enquiry to{" "}
              {trainer.name}.
            </DialogDescription>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button asChild className="flex-1">
                <Link
                  href={`/student/register?next=${encodeURIComponent(returnTo)}`}
                >
                  Create account
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/student/login?next=${encodeURIComponent(returnTo)}`}>
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogTitle className="text-title">
              Ask about a course
            </DialogTitle>
            <DialogDescription className="mt-1">
              Enquiring with {trainer.name}.
            </DialogDescription>

            <p className="mt-4 text-small text-ink-soft">
              Sending as {session.name} · {session.email}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label htmlFor="enq-course" className="eyebrow mb-2 block">
                  Course
                </label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger id="enq-course" className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCourses.map((c) => (
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
                  aria-invalid={Boolean(error)}
                />
                {error && (
                  <p className="mt-1.5 text-micro text-error">{error}</p>
                )}
              </div>
            </div>

            <p className="mt-4 flex items-start gap-2 text-micro leading-relaxed text-stone">
              <span className="mt-0.5">
                <VerifiedSeal size={16} />
              </span>
              Your enquiry goes directly to the trainer through the Hub. No
              fees, no middleman.
            </p>

            <Button type="submit" className="mt-5 w-full" disabled={pending}>
              {pending ? "Sending…" : "Send enquiry"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
