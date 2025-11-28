import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 最初のページ
      pages.push(1);

      if (page > 3) {
        pages.push("...");
      }

      // 現在のページ周辺
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (page < totalPages - 2) {
        pages.push("...");
      }

      // 最後のページ
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={clsx("flex items-center justify-between", className)}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className={clsx(
            "rounded-lg p-2 transition",
            page === 1
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-slate-100"
          )}
          aria-label="最初のページ"
        >
          <ChevronDoubleLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={clsx(
            "rounded-lg p-2 transition",
            page === 1
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-slate-100"
          )}
          aria-label="前のページ"
        >
          <ChevronLeftIcon className="h-5 w-5 text-slate-600" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 py-1 text-slate-500"
              >
                ...
              </span>
            );
          }

          const pageNumber = pageNum as number;
          return (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={clsx(
                "min-w-[2.5rem] rounded-lg px-3 py-1.5 text-sm font-medium transition",
                page === pageNumber
                  ? "bg-brand-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={clsx(
            "rounded-lg p-2 transition",
            page === totalPages
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-slate-100"
          )}
          aria-label="次のページ"
        >
          <ChevronRightIcon className="h-5 w-5 text-slate-600" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages}
          className={clsx(
            "rounded-lg p-2 transition",
            page === totalPages
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-slate-100"
          )}
          aria-label="最後のページ"
        >
          <ChevronDoubleRightIcon className="h-5 w-5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

