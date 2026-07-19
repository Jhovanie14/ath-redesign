"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const NAV = [
  { href: "/search", label: "Find training" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
];

function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className="flex flex-col leading-none"
      aria-label="Aesthetic Training Hub — home"
    >
      <span className="font-display text-[22px] font-medium text-ink">
        Aesthetic
      </span>
      <span className="-mt-0.5 text-[10px] font-medium uppercase tracking-[0.22em] text-stone">
        Training Hub
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300",
        scrolled
          ? "border-linen bg-ivory/80 backdrop-blur-md"
          : "border-transparent bg-ivory",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-8">
        <Wordmark />

        <nav
          aria-label="Primary"
          className="hidden items-center gap-8 md:flex"
        >
          {NAV.map((item) => {
            const active =
              item.href === "/search"
                ? pathname.startsWith("/search") ||
                  pathname.startsWith("/trainer")
                : pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-small transition-colors hover:text-ink",
                  active ? "text-ink" : "text-ink-soft",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-0 h-px w-full bg-ink" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/apply"
            className="text-small text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Button asChild size="sm">
            <Link href="/apply">List your training</Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-linen"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </DialogTrigger>
            <DialogContent position="sheet" className="p-6">
              <DialogTitle className="text-title">Menu</DialogTitle>
              <nav className="mt-5 flex flex-col" aria-label="Mobile">
                {NAV.map((item) => (
                  <DialogClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="border-b border-linen py-3.5 text-body text-ink"
                    >
                      {item.label}
                    </Link>
                  </DialogClose>
                ))}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <DialogClose asChild>
                  <Button asChild>
                    <Link href="/apply">List your training</Link>
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button asChild variant="outline">
                    <Link href="/apply">Sign in</Link>
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
}
