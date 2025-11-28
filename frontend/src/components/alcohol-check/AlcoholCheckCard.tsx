import { useAvatar } from "../../hooks/useAvatar";
import type { AlcoholCheck } from "../../api/types";

interface AlcoholCheckCardProps {
  check: AlcoholCheck;
  onClick: () => void;
  getUserName: (check: AlcoholCheck) => string;
  formatDateTime: (dateString: string) => string;
}

export function AlcoholCheckCard({
  check,
  onClick,
  getUserName,
  formatDateTime,
}: AlcoholCheckCardProps) {
  const userName = getUserName(check);
  const { data: avatarUrl } = useAvatar(check.user_id);

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* デバイス画像プレースホルダー */}
      <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-slate-100">
        {check.device_image_path ? (
          <img
            src={check.device_image_path}
            alt="アルコールチェックデバイス"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="text-center text-slate-400">
            <div className="text-2xl font-bold">0.0</div>
            <div className="text-xs">g/L</div>
            <div className="text-xs">0.00 %BAC</div>
          </div>
        )}
      </div>

      {/* 日時 */}
      <p className="mb-2 text-xs font-medium text-slate-600">
        {formatDateTime(check.checked_at)}
      </p>

      {/* ユーザー名とアバター */}
      <div className="mb-2 flex items-center gap-2">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="h-6 w-6 rounded-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-600 ${
            avatarUrl ? "hidden" : ""
          }`}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-slate-900">{userName}</p>
      </div>

      {/* 結果 */}
      <p className="text-sm font-bold text-slate-700">
        {check.breath_alcohol_concentration.toFixed(2)} mg/L
      </p>
    </div>
  );
}

