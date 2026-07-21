import Link from "next/link";
import type { UpcomingBooking } from "@/lib/trainer-insights";
import { formatShortDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** "in 3 days" / "tomorrow" / "today" — relative is easier to act on than a
 * bare date for something this close to the front of the queue. */
function relativeDay(daysAway: number): string {
  if (daysAway <= 0) return "Today";
  if (daysAway === 1) return "Tomorrow";
  if (daysAway < 7) return `In ${daysAway} days`;
  if (daysAway < 14) return "Next week";
  return `In ${Math.round(daysAway / 7)} weeks`;
}

export function UpcomingBookingsCard({
  bookings,
}: {
  bookings: UpcomingBooking[];
}) {
  const shown = bookings.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-small text-ink-soft">
            No confirmed dates ahead. Booked enquiries will show up here.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((booking) => (
              <li
                key={booking.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">
                    {booking.studentName}
                  </p>
                  <p className="truncate text-micro text-stone">
                    {booking.courseTitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="whitespace-nowrap text-small font-medium text-ink">
                    {relativeDay(booking.daysAway)}
                  </p>
                  <p className="whitespace-nowrap font-data text-micro text-stone">
                    {formatShortDate(booking.bookedDate)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/trainer/availability"
          className="mt-4 inline-block text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          Manage availability &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
