"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Session } from "@/lib/auth";
import { InitialsAvatar } from "./initials-avatar";

export interface DashboardTopbarProps {
  session: Session;
  publicProfileHref?: string;
  logoutAction: () => Promise<void>;
}

export function DashboardTopbar({
  session,
  publicProfileHref,
  logoutAction,
}: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-linen bg-ivory/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2.5 text-left transition-colors outline-none hover:bg-linen focus-visible:bg-linen">
          <InitialsAvatar name={session.name} />
          <span className="hidden sm:block">
            <span className="block text-small font-medium leading-none text-ink">
              {session.name}
            </span>
            <span className="mt-1 block truncate text-micro leading-none text-stone">
              {session.email}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-stone" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <p className="font-medium text-ink">{session.name}</p>
            <p className="mt-0.5 truncate text-micro font-normal text-stone">
              {session.email}
            </p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {publicProfileHref && (
            <DropdownMenuItem asChild>
              <Link href={publicProfileHref}>
                <ArrowUpRight />
                View public profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              void logoutAction();
            }}
          >
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
