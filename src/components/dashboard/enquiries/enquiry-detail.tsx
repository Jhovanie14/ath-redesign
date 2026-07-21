"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  enquiryStatus,
  STATUS_BADGE,
  type Enquiry,
  type EnquiryMessage,
} from "@/lib/enquiries";
import { formatLongDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function EnquiryDetail({
  enquiry,
  now,
}: {
  enquiry: Enquiry;
  now: Date;
}) {
  const [messages, setMessages] = useState<EnquiryMessage[]>(
    enquiry.messages,
  );
  const [bookedDate, setBookedDate] = useState<string | null>(
    enquiry.bookedDate,
  );
  const [archived, setArchived] = useState(enquiry.archived);
  const [reply, setReply] = useState("");
  const [dateInput, setDateInput] = useState("");

  const status = enquiryStatus({ ...enquiry, bookedDate, archived }, now);
  const badge = STATUS_BADGE[status];
  const showBookingBlock = status === "new";

  function sendReply() {
    const body = reply.trim();
    if (!body) return;
    setMessages((prev) => [
      ...prev,
      { from: "trainer", body, sentAt: now.toISOString() },
    ]);
    setReply("");
  }

  function markBooked() {
    if (!dateInput) return;
    setBookedDate(dateInput);
  }

  return (
    <>
      <Link
        href="/trainer/enquiries"
        className="inline-flex items-center gap-1.5 text-small font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        All enquiries
      </Link>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-display-md text-ink">
          {enquiry.studentName}
        </h1>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>
      <p className="mt-1.5 text-body text-ink-soft">
        {enquiry.courseTitle} · Received {formatLongDate(enquiry.receivedAt)}
      </p>

      <Card className="mt-8">
        <CardContent className="flex flex-col gap-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.from === "trainer"
                  ? "ml-auto max-w-[80%] rounded-card bg-linen px-4 py-3"
                  : "mr-auto max-w-[80%] rounded-card bg-ivory px-4 py-3"
              }
            >
              <p className="text-small text-ink">{m.body}</p>
              <p className="mt-1.5 text-micro text-stone">
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
      </Card>

      <div className="mt-5 flex flex-col gap-3">
        <Textarea
          placeholder="Write a reply..."
          rows={3}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
        />
        <Button
          className="self-end"
          disabled={reply.trim() === ""}
          onClick={sendReply}
        >
          Send reply
        </Button>
      </div>

      {showBookingBlock && (
        <Card className="mt-5">
          <CardContent>
            <h2 className="font-display text-title text-ink">
              Confirm this enquiry
            </h2>
            <p className="mt-1.5 text-small text-ink-soft">
              Confirming shares your contact details with the student and
              books them in for a review invitation after the course.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Input
                type="date"
                value={dateInput}
                onChange={(e) => setDateInput(e.target.value)}
                className="h-11 sm:w-auto"
              />
              <Button disabled={!dateInput} onClick={markBooked}>
                Mark as booked
              </Button>
            </div>
            <button
              type="button"
              onClick={() => setArchived(true)}
              className="mt-4 block text-small font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Archive this enquiry
            </button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
