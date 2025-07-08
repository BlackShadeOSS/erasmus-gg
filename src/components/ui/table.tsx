import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps {
    children: React.ReactNode;
    className?: string;
}

export function Table({ children, className }: TableProps) {
    return (
        <div className="relative overflow-x-auto border border-neutral-700 rounded-lg">
            <table
                className={cn(
                    "w-full text-sm text-left text-neutral-300",
                    className
                )}
            >
                {children}
            </table>
        </div>
    );
}

interface TableHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export function TableHeader({ children, className }: TableHeaderProps) {
    return (
        <thead
            className={cn(
                "text-xs text-neutral-400 uppercase bg-neutral-800",
                className
            )}
        >
            {children}
        </thead>
    );
}

interface TableBodyProps {
    children: React.ReactNode;
    className?: string;
}

export function TableBody({ children, className }: TableBodyProps) {
    return <tbody className={className}>{children}</tbody>;
}

interface TableRowProps {
    children: React.ReactNode;
    className?: string;
}

export function TableRow({ children, className }: TableRowProps) {
    return (
        <tr
            className={cn(
                "bg-neutral-900 border-b border-neutral-700 hover:bg-neutral-800/50 transition-colors",
                className
            )}
        >
            {children}
        </tr>
    );
}

interface TableHeaderCellProps {
    children: React.ReactNode;
    className?: string;
}

export function TableHeaderCell({ children, className }: TableHeaderCellProps) {
    return (
        <th scope="col" className={cn("px-6 py-3", className)}>
            {children}
        </th>
    );
}

interface TableCellProps {
    children: React.ReactNode;
    className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
    return <td className={cn("px-6 py-4", className)}>{children}</td>;
}
