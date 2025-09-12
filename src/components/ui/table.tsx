import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
}

export function Table({ children, className, ...props }: TableProps) {
  return (
    <div className="relative overflow-x-auto border border-neutral-700 rounded-lg">
      <table
        className={cn("w-full text-sm text-left text-neutral-300", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableHeader({
  children,
  className,
  ...props
}: TableHeaderProps) {
  return (
    <thead
      className={cn(
        "text-xs text-neutral-400 uppercase bg-neutral-800",
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export function TableBody({ children, className, ...props }: TableBodyProps) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export function TableRow({ children, className, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        "bg-neutral-900 border-b border-neutral-700 hover:bg-neutral-800/50 transition-colors",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {
  children: React.ReactNode;
}

export function TableHeaderCell({
  children,
  className,
  ...props
}: TableHeaderCellProps) {
  return (
    <th scope="col" className={cn("px-6 py-3", className)} {...props}>
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
}

export function TableCell({ children, className, ...props }: TableCellProps) {
  return (
    <td className={cn("px-6 py-4", className)} {...props}>
      {children}
    </td>
  );
}
