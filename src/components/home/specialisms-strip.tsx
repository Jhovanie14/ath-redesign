import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  type CourseCategory,
} from "@/lib/types";
import {
  EditorialImage,
  type EditorialVariant,
} from "@/components/media/editorial-image";
import { resolveImage } from "@/lib/media";

const VARIANTS: EditorialVariant[] = ["hero", "warm", "gold", "stone"];

/** Visual gallery of specialisms — each tile links into filtered search. */
export function SpecialismsStrip() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      {ALL_CATEGORIES.map((cat: CourseCategory, i) => (
        <Link
          key={cat}
          href={`/search?category=${cat}`}
          className="group relative flex h-36 flex-col justify-end overflow-hidden rounded-card border border-linen shadow-e2 transition-[transform,box-shadow] duration-300 ease-out hover:shadow-e2-hover motion-safe:hover:-translate-y-[3px] sm:h-40"
        >
          <EditorialImage
            variant={VARIANTS[i % VARIANTS.length]}
            src={resolveImage(`images/specialisms/${cat}`)}
            alt=""
            className="absolute inset-0 h-full w-full transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.06]"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-paper/85 via-paper/30 to-transparent"
          />
          <div className="relative flex items-end justify-between p-4">
            <h3 className="font-display text-title leading-tight text-ink">
              {CATEGORY_LABELS[cat]}
            </h3>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-paper/70 text-ink backdrop-blur-sm transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-ivory">
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
