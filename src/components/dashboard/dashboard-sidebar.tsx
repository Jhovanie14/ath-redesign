"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Session } from "@/lib/auth";
import { navForRole } from "./nav-config";

export interface DashboardSidebarProps {
  session: Session;
}

export function DashboardSidebar({ session }: DashboardSidebarProps) {
  const pathname = usePathname();
  const navItems = navForRole(session.role);

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="gap-1.5 px-4 pt-5 pb-3">
        <Link href="/" aria-label="Aesthetic Training Hub — home" className="block">
          <Image
            src="/logos/wordmark-stone.png"
            alt="Aesthetic Training Hub"
            width={1067}
            height={347}
            className="h-auto w-full"
            priority
          />
        </Link>
        <p className="eyebrow !text-stone">{session.role} dashboard</p>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;

                if (item.disabled) {
                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        disabled
                        className="cursor-not-allowed text-ivory/35 hover:bg-transparent"
                      >
                        <Icon />
                        <span>{item.label}</span>
                        <span className="ml-auto text-[10px] font-medium uppercase tracking-wide text-ivory/30">
                          Soon
                        </span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
