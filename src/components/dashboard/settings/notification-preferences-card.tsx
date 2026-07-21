"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export interface NotificationRow {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

export const TRAINER_NOTIFICATION_ROWS: NotificationRow[] = [
  {
    id: "enquiries",
    label: "New student enquiries",
    description: "Get an email when a prospective student contacts you.",
    defaultOn: true,
  },
  {
    id: "bookings",
    label: "Booking confirmations & reminders",
    description: "Get an email when a session is booked or coming up soon.",
    defaultOn: true,
  },
  {
    id: "reviews",
    label: "New reviews",
    description: "Get an email when a student leaves a review.",
    defaultOn: true,
  },
  {
    id: "marketing",
    label: "Product updates & tips",
    description: "Occasional emails about new features and best practices.",
    defaultOn: false,
  },
];

export function NotificationPreferencesCard({
  rows,
}: {
  rows: NotificationRow[];
}) {
  const [state, setState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(rows.map((row) => [row.id, row.defaultOn])),
  );

  return (
    <Card>
      <CardHeader>
        <h2 className="font-sans text-[17px] font-semibold text-ink">
          Notification preferences
        </h2>
        <p className="text-small text-ink-soft">
          Choose which updates you receive by email.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-linen">
          {rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-small font-medium text-ink">{row.label}</p>
                <p className="mt-0.5 text-micro text-stone">
                  {row.description}
                </p>
              </div>
              <Switch
                checked={state[row.id]}
                onCheckedChange={(checked) =>
                  setState((prev) => ({ ...prev, [row.id]: checked }))
                }
                aria-label={row.label}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
