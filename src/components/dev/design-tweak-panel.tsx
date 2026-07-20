"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronDown, Palette, X } from "lucide-react";

/**
 * Temporary, dev-only floating panel for live-previewing brand themes and
 * comparing the Home hero variants. Colors write straight to the CSS custom
 * properties every Tailwind utility already resolves through (globals.css),
 * so a change here is visible across the whole site instantly — no rebuild.
 *
 * Delete this file + its import in layout.tsx once the design is locked in.
 */

const TOKENS = [
  { key: "--ivory", label: "Ivory" },
  { key: "--paper", label: "Paper" },
  { key: "--linen", label: "Linen" },
  { key: "--stone", label: "Stone" },
  { key: "--ink", label: "Ink" },
  { key: "--ink-soft", label: "Ink soft" },
  { key: "--gold", label: "Gold" },
  { key: "--gold-deep", label: "Gold deep" },
  { key: "--gold-tint", label: "Gold tint" },
] as const;

/**
 * Full palette sets, one click each. `ink`/`ink-soft` carry primary-text
 * weight, `gold`/`gold-deep`/`gold-tint` carry the accent role (verification
 * seals, Premium), `ivory`/`paper`/`linen`/`stone` carry the grounds — same
 * structural roles across every theme, different hues, so the existing
 * layout re-skins cleanly no matter which one is active.
 *
 * "Shipped" is the real brand — always first, doubles as the reset action.
 * Add more themes here (e.g. from a reference image) the same shape.
 */
const THEMES = [
  {
    id: "shipped",
    name: "Shipped",
    swatch: "#26251f",
    tokens: {
      "--ivory": "#f4f2ed",
      "--paper": "#fdfcfa",
      "--linen": "#eae6dd",
      "--stone": "#a9a190",
      "--ink": "#26251f",
      "--ink-soft": "#4a4840",
      "--gold": "#b99a5b",
      "--gold-deep": "#9a7d40",
      "--gold-tint": "#f3ecdd",
    },
  },
  {
    id: "nourish",
    name: "Nourish · sage & cream",
    swatch: "#8fa083",
    tokens: {
      "--ivory": "#f4eee3",
      "--paper": "#fbf8f2",
      "--linen": "#e6e0d0",
      "--stone": "#ada48d",
      "--ink": "#3e4a32",
      "--ink-soft": "#58634a",
      "--gold": "#8fa083",
      "--gold-deep": "#6f8060",
      "--gold-tint": "#e8eddf",
    },
  },
  {
    id: "karigari",
    name: "Karigari · espresso & olive gold",
    swatch: "#a38b4a",
    tokens: {
      "--ivory": "#f2ece0",
      "--paper": "#fbf8f3",
      "--linen": "#e5dcc9",
      "--stone": "#b0a08a",
      "--ink": "#362820",
      "--ink-soft": "#5a4838",
      "--gold": "#a38b4a",
      "--gold-deep": "#8a7238",
      "--gold-tint": "#efe9d3",
    },
  },
] as const;

const STORAGE_KEY = "ath-design-tweaks";

function themeMatching(values: Record<string, string>) {
  const match = THEMES.find((theme) =>
    TOKENS.every(
      (t) => values[t.key]?.toLowerCase() === theme.tokens[t.key].toLowerCase(),
    ),
  );
  return match?.id ?? "custom";
}

