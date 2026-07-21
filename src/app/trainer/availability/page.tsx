import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getRepository } from "@/lib/repository";
import { DEMO_ENQUIRIES } from "@/lib/enquiries";
import { getUpcomingBookings } from "@/lib/trainer-insights";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { AvailabilityForm } from "@/components/dashboard/availability/availability-form";
import { UpcomingBookingsCard } from "@/components/dashboard/trainer-overview/upcoming-bookings-card";
import { logoutTrainer } from "../actions";

export const metadata: Metadata = {
  title: "Availability",
};

export default async function TrainerAvailabilityPage() {
  const session = await getSession();
  if (!session || session.role !== "trainer") {
    redirect("/trainer/login");
  }

  const trainer = await getRepository().getBySlug("dr-amara-okafor");
  if (!trainer) notFound();

  const upcomingBookings = getUpcomingBookings(DEMO_ENQUIRIES, new Date());

  return (
    <DashboardShell
      session={session}
      publicProfileHref="/trainer/dr-amara-okafor"
      logoutAction={logoutTrainer}
    >
      <AvailabilityForm initialNote={trainer.availabilityNote} />

      <div className="mt-8 max-w-md">
        <UpcomingBookingsCard bookings={upcomingBookings} />
      </div>
    </DashboardShell>
  );
}
