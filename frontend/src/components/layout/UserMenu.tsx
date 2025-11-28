import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAvatar } from "../../hooks/useAvatar";
import { UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { data: avatarUrl } = useAvatar(user?.id);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
    setIsMenuOpen(false);
  };

  const handleViewProfile = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative border-t border-slate-200 bg-white p-4" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex w-full items-center gap-3 rounded-lg p-2 transition hover:bg-slate-50"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={getUserDisplayName()}
            className="h-10 w-10 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-semibold ${
            avatarUrl ? "hidden" : ""
          }`}
        >
          {getUserInitials()}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-slate-900">{getUserDisplayName()}</p>
          <p className="text-xs text-slate-500">{user.email || "メール未設定"}</p>
        </div>
      </button>

      {isMenuOpen && (
        <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="py-1">
            <button
              onClick={handleViewProfile}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <UserCircleIcon className="h-5 w-5 text-slate-400" />
              プロフィールを表示
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 text-slate-400" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

