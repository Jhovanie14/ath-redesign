"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Trainer } from "@/lib/types";
import { cn } from "@/lib/utils";
import { SPRING } from "@/components/motion";
import { TrainerCard } from "@/components/trainer-card";

export interface ResultsGridProps {
  trainers: Trainer[];
  activeSlug: string | null;
  onHoverChange: (slug: string | null) => void;
  columns: 2 | 3;
}

export function ResultsGrid({
  trainers,
  activeSlug,
  onHoverChange,
  columns,
}: ResultsGridProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className={cn(
        "grid gap-6",
        columns === 3
          ? "sm:grid-cols-2 xl:grid-cols-3"
          : "sm:grid-cols-2",
      )}
    >
      {trainers.map((trainer, i) => (
        <motion.div
          key={trainer.slug}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING, delay: Math.min(i * 0.04, 0.28) }}
        >
          <TrainerCard
            trainer={trainer}
            active={trainer.slug === activeSlug}
            onHoverChange={onHoverChange}
          />
        </motion.div>
      ))}
    </div>
  );
}
