import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        // Primary CTA — ink. Never gold.
        primary:
          "bg-ink text-ivory hover:bg-[#35342c] hover:-translate-y-px hover:shadow-e2 active:translate-y-0",
        // Outlined ink on paper — secondary.
        outline:
          "border border-ink/25 text-ink bg-transparent hover:border-ink hover:bg-ink/[0.04]",
        // Paper fill — for use on ink (Level 3) sections.
        paper:
          "bg-paper text-ink hover:bg-linen hover:-translate-y-px hover:shadow-e2 active:translate-y-0",
        // Ghost on ink — for use on ink sections.
        ghostInk:
          "text-ivory/85 border border-ivory/25 hover:bg-ivory/10 hover:text-ivory",
        ghost: "text-ink hover:bg-linen",
        link: "text-ink underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-small",
        default: "h-11 px-5 text-small",
        lg: "h-12 px-7 text-body",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
