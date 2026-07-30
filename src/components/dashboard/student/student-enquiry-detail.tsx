"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryMessage,
} from "@/lib/enquiries";
import { cn, formatLongDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { sendStudentReplyAction } from "@/app/student/messages/actions";

export function StudentEnquiryDetail({
  enquiry,
  now,
}: {
  enquiry: Enquiry;
  now: Date;
}) {
  const [messages, setMessages] = useState<EnquiryMessage[]>(enquiry.messages);
  const [reply, setReply] = useState("");
  const [pending, startTransition] = useTransition();

  const status = enquiryStatus(enquiry, now);
  const badge = STATUS_BADGE[status];

  function sendReply() {
    const body = reply.trim();
    if (!body) return;
    const sentAt = new Date().toISOString();
    setMessages((prev) => [...prev, { from: "student", body, sentAt }]);
    setReply("");
    startTransition(async () => {
      await sendStudentReplyAction(enquiry.id, body);
    });
  }

  return (
    <>
      <Link
        href="/student/messages"
        className="inline-flex min-h-10 items-center gap-1.5 text-small font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All messages
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md text-ink">
          {enquiry.courseTitle}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-1.5 text-body text-ink-soft">
        With Dr Amara Okafor · Started {formatLongDate(enquiry.receivedAt)}
      </p>

      <Card className="mt-8 gap-0 rounded-2xl p-0">
        <CardContent
          role="log"
          aria-label="Conversation with your trainer"
          className="flex max-h-[420px] flex-col gap-4 overflow-y-auto p-6"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[82%] rounded-2xl px-4 py-3",
                m.from === "student"
                  ? "ml-auto rounded-br-sm bg-ink text-ivory"
                  : "mr-auto rounded-bl-sm bg-linen text-ink",
              )}
            >
              <p className="text-small leading-relaxed">{m.body}</p>
              <p
                className={cn(
                  "mt-1.5 text-micro",
                  m.from === "student" ? "text-ivory/65" : "text-stone",
                )}
              >
                {new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(m.sentAt))}
              </p>
            </div>
          ))}
        </CardContent>

        {status === "archived" ? (
          <p className="border-t border-linen p-6 text-small text-ink-soft">
            This conversation has been archived by your trainer.
          </p>
        ) : (
          <div className="border-t border-linen p-6">
            <label htmlFor="student-reply" className="mb-2 block text-small font-medium text-ink-soft">
              Reply
            </label>
            <Textarea
              id="student-reply"
              placeholder="Write a message…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="min-h-[130px]"
            />
            <div className="mt-3 flex items-center justify-end">
              <Button disabled={reply.trim() === "" || pending} onClick={sendReply}>
                {pending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
