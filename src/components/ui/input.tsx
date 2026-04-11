import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-2xl px-3 py-1 text-base text-gray-800 neu-inset border-0 outline-none",
        "placeholder:text-gray-400",
        "h-9 md:text-sm",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-gray-400/40",
        "aria-invalid:ring-2 aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
