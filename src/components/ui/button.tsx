import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const Button = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
        variant?: "default" | "secondary" | "outline" | "destructive";
        size?: "default" | "sm" | "lg";
        asChild?: boolean;
    }
>(
    (
        {
            className,
            variant = "default",
            size = "default",
            asChild = false,
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-amber-300 disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-amber-200 text-neutral-900 shadow hover:bg-amber-300":
                            variant === "default",
                        "bg-neutral-800 text-neutral-200 shadow-sm hover:bg-neutral-700":
                            variant === "secondary",
                        "border border-neutral-600 bg-transparent shadow-sm hover:bg-neutral-800":
                            variant === "outline",
                        "bg-red-600 text-white shadow-sm hover:bg-red-700":
                            variant === "destructive",
                    },
                    {
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 rounded-md px-8": size === "lg",
                    },
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
