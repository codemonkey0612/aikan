import { type PropsWithChildren, type TdHTMLAttributes, type ThHTMLAttributes } from "react";
import clsx from "clsx";

interface TableProps extends PropsWithChildren {
  className?: string;
}

export function Table({ className, children }: TableProps) {
  return (
    <div className={clsx("overflow-x-auto rounded-xl border border-slate-200", className)}>
      <table className="min-w-full divide-y divide-slate-200 bg-white">
        {children}
      </table>
    </div>
  );
}

interface TableHeaderProps extends PropsWithChildren {
  className?: string;
}

export function TableHeader({ className, children }: TableHeaderProps) {
  return (
    <thead className={clsx("bg-slate-50 text-left text-sm font-semibold text-slate-600", className)}>
      {children}
    </thead>
  );
}

interface TableBodyProps extends PropsWithChildren {
  className?: string;
}

export function TableBody({ className, children }: TableBodyProps) {
  return (
    <tbody className={clsx("divide-y divide-slate-200 text-sm text-slate-700", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ className, children }: TableProps) {
  return (
    <tr className={clsx("hover:bg-slate-50 transition", className)}>{children}</tr>
  );
}

export function TableCell({ className, children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={clsx("px-4 py-3 align-middle", className)} {...rest}>
      {children}
    </td>
  );
}

export function TableHeaderCell({
  className,
  children,
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={clsx(
        "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500",
        className
      )}
      {...rest}
    >
      {children}
    </th>
  );
}