export function DesignTweakPanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fineTune, setFineTune] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    () => THEMES[0].tokens as Record<string, string>,
  );
  const [heroVariant, setHeroVariant] = useState<"split" | "overlay">("split");
  const router = useRouter();
  const pathname = usePathname();

  // Runs client-only, after hydration — restores any saved tweaks and reads
  // the current ?hero= param without needing useSearchParams (which would
  // force every page into dynamic rendering just for this dev tool).
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, string>;
        setValues((v) => ({ ...v, ...parsed }));
        Object.entries(parsed).forEach(([k, val]) =>
          document.documentElement.style.setProperty(k, val),
        );
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHeroVariant(params.get("hero") === "overlay" ? "overlay" : "split");
  }, [pathname]);

  if (process.env.NODE_ENV === "production" || !mounted) return null;

  function applyTokens(tokens: Record<string, string>) {
    setValues((v) => {
      const next = { ...v, ...tokens };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
    Object.entries(tokens).forEach(([k, val]) =>
      document.documentElement.style.setProperty(k, val),
    );
  }

  function setHero(variant: "split" | "overlay") {
    const params = new URLSearchParams(window.location.search);
    if (variant === "split") params.delete("hero");
    else params.set("hero", "overlay");
    setHeroVariant(variant);
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  }

  const activeThemeId = themeMatching(values);

  // left-20 (not left-4) clears Next's own dev-tools indicator, which sits
  // in this same bottom-left corner at ~22px from the edge.
  return (
    <div className="fixed bottom-4 left-20 z-[999]">
      {open ? (
        <div className="w-72 rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-white shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">
              Design tweaks · dev only
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close design tweaks"
              className="text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Theme selector — the primary control */}
          <div className="mt-3 flex flex-col gap-1.5">
            {THEMES.map((theme) => {
              const active = activeThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => applyTokens(theme.tokens as Record<string, string>)}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "border-white bg-white/10"
                      : "border-neutral-700 hover:bg-neutral-800"
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-4 w-4 shrink-0 rounded-full border border-white/30"
                    style={{ background: theme.swatch }}
                  />
                  <span className="flex-1 text-neutral-100">{theme.name}</span>
                  {active && <Check className="h-4 w-4 shrink-0 text-white" />}
                </button>
              );
            })}
            {activeThemeId === "custom" && (
              <p className="px-1 text-[11px] text-neutral-500">
                Custom — a color below has been fine-tuned off-theme.
              </p>
            )}
          </div>

          {pathname === "/" && (
            <div className="mt-4 border-t border-neutral-700 pt-3">
              <span className="text-[11px] uppercase tracking-wide text-neutral-400">
                Home hero
              </span>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setHero("split")}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    heroVariant === "split"
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Split
                </button>
                <button
                  onClick={() => setHero("overlay")}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
                    heroVariant === "overlay"
                      ? "bg-white text-neutral-900"
                      : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                  }`}
                >
                  Overlay
                </button>
              </div>
            </div>
          )}

          {/* Fine-tune — collapsed by default; theme picking is the fast path */}
          <div className="mt-4 border-t border-neutral-700 pt-3">
            <button
              onClick={() => setFineTune((f) => !f)}
              className="flex w-full items-center justify-between text-[11px] uppercase tracking-wide text-neutral-400 hover:text-neutral-200"
            >
              Fine-tune individual colors
              <ChevronDown
                className={`h-3.5 w-3.5 transition-[rotate] ${fineTune ? "rotate-180" : ""}`}
              />
            </button>
            {fineTune && (
              <div className="mt-3 flex max-h-56 flex-col gap-2.5 overflow-y-auto pr-1">
                {TOKENS.map((t) => (
                  <label
                    key={t.key}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-neutral-300">{t.label}</span>
                    <span className="flex items-center gap-2">
                      <input
                        type="color"
                        value={values[t.key]}
                        onChange={(e) => applyTokens({ [t.key]: e.target.value })}
                        className="h-7 w-7 cursor-pointer rounded border border-neutral-600 bg-transparent p-0"
                      />
                      <input
                        type="text"
                        value={values[t.key]}
                        onChange={(e) => applyTokens({ [t.key]: e.target.value })}
                        className="w-[72px] rounded border border-neutral-700 bg-neutral-800 px-1.5 py-1 font-mono text-xs text-neutral-200 focus:outline-none"
                      />
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm text-white shadow-2xl hover:bg-neutral-800"
        >
          <Palette className="h-4 w-4" />
          Tweak
        </button>
      )}
    </div>
  );
}
