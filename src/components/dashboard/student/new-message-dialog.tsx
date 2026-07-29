"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import { createEnquiryAction } from "@/app/student/messages/actions";

export function NewMessageDialog({
  courseTitles,
}: {
  courseTitles: string[];
}) {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState(courseTitles[0] ?? "General enquiry");
  const [body, setBody] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    startTransition(async () => {
      await createEnquiryAction({ courseTitle: course, body: trimmed });
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New message</Button>
      </DialogTrigger>
      <DialogContent className="p-6 sm:p-8">
        <DialogTitle className="text-title">Message your trainer</DialogTitle>
        <DialogDescription className="mt-1">
          Starts a new conversation with Dr Amara Okafor.
        </DialogDescription>

        <div className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="new-message-course" className="eyebrow mb-2 block">
              Course
            </label>
            <Select value={course} onValueChange={setCourse}>
              <SelectTrigger id="new-message-course" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courseTitles.map((title) => (
                  <SelectItem key={title} value={title}>
                    {title}
                  </SelectItem>
                ))}
                <SelectItem value="General enquiry">General enquiry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="new-message-body" className="eyebrow mb-2 block">
              Message
            </label>
            <Textarea
              id="new-message-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="I'd like to ask about…"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={submit}
            disabled={pending || body.trim() === ""}
            className="w-full sm:w-auto"
          >
            {pending ? "Sending…" : "Send message"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
