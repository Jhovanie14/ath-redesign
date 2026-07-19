"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SPRING } from "./motion";
import { VerifiedSeal } from "./verified-seal";

export interface PassportRow {
  label: string;
  /** Mono right-aligned note — a checked date or registration number. */
  note?: string;
}

export interface VerificationPassportProps {
  eyebrow?: string;
  title?: string;
  rows: PassportRow[];
  footer?: React.ReactNode;
  /** Hero variant: seal stamps in, rows tick sequentially on mount. */
  animated?: boolean;
  sealSize?: number;
  /** Subtle document tilt in degrees. */
  rotate?: number;
  className?: string;
}

function RowContent({ row }: { row: PassportRow }) {
  return (
    <>
      <VerifiedSeal size={20} />
      <span className="text-small text-ink">{row.label}</span>
      {row.note && (
        <span className="ml-auto font-data text-micro text-stone">
          {row.note}
        </span>
      )}
    </>
  );
}

const ROW_CLASS =
  "flex items-center gap-3 border-b border-linen py-2.5 last:border-0";

export function VerificationPassport({
  eyebrow = "Verification",
  title,
  rows,
  footer,
  animated = false,
  sealSize = 44,
  rotate = 0,
  className,
}: VerificationPassportProps) {
  const reduce = useReducedMotion();
  const [pulsed, setPulsed] = useState(false);
  const play = animated && !reduce;
  const sealDelay = 0.25 + rows.length * 0.3;

  return (
    <div
      className={cn(
        "relative rounded-[16px] border border-linen bg-paper shadow-e2",
        className,
      )}
      style={rotate ? { rotate: `${rotate}deg` } : undefined}
    >
      {/* Perforated stamp edge */}
      <div
        aria-hidden
        className="serrated-edge h-2.5 rounded-t-[16px] bg-gold-tint"
      />

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden className="h-px w-6 bg-stone/50" />
              <span className="eyebrow">{eyebrow}</span>
            </div>
            {title && (
              <p className="mt-2 font-display text-title text-ink">{title}</p>
            )}
          </div>

          {play ? (
            <motion.span
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ ...SPRING, delay: sealDelay }}
              onAnimationComplete={() => setPulsed(true)}
              className={cn(
                "rounded-full",
                pulsed && "animate-[goldPulse_1.2s_ease-out]",
              )}
            >
              <VerifiedSeal size={sealSize} title="Reviewed and verified" />
            </motion.span>
          ) : (
            <VerifiedSeal size={sealSize} title="Reviewed and verified" />
          )}
        </div>

        {play ? (
          <motion.ul
            className="mt-5"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.3, delayChildren: 0.2 } },
            }}
          >
            {rows.map((row, i) => (
              <motion.li
                key={i}
                className={ROW_CLASS}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  show: { opacity: 1, x: 0, transition: SPRING },
                }}
              >
                <RowContent row={row} />
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <ul className="mt-5">
            {rows.map((row, i) => (
              <li key={i} className={ROW_CLASS}>
                <RowContent row={row} />
              </li>
            ))}
          </ul>
        )}

        {footer && (
          <p className="mt-4 text-micro leading-relaxed text-stone">{footer}</p>
        )}
      </div>
    </div>
  );
}
