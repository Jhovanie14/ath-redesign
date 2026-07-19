"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Global spring — still used by framer-driven micro-animations elsewhere
// (results grid entrance, verification passport seal).
export const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;

/**
 * Reveals its element once it scrolls into view by toggling `is-visible`.
 * The fade + rise is a CSS transition (compositor-driven), so — unlike a
 * requestAnimationFrame loop — it can never stall part-way and leave content
 * stuck at a fractional opacity. Falls back to visible if IO is unavailable.
 */
function useReveal<T extends HTMLElement>(amount = 0.2) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.classList.add("is-visible");
            io.unobserve(el);
          }
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [amount]);
  return ref;
}

export interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Entrance delay in seconds. */
  delay?: number;
  /** Viewport fraction that must be visible before revealing. */
  amount?: number;
}

/** Fade + 24px rise on scroll into view. Opacity-only under reduced motion. */
export function Reveal({ children, className, delay = 0, amount = 0.2 }: RevealProps) {
  const ref = useReveal<HTMLDivElement>(amount);
  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay * 1000}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/** Staggers its RevealItem children by 60ms as each scrolls into view. */
export function RevealGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<RevealItemProps>, {
              _delay: i * 0.06,
            })
          : child,
      )}
    </div>
  );
}

interface RevealItemProps {
  children: React.ReactNode;
  className?: string;
  /** Injected by RevealGroup — stagger delay in seconds. */
  _delay?: number;
}

export function RevealItem({ children, className, _delay = 0 }: RevealItemProps) {
  const ref = useReveal<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      data-reveal
      className={cn(className)}
      style={
        _delay
          ? ({ "--reveal-delay": `${_delay * 1000}ms` } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </div>
  );
}
