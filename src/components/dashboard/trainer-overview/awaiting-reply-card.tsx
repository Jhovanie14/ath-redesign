import Link from "next/link";
import type { Enquiry } from "@/lib/enquiries";
import { formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InitialsAvatar } from "../initials-avatar";

export function AwaitingReplyCard({ enquiries }: { enquiries: Enquiry[] }) {
  const shown = enquiries.slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2.5">
          Awaiting your reply
          {enquiries.length > 0 && (
            <Badge variant="warning">{enquiries.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {shown.length === 0 ? (
          <p className="text-small text-ink-soft">
            Every enquiry has been answered. Nothing waiting on you.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((enquiry) => (
              <li key={enquiry.id}>
                <Link
                  href={`/trainer/enquiries/${enquiry.id}`}
                  className="flex items-center gap-3 rounded-xl px-1.5 py-1.5 transition-colors hover:bg-linen/60"
                >
                  <InitialsAvatar name={enquiry.studentName} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">
                      {enquiry.studentName}
                    </p>
                    <p className="truncate text-micro text-stone">
                      {enquiry.courseTitle}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-micro text-stone">
                    {formatShortDate(enquiry.receivedAt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/trainer/enquiries"
          className="mt-4 inline-block text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          Go to inbox &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
