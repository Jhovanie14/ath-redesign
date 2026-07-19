import { haversineKm, milesToKm } from "@/lib/geo";
import {
  ALL_CATEGORIES,
  type CourseCategory,
  type Trainer,
} from "@/lib/types";

export type SortKey = "recommended" | "rating" | "price-asc" | "price-desc";
export type TierFilter = "all" | "premium" | "standard";

export interface FilterState {
  q: string;
  tier: TierFilter;
  minRating: number; // 0 = Any
  categories: CourseCategory[];
  location: string;
  radiusMiles: number;
  sort: SortKey;
}

export const RADIUS_OPTIONS = [10, 25, 50, 100] as const;

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Rating" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

export const DEFAULT_FILTERS: FilterState = {
  q: "",
  tier: "all",
  minRating: 0,
  categories: [],
  location: "",
  radiusMiles: 25,
  sort: "recommended",
};

type ParamRecord = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export function parseFilters(params: ParamRecord): FilterState {
  const tier = first(params.tier);
  const sort = first(params.sort);
  const rating = Number(first(params.rating));
  const radius = Number(first(params.radius));
  const cats = (first(params.category) ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter((c): c is CourseCategory =>
      (ALL_CATEGORIES as string[]).includes(c),
    );

  return {
    q: first(params.q) ?? "",
    tier: tier === "premium" || tier === "standard" ? tier : "all",
    minRating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0,
    categories: cats,
    location: first(params.location) ?? "",
    radiusMiles: (RADIUS_OPTIONS as readonly number[]).includes(radius)
      ? radius
      : 25,
    sort:
      sort === "rating" || sort === "price-asc" || sort === "price-desc"
        ? sort
        : "recommended",
  };
}

/** Serialize to a query string (no leading "?"), omitting defaults. */
export function buildQuery(state: FilterState): string {
  const p = new URLSearchParams();
  if (state.q.trim()) p.set("q", state.q.trim());
  if (state.tier !== "all") p.set("tier", state.tier);
  if (state.minRating > 0) p.set("rating", String(state.minRating));
  if (state.categories.length) p.set("category", state.categories.join(","));
  if (state.location.trim()) {
    p.set("location", state.location.trim());
    p.set("radius", String(state.radiusMiles));
  }
  if (state.sort !== "recommended") p.set("sort", state.sort);
  return p.toString();
}

function sortTrainers(trainers: Trainer[], sort: SortKey): Trainer[] {
  const out = [...trainers];
  switch (sort) {
    case "rating":
      return out.sort((a, b) => b.rating - a.rating);
    case "price-asc":
      return out.sort((a, b) => a.fromPriceGBP - b.fromPriceGBP);
    case "price-desc":
      return out.sort((a, b) => b.fromPriceGBP - a.fromPriceGBP);
    case "recommended":
    default:
      return out.sort((a, b) => {
        if (a.tier !== b.tier) return a.tier === "premium" ? -1 : 1;
        return b.rating - a.rating;
      });
  }
}

function matchesQuery(t: Trainer, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [
    t.name,
    t.headline,
    t.city,
    ...t.courses.map((c) => c.title),
    ...t.categories,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

export interface FilterResult {
  results: Trainer[];
  /** null = no location entered; false = entered but unmatched. */
  locationMatched: boolean | null;
}

export function applyFilters(
  trainers: Trainer[],
  state: FilterState,
): FilterResult {
  const loc = state.location.trim().toLowerCase();
  const center = loc
    ? trainers.find((t) => t.city.toLowerCase() === loc)
    : undefined;
  const locationMatched = loc ? Boolean(center) : null;

  const filtered = trainers.filter((t) => {
    if (!matchesQuery(t, state.q)) return false;
    if (state.tier !== "all" && t.tier !== state.tier) return false;
    if (state.minRating > 0 && t.rating < state.minRating) return false;
    if (
      state.categories.length &&
      !state.categories.some((c) => t.categories.includes(c))
    )
      return false;
    if (center) {
      const km = haversineKm(
        { lat: center.lat, lng: center.lng },
        { lat: t.lat, lng: t.lng },
      );
      if (km > milesToKm(state.radiusMiles)) return false;
    }
    return true;
  });

  return { results: sortTrainers(filtered, state.sort), locationMatched };
}

/** Count of active filter facets — powers the mobile badge. */
export function countActive(state: FilterState): number {
  let n = 0;
  if (state.q.trim()) n += 1;
  if (state.tier !== "all") n += 1;
  if (state.minRating > 0) n += 1;
  n += state.categories.length;
  if (state.location.trim()) n += 1;
  return n;
}
