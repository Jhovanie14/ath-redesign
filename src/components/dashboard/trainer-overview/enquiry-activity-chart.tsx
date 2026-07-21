"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  EnquiryActivityPoint,
  EnquiryFunnel,
} from "@/lib/trainer-insights";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function FunnelStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow !text-stone">{label}</p>
      <p className="mt-1.5 font-data text-title font-medium leading-none text-ink">
        {value}
      </p>
    </div>
  );
}

export function EnquiryActivityChart({
  data,
  funnel,
}: {
  data: EnquiryActivityPoint[];
  funnel: EnquiryFunnel;
}) {
  const hasActivity = data.some((d) => d.received > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enquiry activity</CardTitle>
        <CardDescription>
          Enquiries received each month and how many turned into a booking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-5 border-b border-linen pb-5 sm:grid-cols-4">
          <FunnelStat label="Enquiries" value={String(funnel.total)} />
          <FunnelStat label="Replied" value={String(funnel.replied)} />
          <FunnelStat
            label="Booked"
            value={String(funnel.booked + funnel.attended)}
          />
          <FunnelStat
            label="Conversion"
            value={`${Math.round(funnel.conversionRate * 100)}%`}
          />
        </div>

        {hasActivity ? (
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-linen)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                  axisLine={{ stroke: "var(--color-linen)" }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-linen)",
                    borderRadius: 8,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="received"
                  name="Received"
                  stroke="var(--color-ink)"
                  fill="var(--color-ink)"
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
                <Bar
                  dataKey="booked"
                  name="Booked"
                  fill="var(--color-stone)"
                  radius={[3, 3, 0, 0]}
                  barSize={16}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-small text-ink-soft">
            No enquiries in the last six months yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
