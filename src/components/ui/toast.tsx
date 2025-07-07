import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
    message: string;
    type: "success" | "error" | "info";
    isVisible: boolean;
    onClose: () => void;
}

export function Toast({ message, type, isVisible, onClose }: ToastProps) {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
            <div
                className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px]",
                    {
                        "bg-green-600 text-white": type === "success",
                        "bg-red-600 text-white": type === "error",
                        "bg-blue-600 text-white": type === "info",
                    }
                )}
            >
                <div className="flex-1">{message}</div>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    <svg
                        className="w-5 h-5"
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
        </div>
    );
}

interface UseToastReturn {
    showToast: (message: string, type: "success" | "error" | "info") => void;
    ToastComponent: React.ReactNode;
}

export function useToast(): UseToastReturn {
    const [toast, setToast] = React.useState<{
        message: string;
        type: "success" | "error" | "info";
        isVisible: boolean;
    }>({
        message: "",
        type: "info",
        isVisible: false,
    });

    const showToast = React.useCallback(
        (message: string, type: "success" | "error" | "info") => {
            setToast({ message, type, isVisible: true });
        },
        []
    );

    const hideToast = React.useCallback(() => {
        setToast((prev) => ({ ...prev, isVisible: false }));
    }, []);

    const ToastComponent = (
        <Toast
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={hideToast}
        />
    );

    return { showToast, ToastComponent };
}
