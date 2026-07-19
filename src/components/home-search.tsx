"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";
import { ALL_CATEGORIES, CATEGORY_LABELS } from "@/lib/types";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

/** Hero search — deep-links into /search via URL params. */
export function HomeSearch() {
  const router = useRouter();
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (location.trim()) {
      params.set("location", location.trim());
      params.set("radius", "25");
    }
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[18px] border border-linen bg-paper p-2 shadow-e2 sm:rounded-full"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1 sm:pl-2">
          <label htmlFor="hero-course" className="sr-only">
            Course
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              id="hero-course"
              className="border-transparent bg-transparent hover:border-transparent"
            >
              <SelectValue placeholder="Any specialism" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any specialism</SelectItem>
              {ALL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span
          aria-hidden
          className="hidden h-6 w-px bg-linen sm:block"
        />

        <div className="flex flex-1 items-center gap-2 sm:pl-2">
          <MapPin className="h-4 w-4 shrink-0 text-stone" />
          <label htmlFor="hero-location" className="sr-only">
            Location
          </label>
          <input
            id="hero-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Town or postcode"
            className="h-11 w-full bg-transparent text-small text-ink placeholder:text-stone focus:outline-none"
          />
        </div>

        <Button type="submit" size="lg" className="sm:px-6">
          <Search className="h-4 w-4" />
          Search
        </Button>
      </div>
    </form>
  );
}
