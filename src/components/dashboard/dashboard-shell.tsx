import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Session } from "@/lib/auth";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";

export interface DashboardShellProps {
  session: Session;
  publicProfileHref?: string;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}

export function DashboardShell({
  session,
  publicProfileHref,
  logoutAction,
  children,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar session={session} />
      <SidebarInset className="bg-ivory">
        <DashboardTopbar
          session={session}
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
