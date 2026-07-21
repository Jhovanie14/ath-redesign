import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "w-full min-w-0 resize-y rounded-xl border border-linen bg-paper px-3.5 py-2.5 text-small text-ink outline-none transition-colors placeholder:text-stone disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-stone",
        "aria-invalid:border-error",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
