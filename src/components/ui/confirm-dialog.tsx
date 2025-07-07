import * as React from "react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Potwierdź",
    cancelText = "Anuluj",
    variant = "default",
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="relative bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="p-4 border-b border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-100">
                        {title}
                    </h3>
                </div>

                {/* Content */}
                <div className="p-4">
                    <p className="text-neutral-300">{message}</p>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 p-4 border-t border-neutral-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-neutral-300 bg-transparent border border-neutral-600 rounded-md hover:bg-neutral-800 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            variant === "destructive"
                                ? "bg-red-600 text-white hover:bg-red-700"
                                : "bg-amber-200 text-neutral-900 hover:bg-amber-300"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
