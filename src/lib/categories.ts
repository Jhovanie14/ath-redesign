import { ALL_CATEGORIES, CATEGORY_LABELS, type CourseCategory, type Trainer } from "./types";

export interface CategoryUsage {
  key: CourseCategory;
  label: string;
  courseCount: number;
  trainerCount: number;
}

export function toCategoryUsage(trainers: Trainer[]): CategoryUsage[] {
  const courseCounts = new Map<CourseCategory, number>();
  const trainerSets = new Map<CourseCategory, Set<string>>();

  for (const t of trainers) {
    for (const c of t.courses) {
      courseCounts.set(c.category, (courseCounts.get(c.category) ?? 0) + 1);
      const slugs = trainerSets.get(c.category) ?? new Set<string>();
      slugs.add(t.slug);
      trainerSets.set(c.category, slugs);
    }
  }

  return ALL_CATEGORIES.map((key): CategoryUsage => ({
    key,
    label: CATEGORY_LABELS[key],
    courseCount: courseCounts.get(key) ?? 0,
    trainerCount: trainerSets.get(key)?.size ?? 0,
  })).sort((a, b) => b.courseCount - a.courseCount);
}
