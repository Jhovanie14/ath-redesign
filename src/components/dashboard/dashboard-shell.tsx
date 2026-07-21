import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Session } from "@/lib/auth";
import { resolveImage } from "@/lib/media";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

export interface DashboardShellProps {
  session: Session;
  publicProfileHref?: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

// Single demo trainer account (see DEMO_ACCOUNTS in src/lib/auth.ts) — every
// trainer session belongs to this profile, so its headshot always applies.
const TRAINER_AVATAR_SLUG = "dr-amara-okafor";

export function DashboardShell({
  session,
  publicProfileHref,
  logoutAction,
  children,
}: DashboardShellProps) {
  const avatarSrc =
    session.role === "trainer"
      ? resolveImage(`trainers/headshots/${TRAINER_AVATAR_SLUG}`)
      : undefined;

  return (
    <SidebarProvider>
      <DashboardSidebar session={session} />
      <SidebarInset className="bg-ivory">
        <DashboardTopbar
          session={session}
          avatarSrc={avatarSrc}
          publicProfileHref={publicProfileHref}
          logoutAction={logoutAction}
        />
        <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
