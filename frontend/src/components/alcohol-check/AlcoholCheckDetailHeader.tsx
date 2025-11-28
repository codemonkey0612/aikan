import { useAvatar } from "../../hooks/useAvatar";
import type { AlcoholCheck } from "../../api/types";

interface AlcoholCheckDetailHeaderProps {
  check: AlcoholCheck;
  getUserName: (check: AlcoholCheck) => string;
  formatDateTime: (dateString: string) => string;
}

export function AlcoholCheckDetailHeader({
  check,
  getUserName,
  formatDateTime,
}: AlcoholCheckDetailHeaderProps) {
  const userName = getUserName(check);
  const { data: avatarUrl } = useAvatar(check.user_id);

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={userName}
          className="h-10 w-10 rounded-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-600 ${
          avatarUrl ? "hidden" : ""
        }`}
      >
        {userName.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-600">
          {formatDateTime(check.checked_at)}
        </p>
        <p className="text-lg font-semibold text-slate-900">{userName}</p>
        <p className="text-sm font-bold text-slate-700">
          {check.breath_alcohol_concentration.toFixed(2)} mg/L
        </p>
      </div>
    </>
  );
}

