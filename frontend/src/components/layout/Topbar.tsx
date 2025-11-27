import { Bars3Icon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getUserDisplayName = () => {
    if (!user) return "ユーザー";
    if (user.first_name && user.last_name) {
      return `${user.last_name} ${user.first_name}`;
    }
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    return user.email || "ユーザー";
  };

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.first_name && user.last_name) {
      return `${user.last_name.charAt(0)}${user.first_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.last_name) return user.last_name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  const getRoleLabel = () => {
    if (!user) return "";
    switch (user.role) {
      case "ADMIN":
        return "管理者";
      case "NURSE":
        return "看護師";
      case "STAFF":
        return "スタッフ";
      default:
        return "";
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-3">
        <Bars3Icon className="h-6 w-6 text-slate-500 lg:hidden" />
        <span className="text-lg font-semibold text-brand-600">
          ナーシング管理
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-500">
        {user && (
          <>
            <div className="text-right">
              <p className="font-semibold text-slate-700">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-slate-400">
                {user.email || "メール未設定"} {getRoleLabel() && `・${getRoleLabel()}`}
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-semibold">
              {getUserInitials()}
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
            >
              ログアウト
            </button>
          </>
        )}
      </div>
    </header>
  );
}

