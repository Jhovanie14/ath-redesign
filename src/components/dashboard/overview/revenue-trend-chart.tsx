"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/dashboard-charts";
import { formatGBP } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue & signups</CardTitle>
        <CardDescription>
          Illustrative — full history will be available once billing events
          are tracked. The most recent month matches the live stats above.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
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
                yAxisId="mrr"
                tickFormatter={(v: number) => formatGBP(v)}
                tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={72}
              />
              <YAxis
                yAxisId="signups"
                orientation="right"
                allowDecimals={false}
                tick={{ fill: "var(--color-stone)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip
                formatter={
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (value: any, name: any) =>
                    name === "mrrGBP"
                      ? [formatGBP(value || 0), "MRR"]
                      : [value || 0, "New signups"]
                }
                contentStyle={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-linen)",
                  borderRadius: 8,
                }}
              />
              <Area
                yAxisId="mrr"
                type="monotone"
                dataKey="mrrGBP"
                stroke="var(--color-ink)"
                fill="var(--color-ink)"
                fillOpacity={0.12}
                strokeWidth={2}
              />
              <Bar
                yAxisId="signups"
                dataKey="signups"
                fill="var(--color-stone)"
                radius={[3, 3, 0, 0]}
                barSize={12}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
