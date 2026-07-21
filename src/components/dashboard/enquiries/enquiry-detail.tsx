"use client";

import { useState } from "react";
import Link from "next/link";
import { Archive, ArrowLeft } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <dt className="text-[12px] text-[#A49C8E]">{label}</dt>
      <dd className="text-right text-[14px] font-medium text-[#25241F]">
        {value}
      </dd>
    </div>
  );
}

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
        className="inline-flex min-h-10 items-center gap-1.5 text-small font-medium text-[#5F5A51] transition-colors duration-150 hover:text-[#25241F] focus-visible:text-[#25241F] focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" />
        All enquiries
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-[34px] leading-tight text-[#25241F] sm:text-[42px]">
          {enquiry.studentName}
        </h1>
        <Badge
          variant={badge.variant}
          className={cn(status === "new" && "bg-[#F3E9D5] text-[#7B6030]")}
        >
          {badge.label}
        </Badge>
      </div>
      <p className="mt-1.5 text-body text-[#746F65]">
        {enquiry.courseTitle} · Received {formatLongDate(enquiry.receivedAt)}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[68fr_32fr] lg:items-start">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="font-sans text-[19px] font-semibold text-[#25241F]">
              Conversation
            </h2>
            <p className="mt-1 text-[14px] text-[#746F65]">
              Messages between you and the prospective student.
            </p>
          </div>

          <Card className="gap-0 rounded-2xl border-[#DED8CD] bg-[#FFFEFC] p-0 shadow-[0_8px_28px_rgba(40,35,28,0.045)]">
            <CardContent
              role="log"
              aria-label="Conversation with the prospective student"
              className="flex max-h-[420px] flex-col gap-4 overflow-y-auto p-6"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[82%] px-4 py-3",
                    m.from === "trainer"
                      ? "ml-auto rounded-[14px_14px_4px_14px] bg-[#292923] text-white"
                      : "mr-auto rounded-[14px_14px_14px_4px] bg-[#F3F0EA] text-[#25241F]",
                  )}
                >
                  <p className="text-[14px] leading-[1.55]">{m.body}</p>
                  <p
                    className={cn(
                      "mt-1.5 text-[12px]",
                      m.from === "trainer" ? "text-[#B9B2A2]" : "text-[#A49C8E]",
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

            <div className="border-t border-[#E7E1D8] p-6">
              <label
                htmlFor="enquiry-reply"
                className="mb-2 block text-[13px] font-medium text-[#746F65]"
              >
                Reply
              </label>
              <Textarea
                id="enquiry-reply"
                placeholder="Write a reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[130px] resize-y rounded-xl border-[#DED8CD] bg-[#FFFEFC] p-4 text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)]"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[12px] text-[#A49C8E]">
                  {reply.length > 0 ? `${reply.length} characters` : ""}
                </span>
                <Button
                  disabled={reply.trim() === ""}
                  onClick={sendReply}
                  className={cn(
                    "h-11 rounded-[10px] px-5 hover:translate-y-0 hover:shadow-none",
                    reply.trim() === "" &&
                      "disabled:bg-[#E8E3DA] disabled:text-[#9A9388] disabled:opacity-100",
                  )}
                >
                  Send reply
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:sticky lg:top-24">
          <Card className="gap-0 rounded-2xl border-[#DED8CD] bg-[#FFFEFC] p-0 shadow-[0_8px_28px_rgba(40,35,28,0.045)]">
            <CardContent className="flex flex-col gap-6 p-6">
              <div>
                <h2 className="text-[18px] font-semibold text-[#25241F]">
                  Enquiry details
                </h2>
                <dl className="mt-3 flex flex-col divide-y divide-[#E7E1D8]">
                  <MetaRow label="Student" value={enquiry.studentName} />
                  <MetaRow label="Course" value={enquiry.courseTitle} />
                  <MetaRow
                    label="Received"
                    value={formatLongDate(enquiry.receivedAt)}
                  />
                  <MetaRow label="Status" value={badge.label} />
                </dl>
              </div>

              {showBookingBlock && (
                <>
                  <div className="border-t border-[#E7E1D8] pt-6">
                    <h3 className="text-[18px] font-semibold text-[#25241F]">
                      Confirm booking
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#746F65]">
                      Confirming shares your contact details with the student
                      and schedules a review invitation after the course.
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                      <div>
                        <label
                          htmlFor="enquiry-course-date"
                          className="mb-2 block text-[13px] font-medium text-[#746F65]"
                        >
                          Course date
                        </label>
                        <Input
                          id="enquiry-course-date"
                          type="date"
                          value={dateInput}
                          onChange={(e) => setDateInput(e.target.value)}
                          className="h-[46px] w-full rounded-[10px] border-[#DED8CD] bg-[#FFFEFC] text-[15px] text-[#25241F] transition-colors hover:border-[#C9C1B5] focus-visible:border-[#B9985A] focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.14)]"
                        />
                      </div>
                      <Button
                        disabled={!dateInput}
                        onClick={markBooked}
                        className={cn(
                          "h-11 w-full rounded-[10px] hover:translate-y-0 hover:shadow-none",
                          !dateInput &&
                            "disabled:bg-[#E8E3DA] disabled:text-[#9A9388] disabled:opacity-100",
                        )}
                      >
                        Mark as booked
                      </Button>
                      {!dateInput && (
                        <p className="text-[12px] text-[#A49C8E]">
                          Select the course date to continue.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-[#E7E1D8] pt-4">
                    <button
                      type="button"
                      onClick={() => setArchived(true)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-[14px] font-medium text-[#746F65] transition-colors duration-150 hover:bg-[#F9ECEA] hover:text-[#A34F46] focus-visible:bg-[#F9ECEA] focus-visible:text-[#A34F46] focus-visible:outline-none"
                    >
                      <Archive className="h-4 w-4" />
                      Archive enquiry
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
