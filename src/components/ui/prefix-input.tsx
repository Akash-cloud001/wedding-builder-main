import * as React from "react"
import { cn } from "@/lib/utils"

export interface PrefixInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  prefix?: React.ReactNode;
  containerClassName?: string;
}

const PrefixInput = React.forwardRef<HTMLInputElement, PrefixInputProps>(
  ({ className, containerClassName, prefix, ...props }, ref) => {
    return (
      <div 
        className={cn(
          "flex flex-1 items-center bg-gray-50 rounded-md border focus-within:border-zinc-500 overflow-hidden px-2.5 h-8",
          containerClassName
        )}
      >
        {prefix && (
          <span className="text-zinc-500 text-xs font-medium mr-2 flex items-center justify-center shrink-0">
            {prefix}
          </span>
        )}
        <input
          className={cn(
            "bg-transparent border-0 flex-1 w-full text-xs font-medium text-zinc-900 focus:outline-none",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
PrefixInput.displayName = "PrefixInput"

export { PrefixInput }
