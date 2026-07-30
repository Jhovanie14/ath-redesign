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

export const STUDENT_NOTIFICATION_ROWS: NotificationRow[] = [
  {
    id: "replies",
    label: "Replies to your enquiries",
    description: "Get an email when a trainer replies to your message.",
    defaultOn: true,
  },
  {
    id: "sessions",
    label: "Session reminders",
    description: "Get an email reminder as a booked course date approaches.",
    defaultOn: true,
  },
  {
    id: "saved-trainers",
    label: "New courses from trainers you've saved",
    description: "Get an email when a saved trainer adds a new course.",
    defaultOn: false,
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
    <Card className="gap-0 rounded-2xl border-[#DED8CD] bg-[#FFFEFC] p-0 shadow-[0_8px_28px_rgba(40,35,28,0.045)]">
      <CardHeader className="gap-1.5 px-7 pt-7 pb-0">
        <h2 className="font-sans text-[19px] font-semibold text-[#25241F]">
          Notification preferences
        </h2>
        <p className="text-[14px] text-[#746F65]">
          Choose which updates you receive by email.
        </p>
      </CardHeader>
      <CardContent className="px-7 pt-4 pb-7">
        <div className="flex flex-col divide-y divide-[#E7E1D8]">
          {rows.map((row) => {
            const id = `notif-${row.id}`;
            return (
              <label
                key={row.id}
                htmlFor={id}
                className="flex min-h-[68px] cursor-pointer items-center justify-between gap-4 py-[18px] first:pt-0 last:pb-0"
              >
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold text-[#25241F]">
                    {row.label}
                  </span>
                  <span className="mt-1 block text-[13px] text-[#746F65]">
                    {row.description}
                  </span>
                </span>
                <Switch
                  id={id}
                  checked={state[row.id]}
                  onCheckedChange={(checked) =>
                    setState((prev) => ({ ...prev, [row.id]: checked }))
                  }
                />
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
