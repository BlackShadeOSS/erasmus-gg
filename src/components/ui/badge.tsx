"use client";

import React from "react";

export function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-block bg-amber-700 text-black text-xs px-2 py-0.5 rounded-full font-medium">
            {children}
        </span>
    );
}

export default Badge;
