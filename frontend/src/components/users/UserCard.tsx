import type { User } from "../../api/types";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAvatar } from "../../hooks/useAvatar";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const { data: avatarUrl } = useAvatar(user.id);
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "名前未設定";
  const displayName = user.email || `ユーザー #${user.id}`;

  const getUserInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.last_name.charAt(0)}${user.first_name.charAt(0)}`.toUpperCase();
    }
    if (user.first_name) return user.first_name.charAt(0).toUpperCase();
    if (user.last_name) return user.last_name.charAt(0).toUpperCase();
    if (user.email) return user.email.charAt(0).toUpperCase();
    return "U";
  };

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="h-12 w-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-semibold text-sm ${
                  avatarUrl ? "hidden" : ""
                }`}
              >
                {getUserInitials()}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{fullName}</h3>
              <p className="text-sm text-slate-500">{displayName}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {user.role === "admin" ? "管理者" : 
               user.role === "nurse" ? "看護師" :
               user.role === "facility_manager" ? "施設管理者" :
               user.role === "corporate_officer" ? "法人担当者" : user.role}
            </span>
            {user.nurse_id && (
              <span className="text-xs text-slate-500">ID: {user.nurse_id}</span>
            )}
            {user.position && (
              <span className="text-xs text-slate-500">{user.position}</span>
            )}
            {user.alcohol_check && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                アルコールチェック
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 opacity-0 transition group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={() => onEdit(user)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
              title="編集"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(user)}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
              title="削除"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

