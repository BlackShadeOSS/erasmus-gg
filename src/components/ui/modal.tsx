import * as React from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
}: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={cn(
                    "relative bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto",
                    {
                        "w-full max-w-sm": size === "sm",
                        "w-full max-w-md": size === "md",
                        "w-full max-w-2xl": size === "lg",
                        "w-full max-w-4xl": size === "xl",
                    }
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-100">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
