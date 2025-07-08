import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-neutral-600/80 bg-neutral-800/90 backdrop-blur-sm px-4 py-3 text-base text-neutral-100 shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-base file:font-medium file:text-neutral-100 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/50 focus-visible:border-amber-200/50 hover:border-neutral-500/80 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
