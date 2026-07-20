"use client";

import { Search } from "lucide-react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type CourseCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RADIUS_OPTIONS,
  type FilterState,
  type TierFilter,
} from "./filters";

const TIERS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "Any" },
  { value: "premium", label: "Premium" },
  { value: "standard", label: "Standard" },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>;
}

export interface FilterRailProps {
  state: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  locationMatched: boolean | null;
}

export function FilterRail({ state, onChange, locationMatched }: FilterRailProps) {
  function toggleCategory(cat: CourseCategory) {
    const has = state.categories.includes(cat);
    onChange({
      categories: has
        ? state.categories.filter((c) => c !== cat)
        : [...state.categories, cat],
    });
  }

  return (
    <div className="flex flex-col">
      {/* Search */}
      <div>
        <FieldLabel>Search</FieldLabel>
        <div className="flex h-11 items-center gap-2 rounded-full border border-linen bg-paper px-4 transition-colors focus-within:border-stone">
          <Search className="h-4 w-4 shrink-0 text-stone" />
          <input
            value={state.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Name or course"
            aria-label="Search by name or course"
            className="w-full bg-transparent text-small text-ink placeholder:text-stone focus:outline-none"
          />
        </div>
      </div>

      {/* Listing type */}
      <div className="mt-7 border-t border-linen pt-7">
        <FieldLabel>Listing type</FieldLabel>
        <div className="grid grid-cols-3 gap-1 rounded-full border border-linen bg-paper p-1">
          {TIERS.map((t) => {
            const active = state.tier === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ tier: t.value })}
                className={cn(
                  "overflow-hidden rounded-full px-1.5 py-1.5 text-center text-micro font-medium whitespace-nowrap transition-colors",
                  active
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:bg-linen",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Min rating */}
      <div className="mt-7 border-t border-linen pt-7">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Minimum rating</span>
          <span className="font-data text-small text-ink">
            {state.minRating === 0 ? "Any" : state.minRating.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[state.minRating]}
          min={0}
          max={5}
          step={0.1}
          onValueChange={([v]) => onChange({ minRating: v })}
          aria-label="Minimum rating"
        />
      </div>

      {/* Specialism */}
      <div className="mt-7 border-t border-linen pt-7">
        <FieldLabel>Specialism</FieldLabel>
        <ul className="flex flex-col gap-1">
          {ALL_CATEGORIES.map((cat) => {
            const id = `cat-${cat}`;
            const checked = state.categories.includes(cat);
            return (
              <li key={cat}>
                <label
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg py-1.5 pl-1 text-small text-ink-soft hover:text-ink"
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  {CATEGORY_LABELS[cat]}
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Location */}
      <div className="mt-7 border-t border-linen pt-7">
        <FieldLabel>Location</FieldLabel>
        <input
          value={state.location}
          onChange={(e) => onChange({ location: e.target.value })}
          placeholder="City or postcode"
          aria-label="Location"
          className="h-11 w-full rounded-full border border-linen bg-paper px-4 text-small text-ink placeholder:text-stone transition-colors focus:outline-none focus-visible:border-stone"
        />
        <div className="mt-3">
          <label htmlFor="radius" className="sr-only">
            Search radius
          </label>
          <Select
            value={String(state.radiusMiles)}
            onValueChange={(v) => onChange({ radiusMiles: Number(v) })}
          >
            <SelectTrigger id="radius">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RADIUS_OPTIONS.map((r) => (
                <SelectItem key={r} value={String(r)}>
                  Within {r} miles
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {locationMatched === false && (
          <p className="mt-3 rounded-lg bg-linen/60 px-3 py-2 text-micro text-ink-soft">
            No match for &ldquo;{state.location.trim()}&rdquo; — showing all of
            the UK.
          </p>
        )}
      </div>
    </div>
  );
}
