import { Card, CardContent } from "@/components/ui/card";

export interface StatCardProps {
  label: string;
  value: string | number;
  caption: string;
}

export function StatCard({ label, value, caption }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <p className="eyebrow !text-stone">{label}</p>
        <p className="mt-2 font-data text-display-md font-medium leading-none text-ink">
          {value}
        </p>
        <p className="mt-2.5 text-small text-ink-soft">{caption}</p>
      </CardContent>
    </Card>
  );
}
