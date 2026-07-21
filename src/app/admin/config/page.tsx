import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { toCategoryUsage } from "@/lib/categories";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CategoriesTable } from "@/components/dashboard/config/categories-table";
import { logoutAdmin } from "../actions";

export const metadata: Metadata = {
  title: "Config",
};

export default async function ConfigPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const trainers = await getRepository().getAll();
  const categories = toCategoryUsage(trainers);

  return (
    <DashboardShell session={session} logoutAction={logoutAdmin}>
      <h1 className="font-display text-display-md text-ink">Config</h1>

      <div className="mt-1.5">
        <CategoriesTable initialCategories={categories} />
      </div>
    </DashboardShell>
  );
}
