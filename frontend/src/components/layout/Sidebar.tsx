import { NavLink } from "react-router-dom";
import {
  BuildingOffice2Icon,
  ChartBarIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  MegaphoneIcon,
  UserGroupIcon,
  UsersIcon,
  HeartIcon,
  MapPinIcon,
  CalendarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useAuth } from "../../hooks/useAuth";
import type { UserRole } from "../../api/types";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
}

const allNavItems: NavItem[] = [
  { label: "ダッシュボード", to: "/", icon: ChartBarIcon, allowedRoles: ["admin", "nurse", "facility_manager"] },
  { label: "ユーザー", to: "/users", icon: UsersIcon, allowedRoles: ["admin"] },
  { label: "施設", to: "/facilities", icon: BuildingOffice2Icon, allowedRoles: ["admin"] },
  { label: "法人", to: "/corporations", icon: BuildingOffice2Icon, allowedRoles: ["admin"] },
  { label: "入居者", to: "/residents", icon: UserGroupIcon, allowedRoles: ["admin"] },
  { label: "バイタル", to: "/vitals", icon: HeartIcon, allowedRoles: ["admin"] },
  { label: "シフト", to: "/shifts", icon: ClockIcon, allowedRoles: ["admin", "nurse", "facility_manager"] },
  { label: "シフト計画", to: "/shift-planning", icon: CalendarIcon, allowedRoles: ["admin"] },
  { label: "看護師希望シフト確認", to: "/view-nurse-availability", icon: UserGroupIcon, allowedRoles: ["admin"] },
  { label: "施設シフト依頼確認", to: "/view-facility-shift-requests", icon: BuildingOffice2Icon, allowedRoles: ["admin"] },
  { label: "希望シフト提出", to: "/nurse-availability", icon: CalendarIcon, allowedRoles: ["nurse"] },
  { label: "施設シフト依頼", to: "/facility-shift-requests", icon: BuildingOffice2Icon, allowedRoles: ["facility_manager"] },
  { label: "給与", to: "/salaries", icon: CurrencyDollarIcon, allowedRoles: ["admin"] },
  { label: "お知らせ", to: "/notifications", icon: MegaphoneIcon, allowedRoles: ["admin", "nurse", "facility_manager"] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  // On desktop (lg+), sidebar is always visible. On mobile, it's controlled by isOpen prop.
  const isDesktopOpen = isOpen === undefined ? true : isOpen;
  const { user } = useAuth();

  // ユーザーのロールに応じて表示可能なメニューをフィルタリング
  const navItems = allNavItems.filter((item) => {
    if (!item.allowedRoles) return true; // ロール指定がない場合は常に表示
    if (!user) return false;
    return item.allowedRoles.includes(user.role);
  });

  return (
    <>
      <aside
        className={clsx(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 pt-16 transition-transform duration-300 ease-in-out shadow-2xl",
          "lg:translate-x-0",
          isDesktopOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden p-2 text-white/80 hover:text-white"
          aria-label="メニューを閉じる"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-6 px-3">
            <h2 className="text-xl font-bold text-white mb-1">ナーシング管理</h2>
            <p className="text-xs text-blue-100">Nursing System</p>
          </div>
          {user && (
            <div className="mb-6 px-3 py-3 rounded-lg bg-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
                  {user.last_name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {user.last_name} {user.first_name}
                  </p>
                  <p className="text-xs text-blue-100">{user.role}</p>
                </div>
              </div>
            </div>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => onClose?.()}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-sm"
                      : "text-blue-100 hover:bg-white/10 hover:text-white"
                  )
                }
                end={item.to === "/"}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}

