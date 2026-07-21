import Link from "next/link";
import type { Subscription } from "@/lib/billing";
import { formatGBP, formatShortDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="eyebrow !text-stone">{label}</p>
      <div className="mt-1.5 text-small text-ink">{children}</div>
    </div>
  );
}

export function SubscriptionCard({
  subscription,
}: {
  subscription: Subscription;
}) {
  const active = subscription.initialStatus === "active";

  return (
    <Card>
      <CardContent>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Plan">
            {subscription.tier === "premium" ? (
              <Badge variant="gold">Premium</Badge>
            ) : (
              <span className="text-ink">Standard</span>
            )}
          </Field>

          <Field label="Price">
            <span className="font-data font-medium">
              {formatGBP(subscription.priceGBP)}
            </span>
            <span className="text-ink-soft">
              /{subscription.cycle === "annual" ? "yr" : "mo"}
            </span>
          </Field>

          <Field label="Status">
            <Badge variant={active ? "success" : "error"}>
              {active ? "Active" : "Cancelled"}
            </Badge>
          </Field>

          <Field label="Renews">
            <span className="font-data">
              {formatShortDate(subscription.renewsOn)}
            </span>
          </Field>
        </div>

        <Link
          href="/trainer/billing"
          className="mt-5 inline-block border-t border-linen pt-5 text-small font-medium text-ink underline underline-offset-4 hover:text-ink-soft"
        >
          Manage billing &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
