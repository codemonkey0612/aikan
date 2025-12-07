import { type PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren {
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export function Card({ className, title, actions, children }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-slate-200 bg-white shadow-lg transition-shadow duration-300 hover:shadow-xl",
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

