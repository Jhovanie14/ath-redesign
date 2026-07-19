"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Map as MapIcon, SlidersHorizontal, X } from "lucide-react";
import { CATEGORY_LABELS, type Trainer } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { FilterRail } from "./filter-rail";
import { ResultsGrid } from "./results-grid";
import { SortSelect } from "./sort-select";
import {
  applyFilters,
  buildQuery,
  countActive,
  DEFAULT_FILTERS,
  type FilterState,
} from "./filters";

const TrainerMap = dynamic(() => import("./trainer-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
});

interface Chip {
  key: string;
  label: string;
  remove: () => void;
}

export function SearchClient({
  trainers,
  initial,
}: {
  trainers: Trainer[];
  initial: FilterState;
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(initial);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(true);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { results, locationMatched } = useMemo(
    () => applyFilters(trainers, filters),
    [trainers, filters],
  );

  // Filter state is the URL — shareable and deep-linkable.
  useEffect(() => {
    const query = buildQuery(filters);
    const t = setTimeout(() => {
      router.replace(`/search${query ? `?${query}` : ""}`, { scroll: false });
    }, 150);
    return () => clearTimeout(t);
  }, [filters, router]);

  function patch(p: Partial<FilterState>) {
    setFilters((f) => ({ ...f, ...p }));
  }

  function clearAll() {
    setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));
  }

  const active = countActive(filters);

  const chips: Chip[] = [];
  if (filters.q.trim())
    chips.push({
      key: "q",
      label: `“${filters.q.trim()}”`,
      remove: () => patch({ q: "" }),
    });
  if (filters.tier !== "all")
    chips.push({
      key: "tier",
      label: filters.tier === "premium" ? "Premium" : "Standard",
      remove: () => patch({ tier: "all" }),
    });
  if (filters.minRating > 0)
    chips.push({
      key: "rating",
      label: `${filters.minRating.toFixed(1)}+ rating`,
      remove: () => patch({ minRating: 0 }),
    });
  filters.categories.forEach((c) =>
    chips.push({
      key: `cat-${c}`,
      label: CATEGORY_LABELS[c],
      remove: () => patch({ categories: filters.categories.filter((x) => x !== c) }),
    }),
  );
  if (filters.location.trim())
    chips.push({
      key: "location",
      label: `${filters.location.trim()} · ${filters.radiusMiles}mi`,
      remove: () => patch({ location: "" }),
    });

  const countLabel = `${results.length} verified trainer${results.length === 1 ? "" : "s"}`;

  return (
    <>
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-md text-ink">All trainers</h1>
          <p
            aria-live="polite"
            className="mt-1 font-data text-small text-stone"
          >
            {countLabel}
          </p>
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <SortSelect value={filters.sort} onChange={(sort) => patch({ sort })} />
          <Button
            variant="outline"
            size="default"
            onClick={() => setMapVisible((v) => !v)}
            className="h-10"
          >
            <MapIcon className="h-4 w-4" />
            {mapVisible ? "Hide map" : "Show map"}
          </Button>
        </div>
      </div>

      {/* Mobile toolbar */}
      <div className="mt-5 flex items-center gap-3 lg:hidden">
        <Button
          variant="outline"
          className="h-10"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {active > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 font-data text-[11px] text-ivory">
              {active}
            </span>
          )}
        </Button>
        <SortSelect value={filters.sort} onChange={(sort) => patch({ sort })} />
      </div>

      {/* Three-zone layout */}
      <div className="mt-6 lg:flex lg:gap-8">
        {/* Rail */}
        <aside className="hidden lg:block lg:w-[280px] lg:shrink-0">
          <div className="sticky top-[88px] max-h-[calc(100vh-108px)] overflow-y-auto rounded-card border border-linen bg-paper p-6 pr-4">
            <FilterRail
              state={filters}
              onChange={patch}
              locationMatched={locationMatched}
            />
          </div>
        </aside>

        {/* Results */}
        <div className="min-w-0 flex-1">
          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.remove}
                  className="inline-flex items-center gap-1.5 rounded-full border border-linen bg-paper py-1 pl-3 pr-2 text-micro text-ink-soft transition-colors hover:border-stone/50 hover:text-ink"
                >
                  {chip.label}
                  <X className="h-3 w-3" />
                </button>
              ))}
              <button
                onClick={clearAll}
                className="text-micro font-medium text-ink underline underline-offset-2 hover:text-stone"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Mobile map view */}
          {mobileView === "map" ? (
            <div className="h-[70vh] overflow-hidden rounded-card border border-linen lg:hidden">
              <TrainerMap
                trainers={results}
                activeSlug={activeSlug}
                onHoverChange={setActiveSlug}
              />
            </div>
          ) : results.length > 0 ? (
            <ResultsGrid
              trainers={results}
              activeSlug={activeSlug}
              onHoverChange={setActiveSlug}
              columns={mapVisible ? 2 : 3}
            />
          ) : (
            <EmptyState
              title="No trainers match these filters yet."
              description="The Hub is growing — widen your radius or clear a filter."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear all filters
                </Button>
              }
            />
          )}
        </div>

        {/* Map */}
        {mapVisible && (
          <aside className="hidden lg:block lg:w-[38%] lg:shrink-0">
            <div className="sticky top-[88px] h-[calc(100vh-108px)] overflow-hidden rounded-card border border-linen">
              <TrainerMap
                trainers={results}
                activeSlug={activeSlug}
                onHoverChange={setActiveSlug}
              />
            </div>
          </aside>
        )}
      </div>

      {/* Floating mobile map/list toggle */}
      <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 lg:hidden">
        <Button
          onClick={() => setMobileView((v) => (v === "list" ? "map" : "list"))}
          className="shadow-e2"
        >
          <MapIcon className="h-4 w-4" />
          {mobileView === "list" ? "Map" : "List"}
        </Button>
      </div>

      {/* Mobile filters sheet */}
      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent position="sheet" className="p-6">
          <DialogTitle className="text-title">Filters</DialogTitle>
          <div className="mt-5">
            <FilterRail
              state={filters}
              onChange={patch}
              locationMatched={locationMatched}
            />
          </div>
          <div className="mt-7 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={clearAll}>
              Clear all
            </Button>
            <DialogClose asChild>
              <Button className="flex-1">Show {results.length} results</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
