import { Bars3Icon } from "@heroicons/react/24/outline";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
          aria-label="メニューを開く"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <span className="text-base lg:text-lg font-semibold text-brand-600">
          ナーシング管理
        </span>
      </div>
    </header>
  );
}

