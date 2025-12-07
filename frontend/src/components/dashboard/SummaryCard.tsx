import { type PropsWithChildren } from "react";
import clsx from "clsx";

interface SummaryCardProps extends PropsWithChildren {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  change,
  icon,
  className,
  children,
}: SummaryCardProps) {
  // Determine colors based on title
  const getColors = () => {
    if (title.includes("施設")) return { bg: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600" };
    if (title.includes("入居者")) return { bg: "bg-green-500", light: "bg-green-50", text: "text-green-600" };
    if (title.includes("シフト")) return { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600" };
    if (title.includes("バイタル")) return { bg: "bg-pink-500", light: "bg-pink-50", text: "text-pink-600" };
    return { bg: "bg-purple-500", light: "bg-purple-50", text: "text-purple-600" };
  };

  const colors = getColors();
  const isPositive = change?.includes("+") || change?.includes("↑");
  const isNegative = change?.includes("-") || change?.includes("↓");

  return (
    <div
      className={clsx(
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">{value}</p>
          {change && (
            <div className={clsx(
              "flex items-center gap-1 text-xs font-semibold",
              isPositive ? "text-emerald-600" : isNegative ? "text-red-600" : "text-slate-600"
            )}>
              {isPositive && <span className="text-emerald-500">↑</span>}
              {isNegative && <span className="text-red-500">↓</span>}
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={clsx(
            "flex h-14 w-14 items-center justify-center rounded-xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110",
            colors.bg
          )}>
            {icon}
          </div>
        )}
      </div>
      {children && <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">{children}</div>}
    </div>
  );
}

