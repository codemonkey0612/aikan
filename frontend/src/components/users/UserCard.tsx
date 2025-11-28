import type { User } from "../../api/types";
import { UserCircleIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "名前未設定";
  const displayName = user.email || `ユーザー #${user.id}`;

  return (
    <div className="group relative rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <UserCircleIcon className="h-8 w-8 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{fullName}</h3>
              <p className="text-sm text-slate-500">{displayName}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
              {user.role}
            </span>
            {user.email && (
              <span className="text-xs text-slate-400">{user.email}</span>
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

