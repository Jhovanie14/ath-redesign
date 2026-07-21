import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-linen bg-paper px-3.5 text-small text-ink outline-none transition-colors placeholder:text-stone disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-stone",
        "aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Input }
