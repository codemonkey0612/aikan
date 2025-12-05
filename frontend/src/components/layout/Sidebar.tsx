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
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useAuth } from "../../hooks/useAuth";
import { hasAnyPermission } from "../../utils/rbac";
import { UserMenu } from "./UserMenu";

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  permissions?: string[];
}

const allNavItems: NavItem[] = [
  { label: "ダッシュボード", to: "/", icon: ChartBarIcon },
  { label: "ユーザー", to: "/users", icon: UsersIcon, permissions: ["users:read"] },
  { label: "施設", to: "/facilities", icon: BuildingOffice2Icon, permissions: ["facilities:read"] },
  { label: "法人", to: "/corporations", icon: BuildingOffice2Icon, permissions: ["corporations:read"] },
  { label: "入居者", to: "/residents", icon: UserGroupIcon, permissions: ["residents:read"] },
  { label: "バイタル", to: "/vitals", icon: HeartIcon, permissions: ["vitals:read"] },
  { label: "シフト", to: "/shifts", icon: ClockIcon, permissions: ["shifts:read"] },
  { label: "希望シフト提出", to: "/nurse-availability", icon: CalendarIcon, permissions: ["shifts:write"] },
  { label: "施設シフト依頼", to: "/facility-shift-requests", icon: BuildingOffice2Icon, permissions: ["shifts:write"] },
  { label: "給与", to: "/salaries", icon: CurrencyDollarIcon, permissions: ["salaries:read"] },
  { label: "お知らせ", to: "/notifications", icon: MegaphoneIcon, permissions: ["notifications:read"] },
];

export function Sidebar() {
  const { user } = useAuth();

  // ユーザーのロールに応じて表示可能なメニューをフィルタリング
  const navItems = allNavItems.filter((item) => {
    if (!item.permissions) return true; // 権限指定がない場合は常に表示
    if (!user) return false;
    return hasAnyPermission(user.role, item.permissions);
  });

  return (
    <aside className="fixed left-0 top-0 flex h-full w-64 flex-col border-r border-slate-200 bg-white pt-16">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50",
                  isActive && "bg-slate-100 text-brand-600"
                )
              }
              end={item.to === "/"}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <UserMenu />
    </aside>
  );
}

