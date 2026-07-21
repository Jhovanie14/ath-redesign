"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type TooltipValueType,
  XAxis,
  YAxis,
} from "recharts";
import type { CourseLineupDatum } from "@/lib/trainer-insights";
import { formatGBP } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Horizontal bars — course titles are long, and a vertical axis keeps them
 * readable without rotating labels or truncating on narrow screens. */
export function CourseLineupChart({ data }: { data: CourseLineupDatum[] }) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course lineup</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-12 text-center text-small text-ink-soft">
            No active courses listed yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const highest = data[0].priceGBP;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course lineup</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: Math.max(200, data.length * 46) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 56, left: 0, bottom: 0 }}
            >
              <CartesianGrid stroke="var(--color-linen)" horizontal={false} />
              <XAxis
                type="number"
                dataKey="priceGBP"
                tickFormatter={(v: number) => formatGBP(v)}
                tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                axisLine={{ stroke: "var(--color-linen)" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="title"
                tick={{ fill: "var(--color-ink-soft)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={150}
              />
              <Tooltip
                cursor={{ fill: "var(--color-linen)", fillOpacity: 0.4 }}
                formatter={(value: TooltipValueType | undefined) => [
                  formatGBP(typeof value === "number" ? value : 0),
                  "Price",
                ]}
                contentStyle={{
                  background: "var(--color-paper)",
                  border: "1px solid var(--color-linen)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="priceGBP" radius={[0, 3, 3, 0]} barSize={18}>
                {data.map((course) => (
                  <Cell
                    key={course.title}
                    fill={
                      course.priceGBP === highest
                        ? "var(--color-ink)"
                        : "var(--color-stone)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-3 text-micro text-stone">
          {data.length} active course{data.length === 1 ? "" : "s"} &middot;{" "}
          {data.filter((c) => c.cpdAccredited).length} CPD accredited
        </p>
      </CardContent>
    </Card>
  );
}
