"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { InitialsAvatar } from "@/components/dashboard/initials-avatar";
import { navForRole } from "@/components/dashboard/nav-config";
import { logoutStudent } from "@/app/student/actions";
import type { Session } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function StudentShell({
  session,
  children,
}: {
  session: Session;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const navItems = navForRole(session.role);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col bg-ivory">
      <header className="sticky top-0 z-10 border-b border-linen bg-ivory/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-6 sm:px-10 lg:px-12">
          <div className="flex items-center gap-8">
            <Link href="/" aria-label="Aesthetic Training Hub — home">
              <Image
                src="/logos/wordmark-ink.png"
                alt="Aesthetic Training Hub"
                width={123}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-small font-medium transition-colors",
                      active
                        ? "bg-linen text-ink"
                        : "text-ink-soft hover:bg-linen/60 hover:text-ink",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-linen lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

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
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    void logoutStudent();
                  }}
                >
                  <LogOut />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 px-4 pb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-small font-medium transition-colors",
                    active
                      ? "bg-linen text-ink"
                      : "text-ink-soft hover:bg-linen/60 hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
        {children}
      </main>
    </div>
  );
}
