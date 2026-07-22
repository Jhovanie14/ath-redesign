"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
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
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact us" },
];

function Wordmark({
  onNavigate,
  variant = "ink",
}: {
  onNavigate?: () => void;
  /** "ink" for light backgrounds (default), "stone" for dark backgrounds. */
  variant?: "ink" | "stone";
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="Aesthetic Training Hub — home"
    >
      <Image
        src={`/logos/wordmark-${variant}.png`}
        alt="Aesthetic Training Hub"
        width={123}
        height={40}
        priority
        className="h-9 w-auto"
      />
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
      <div className="mx-auto flex h-[68px] max-w-[1600px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
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
            href="/trainer/login"
            className="text-small text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Button asChild>
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
            <DialogContent
              position="fullscreen"
              showClose={false}
              className="flex flex-col p-6"
            >
              <DialogTitle className="sr-only">Menu</DialogTitle>
              <div className="flex items-center justify-between">
                <Wordmark
                  variant="stone"
                  onNavigate={() => setOpen(false)}
                />
                <DialogClose asChild>
                  <button
                    className="flex h-11 w-11 items-center justify-center rounded-full text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </DialogClose>
              </div>

              <nav
                className="mt-16 flex flex-1 flex-col gap-1"
                aria-label="Mobile"
              >
                {NAV.map((item) => (
                  <DialogClose asChild key={item.href}>
                    <Link
                      href={item.href}
                      className="border-b border-ivory/10 py-5 font-display text-display-md text-ivory transition-colors hover:text-ivory/70"
                    >
                      {item.label}
                    </Link>
                  </DialogClose>
                ))}
              </nav>

              <div className="flex flex-col gap-3 pb-4">
                <DialogClose asChild>
                  <Button asChild variant="paper" size="lg">
                    <Link href="/apply">List your training</Link>
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button asChild variant="ghostInk" size="lg">
                    <Link href="/trainer/login">Sign in</Link>
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
