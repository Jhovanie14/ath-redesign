// src/components/dashboard/overview/rating-distribution-chart.tsx
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import type { RatingDistribution } from "@/lib/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RatingDistributionChart({ counts, average }: RatingDistribution) {
  const total = counts[1] + counts[2] + counts[3] + counts[4] + counts[5];
  const data = ([5, 4, 3, 2, 1] as const).map((star) => ({
    star: `${star}★`,
    count: counts[star],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review ratings</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-small text-ink-soft">
            No reviews yet.
          </p>
        ) : (
          <>
            <p className="font-data text-display-md font-medium leading-none text-ink">
              {average.toFixed(1)}★
            </p>
            <p className="mt-1.5 text-small text-ink-soft">{total} reviews</p>
            <div className="mt-4 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid stroke="var(--color-linen)" vertical={false} />
                  <XAxis
                    dataKey="star"
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
                  <Bar
                    dataKey="count"
                    fill="var(--color-ink)"
                    radius={[3, 3, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
