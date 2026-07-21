import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toAdminReviews } from "@/lib/reviews";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ReviewsTable } from "@/components/dashboard/reviews/reviews-table";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Reviews",
};

export default async function ReviewsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const trainers = await getRepository().getAll();
  const reviews = toAdminReviews(trainers);

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Reviews</h1>

      <div className="mt-1.5">
        <ReviewsTable initialReviews={reviews} />
      </div>
    </DashboardShell>
  );
}
