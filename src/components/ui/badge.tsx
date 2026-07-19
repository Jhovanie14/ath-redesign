import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-sans font-medium leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-linen/70 text-ink-soft",
        outline: "border border-linen text-ink-soft bg-paper",
        success: "bg-success/10 text-success",
      },
      size: {
        sm: "px-2 py-1 text-[11px]",
        default: "px-2.5 py-1 text-micro",
      },
    },
    defaultVariants: { variant: "neutral", size: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
  );
}

export { Badge, badgeVariants };
