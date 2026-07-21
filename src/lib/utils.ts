import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Register the design system's custom font-size utilities so tailwind-merge
// classifies them as font-size (not text-color). Without this, a size utility
// like `text-small` is treated as a colour and evicts a real colour such as
// `text-ivory` when both appear in one class string (e.g. via cva variants),
// producing ink-on-ink buttons.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "title",
            "body",
            "small",
            "micro",
          ],
        },
      ],
    },
  },
});

/** Merge conditional class names, de-duplicating conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a GBP price with no decimals — e.g. 550 -> "£550". */
export function formatGBP(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format an ISO date as a short British month + year — e.g. "Jan 2026". */
export function formatMonthYear(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Format an ISO date as a short British date — e.g. "6 Jul 2026". */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Format an ISO date as a full British date — e.g. "14 January 2026". */
export function formatLongDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Two-letter initials from a person's name — e.g. "Dr Amara Okafor" -> "AO". */
export function initials(name: string): string {
  const parts = name
    .replace(/^(dr|mr|mrs|ms|miss|prof)\.?\s+/i, "")
    .trim()
    .split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}
