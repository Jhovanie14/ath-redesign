import type { CourseCategory, Trainer } from "./types";

export interface TrainerSearchFilters {
  category?: CourseCategory;
  tier?: "premium" | "standard";
  minRating?: number;
  query?: string;
  near?: { lat: number; lng: number; radiusKm: number };
}

export interface TrainerRepository {
  getAll(): Promise<Trainer[]>;
  getBySlug(slug: string): Promise<Trainer | null>;
  search(f: TrainerSearchFilters): Promise<Trainer[]>;
  getFeatured(limit: number): Promise<Trainer[]>;
}

// Swap this factory's return for a SupabaseTrainerRepository in Phase 3 —
// no component imports a concrete implementation directly.
import { MockTrainerRepository } from "./mock-repository";

let instance: TrainerRepository | null = null;

export function getRepository(): TrainerRepository {
  if (!instance) {
    instance = new MockTrainerRepository();
  }
  return instance;
}
