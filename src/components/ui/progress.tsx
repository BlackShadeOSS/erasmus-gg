"use client";

import React from "react";

type Props = React.HTMLAttributes<HTMLDivElement> & {
    value?: number;
    className?: string;
};

export function Progress({ value = 0, className = "", ...rest }: Props) {
    const pct = Math.max(0, Math.min(100, Math.round(value)));
    return (
        <div
            className={`bg-neutral-700/30 rounded-md h-3 ${className}`}
            {...rest}
        >
            <div
                style={{ width: `${pct}%` }}
                className="h-3 rounded-md bg-amber-600"
            />
        </div>
    );
}

export default Progress;
