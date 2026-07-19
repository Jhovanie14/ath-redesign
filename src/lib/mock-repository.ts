import trainersData from "@/data/trainers.json";
import { haversineKm } from "./geo";
import type {
  TrainerRepository,
  TrainerSearchFilters,
} from "./repository";
import type { Trainer } from "./types";

const TRAINERS = trainersData as Trainer[];

function matchesQuery(trainer: Trainer, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    trainer.name,
    trainer.headline,
    trainer.city,
    ...trainer.courses.map((c) => c.title),
    ...trainer.categories,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(q);
}

/**
 * In-memory repository backed by seed JSON. Reads are cloned defensively so
 * callers can never mutate the shared dataset. Radius search uses haversine.
 */
export class MockTrainerRepository implements TrainerRepository {
  private readonly trainers: Trainer[];

  constructor(seed: Trainer[] = TRAINERS) {
    this.trainers = seed;
  }

  async getAll(): Promise<Trainer[]> {
    return structuredClone(this.trainers);
  }

  async getBySlug(slug: string): Promise<Trainer | null> {
    const found = this.trainers.find((t) => t.slug === slug);
    return found ? structuredClone(found) : null;
  }

  async search(f: TrainerSearchFilters): Promise<Trainer[]> {
    let results = this.trainers.filter((t) => {
      if (f.category && !t.categories.includes(f.category)) return false;
      if (f.tier && t.tier !== f.tier) return false;
      if (typeof f.minRating === "number" && t.rating < f.minRating)
        return false;
      if (f.query && !matchesQuery(t, f.query)) return false;
      if (f.near) {
        const km = haversineKm(
          { lat: f.near.lat, lng: f.near.lng },
          { lat: t.lat, lng: t.lng },
        );
        if (km > f.near.radiusKm) return false;
      }
      return true;
    });

    // Default ordering: premium first, then rating desc.
    results = results.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === "premium" ? -1 : 1;
      return b.rating - a.rating;
    });

    return structuredClone(results);
  }

  async getFeatured(limit: number): Promise<Trainer[]> {
    const ranked = [...this.trainers].sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === "premium" ? -1 : 1;
      return b.rating - a.rating;
    });
    return structuredClone(ranked.slice(0, limit));
  }
}
