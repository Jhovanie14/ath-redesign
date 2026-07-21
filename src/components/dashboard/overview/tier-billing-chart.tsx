// src/components/dashboard/overview/tier-billing-chart.tsx
"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { TierBillingMix } from "@/lib/dashboard-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TierBillingChart({ data }: { data: TierBillingMix }) {
  const total = data.tier.premium + data.tier.standard;

  const tierData = [
    { name: "Premium", value: data.tier.premium, fill: "var(--color-gold)" },
    { name: "Standard", value: data.tier.standard, fill: "var(--color-linen)" },
  ];
  const cycleData = [
    { name: "Monthly", value: data.cycle.monthly, fill: "var(--color-ink)" },
    { name: "Annual", value: data.cycle.annual, fill: "var(--color-stone)" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tier & billing mix</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-10 text-center text-small text-ink-soft">
            No active subscriptions yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={56}
                      strokeWidth={0}
                    >
                      {tierData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-small text-ink-soft">
                {data.tier.premium} Premium · {data.tier.standard} Standard
              </p>
            </div>
            <div>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cycleData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={36}
                      outerRadius={56}
                      strokeWidth={0}
                    >
                      {cycleData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-center text-small text-ink-soft">
                {data.cycle.monthly} Monthly · {data.cycle.annual} Annual
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
