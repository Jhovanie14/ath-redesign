"use client";

import { useMemo, useState } from "react";
import type { Review } from "@/lib/types";
import { formatMonthYear } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RatingStars } from "@/components/rating-stars";
import { VerifiedSeal } from "@/components/verified-seal";

type RatingFilter = 1 | 2 | 3 | 4 | 5 | "all";

export function TrainerReviewsList({
  rating,
  reviewCount,
  reviews,
}: {
  rating: number;
  reviewCount: number;
  reviews: Review[];
}) {
  const [query, setQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      const matchesQuery =
        q === "" ||
        r.studentInitials.toLowerCase().includes(q) ||
        r.courseTitle.toLowerCase().includes(q);
      const matchesRating =
        ratingFilter === "all" || r.rating === ratingFilter;
      return matchesQuery && matchesRating;
    });
  }, [reviews, query, ratingFilter]);

  return (
    <>
      <div>
        <h1 className="font-display text-display-md text-ink">Reviews</h1>
        <p className="mt-1.5 text-body text-ink-soft">
          What students have said about your courses.
        </p>
      </div>

      <div className="mt-5 flex items-baseline gap-3">
        <span className="font-data text-display-md font-medium text-ink">
          {rating.toFixed(1)}
        </span>
        <div className="flex flex-col gap-1">
          <RatingStars rating={rating} size={16} />
          <span className="font-data text-micro text-stone">
            {reviewCount} reviews
          </span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by reviewer or course"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={String(ratingFilter)}
          onValueChange={(v) =>
            setRatingFilter(
              v === "all" ? "all" : (Number(v) as 1 | 2 | 3 | 4 | 5),
            )
          }
        >
          <SelectTrigger className="h-11 sm:w-[170px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
            <SelectItem value="4">4 stars</SelectItem>
            <SelectItem value="3">3 stars</SelectItem>
            <SelectItem value="2">2 stars</SelectItem>
            <SelectItem value="1">1 star</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No reviews yet</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Student reviews will appear here once bookings start coming in.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-card border border-linen bg-paper px-6 py-16 text-center">
          <p className="font-display text-title text-ink">No matches</p>
          <p className="mt-1.5 text-small text-ink-soft">
            Try a different search term or rating filter.
          </p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {filtered.map((review) => (
            <li
              key={review.id}
              className="rounded-card border border-linen bg-paper p-6"
            >
              <RatingStars rating={review.rating} size={14} />
              <p className="mt-3 text-body leading-relaxed text-ink-soft">
                {review.body}
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="font-data text-micro text-stone">
                  {review.studentInitials} · {review.courseTitle} ·{" "}
                  {formatMonthYear(review.date)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-micro font-medium text-ink-soft">
                  <VerifiedSeal size={16} />
                  Booking verified
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
