import React from "react";

export type DataStatus = "current" | "refreshing" | "error" | "loading";

interface DataStatusIndicatorProps {
    status: DataStatus;
    className?: string;
}

export function DataStatusIndicator({ status, className = "" }: DataStatusIndicatorProps) {
    const getStatusInfo = () => {
        switch (status) {
            case "current":
                return {
                    text: "Dane są aktualne",
                    icon: "✓",
                    color: "text-green-400",
                    bgColor: "bg-green-400/10"
                };
            case "refreshing":
                return {
                    text: "Pobieram nowe dane",
                    icon: (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-400"></div>
                    ),
                    color: "text-amber-400",
                    bgColor: "bg-amber-400/10"
                };
            case "error":
                return {
                    text: "Błąd pobierania danych",
                    icon: "⚠",
                    color: "text-red-400",
                    bgColor: "bg-red-400/10"
                };
            case "loading":
                return {
                    text: "Ładowanie danych",
                    icon: (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></div>
                    ),
                    color: "text-blue-400",
                    bgColor: "bg-blue-400/10"
                };
            default:
                return {
                    text: "Dane są aktualne",
                    icon: "✓",
                    color: "text-green-400",
                    bgColor: "bg-green-400/10"
                };
        }
    };

    const { text, icon, color, bgColor } = getStatusInfo();

    return (
        <div className={`flex items-center px-3 py-1.5 rounded-md ${bgColor} ${className}`}>
            <span className={`mr-2 ${color} text-sm flex items-center justify-center w-4 h-4`}>
                {icon}
            </span>
            <span className={`text-xs font-medium ${color}`}>
                {text}
            </span>
        </div>
    );
}
