import type { Metadata } from "next";
import { getRepository } from "@/lib/repository";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchClient } from "@/components/search/search-client";
import { parseFilters } from "@/components/search/filters";

export const metadata: Metadata = {
  title: "Find training",
  description:
    "Search vetted UK aesthetics trainers by specialism, location and rating. Every listing is insurance-checked and qualification-verified.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = parseFilters(params);
  const trainers = await getRepository().getAll();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10">
          <SearchClient trainers={trainers} initial={initial} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
