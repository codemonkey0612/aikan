import { Bars3Icon, BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
          aria-label="メニューを開く"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Hello, {user?.last_name} {user?.first_name}
          </h1>
          <p className="text-xs text-slate-500">This is your Dashboard</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="検索..."
              className="w-64 rounded-lg border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button className="relative p-2 text-slate-500 hover:text-slate-700">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
          {user?.last_name?.charAt(0) || "U"}
        </div>
      </div>
    </header>
  );
}

