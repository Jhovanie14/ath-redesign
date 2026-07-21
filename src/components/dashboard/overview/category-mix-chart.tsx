// src/components/dashboard/overview/category-mix-chart.tsx
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryMixDatum } from "@/lib/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CategoryMixChart({ data }: { data: CategoryMixDatum[] }) {
  const hasData = data.some((d) => d.count > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course category mix</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="var(--color-linen)" horizontal={false} />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-linen)",
                    borderRadius: 8,
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-ink)"
                  radius={[0, 3, 3, 0]}
                  barSize={14}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-10 text-center text-small text-ink-soft">
            No practitioners yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
