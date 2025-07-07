import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    className?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-9 w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-1 text-sm text-neutral-100 shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </select>
        );
    }
);
Select.displayName = "Select";

interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 shadow-sm placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
