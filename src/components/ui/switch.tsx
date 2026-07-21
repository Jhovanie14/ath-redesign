"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-[#E4DED3] transition-colors duration-200 ease-out hover:bg-[#D9D2C4] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(185,152,90,0.18)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#292923] data-[state=checked]:hover:bg-[#3A3932]",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb className="pointer-events-none block h-[18px] w-[18px] translate-x-0.5 rounded-full bg-white shadow-e1 transition-transform duration-200 ease-out data-[state=checked]:translate-x-[22px]" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
