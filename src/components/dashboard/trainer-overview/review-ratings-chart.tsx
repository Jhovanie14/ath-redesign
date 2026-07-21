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
import type { RatingDistribution } from "@/lib/dashboard-charts";
import { RatingStars } from "@/components/rating-stars";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * The headline figures are the trainer's own `rating`/`reviewCount` — the
 * same numbers the Reviews page and public profile show — so Overview can't
 * contradict them. The histogram below covers only the reviews actually
 * published on the listing, which is a smaller set, and says so explicitly
 * rather than silently implying the two counts are the same.
 */
export function ReviewRatingsChart({
  rating,
  reviewCount,
  distribution,
}: {
  rating: number;
  reviewCount: number;
  distribution: RatingDistribution;
}) {
  const { counts } = distribution;
  const published = counts[1] + counts[2] + counts[3] + counts[4] + counts[5];

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
        <div className="flex items-baseline gap-3">
          <span className="font-data text-display-md font-medium leading-none text-ink">
            {rating.toFixed(1)}
          </span>
          <div className="flex flex-col gap-1">
            <RatingStars rating={rating} size={16} />
            <span className="font-data text-micro text-stone">
              {reviewCount} verified review{reviewCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {published === 0 ? (
          <p className="py-12 text-center text-small text-ink-soft">
            No published reviews yet.
          </p>
        ) : (
          <>
            <div className="mt-5 h-[200px]">
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
                  <Tooltip
                    cursor={{ fill: "var(--color-linen)", fillOpacity: 0.4 }}
                    contentStyle={{
                      background: "var(--color-paper)",
                      border: "1px solid var(--color-linen)",
                      borderRadius: 8,
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Reviews"
                    fill="var(--color-ink)"
                    radius={[3, 3, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="mt-3 text-micro text-stone">
              Spread across the {published} review
              {published === 1 ? "" : "s"} published on your listing.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
