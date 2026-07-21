import { Calendar } from "lucide-react";
import type { UpcomingBooking } from "@/lib/trainer-insights";
import { relativeDay } from "@/components/dashboard/trainer-overview/upcoming-bookings-card";
import { formatShortDate } from "@/lib/utils";

function DateBlock({ iso }: { iso: string }) {
  const date = new Date(iso);
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-GB", { month: "short" })
    .format(date)
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[10px] bg-gold-tint py-2.5 text-[#6F5730]"
    >
      <span className="text-[11px] font-medium">{month}</span>
      <span className="font-display text-2xl leading-none">{day}</span>
    </div>
  );
}

export function UpcomingBookingsList({
  bookings,
}: {
  bookings: UpcomingBooking[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-title text-ink">
            Upcoming bookings
          </h2>
          <p className="mt-1 text-small text-ink-soft">
            Your next confirmed training sessions.
          </p>
        </div>
        {bookings.length > 0 && (
          <span className="text-small font-medium text-stone">
            {bookings.length} upcoming
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-[14px] border border-[#E3DDD3] bg-paper px-6 py-10 text-center">
          <span
            aria-hidden="true"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-linen/60 text-stone"
          >
            <Calendar className="h-5 w-5" />
          </span>
          <p className="font-medium text-ink">No upcoming bookings</p>
          <p className="text-small text-ink-soft">
            Confirmed training sessions will appear here.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex min-h-[82px] items-start gap-4 rounded-[14px] border border-[#E3DDD3] bg-paper p-5 sm:items-center"
            >
              <DateBlock iso={booking.bookedDate} />
              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-[16px] font-semibold text-ink">
                    {booking.studentName}
                  </p>
                  <p className="truncate text-[14px] text-ink-soft">
                    {booking.courseTitle}
                  </p>
                </div>
                <div className="shrink-0 sm:text-right">
                  <p className="text-[14px] font-medium text-ink">
                    {relativeDay(booking.daysAway)}
                  </p>
                  <p className="mt-0.5 text-[13px] text-stone">
                    {formatShortDate(booking.bookedDate)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
