import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNurseAvailabilities } from "../hooks/useNurseAvailability";
import { useUsers } from "../hooks/useUsers";
import { useAvatar } from "../hooks/useAvatar";
import { getDefaultAvatar } from "../utils/defaultAvatars";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { NurseAvailability } from "../api/types";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function ViewNurseAvailabilityPage() {
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    // Default to next month
    now.setMonth(now.getMonth() + 1);
    return now;
  });

  const yearMonth = formatYearMonth(currentMonth);

  // Fetch all availabilities for the selected month, optionally filtered by nurse
  const { data: availabilities, isLoading } = useNurseAvailabilities({
    year_month: yearMonth,
    nurse_id: selectedNurseId || undefined,
  });

  // Get nurses with nurse_id
  const nurses = useMemo(() => {
    return users?.filter((u) => u.nurse_id && u.role === "nurse") || [];
  }, [users]);

  // Group availabilities by nurse
  const availabilitiesByNurse = useMemo(() => {
    const map = new Map<string, NurseAvailability>();
    availabilities?.forEach((avail) => {
      map.set(avail.nurse_id, avail);
    });
    return map;
  }, [availabilities]);

  // Calendar setup
  const monthLabel = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    for (let i = 0; i < startWeekday; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }
    return days;
  }, [currentMonth]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  // Get nurse name
  const getNurseName = (nurseId: string) => {
    const nurse = nurses.find((n) => n.nurse_id === nurseId);
    return nurse ? `${nurse.last_name} ${nurse.first_name}` : nurseId;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          看護師の希望シフト確認
        </h1>
        <p className="text-sm text-slate-500">
          {monthLabel}の看護師の希望シフトを確認できます
        </p>
      </header>

      {/* Filter */}
      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <UserGroupIcon className="h-5 w-5" />
            看護師:
          </label>
          <select
            value={selectedNurseId}
            onChange={(e) => setSelectedNurseId(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">すべての看護師</option>
            {nurses.map((nurse) => (
              <option key={nurse.id || nurse.nurse_id || `nurse-${nurse.email}`} value={nurse.nurse_id}>
                {nurse.last_name} {nurse.first_name} ({nurse.nurse_id})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">登録看護師数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {nurses.length} 名
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">希望シフト提出者数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {availabilities?.length || 0} 名
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">提出済み</p>
            <p className="text-2xl font-semibold text-slate-900">
              {availabilities?.filter((a) => a.status === "submitted").length || 0} 名
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar View for Selected Nurse */}
      {selectedNurseId && availabilitiesByNurse.has(selectedNurseId) && (
        <Card
          title={`${getNurseName(selectedNurseId)} - ${monthLabel}`}
          actions={
            <button
              onClick={() =>
                navigate(
                  `/view-nurse-availability/${selectedNurseId}/${yearMonth}`
                )
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              詳細を見る →
            </button>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => changeMonth(-1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                前の月
              </button>
              <div className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <CalendarDaysIcon className="h-6 w-6 text-brand-600" />
                {monthLabel}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                次の月
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="uppercase tracking-wide">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-3"
                    />
                  );
                }
                const key = formatKey(day);
                const availability = availabilitiesByNurse.get(selectedNurseId);
                const dayData = availability?.availability_data[key] || {
                  available: false,
                };
                const isToday = formatKey(day) === formatKey(new Date());

                return (
                  <div
                    key={key}
                    className={`flex flex-col rounded-2xl border p-3 text-sm ${
                      isToday
                        ? "border-brand-300 bg-brand-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                      <span>{day.getDate()}</span>
                      {dayData.available && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {dayData.available && (
                      <div className="mt-2 space-y-1">
                        {dayData.time_slots && dayData.time_slots.length > 0 && (
                          <div className="space-y-1">
                            {dayData.time_slots.map((slot, idx) => (
                              <div
                                key={`${key}-slot-${idx}-${slot}`}
                                className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs"
                              >
                                <ClockIcon className="h-3 w-3 text-green-600" />
                                <span className="text-green-700">{slot}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {dayData.notes && (
                          <p className="text-xs text-slate-500 truncate">
                            {dayData.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {availability && (
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-500">
                  ステータス:{" "}
                  <span className="font-medium">
                    {availability.status === "draft"
                      ? "下書き"
                      : availability.status === "submitted"
                      ? "提出済み"
                      : "承認済み"}
                  </span>
                  {availability.submitted_at && (
                    <span className="ml-4 text-xs text-slate-400">
                      提出日時:{" "}
                      {new Date(availability.submitted_at).toLocaleString("ja-JP")}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* List View - All Nurses */}
      <Card title="看護師一覧">
        {availabilities && availabilities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    看護師
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    看護師ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    提出日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    利用可能日数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {availabilities.map((availability) => {
                  const nurseName = getNurseName(availability.nurse_id);
                  const nurse = nurses.find((n) => n.nurse_id === availability.nurse_id);
                  const availableDays = Object.values(
                    availability.availability_data
                  ).filter((d) => d.available).length;

                  return (
                    <NurseRow
                      key={availability.id}
                      availability={availability}
                      nurse={nurse}
                      nurseName={nurseName}
                      availableDays={availableDays}
                      yearMonth={yearMonth}
                      navigate={navigate}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>希望シフトの提出がありません。</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Separate component for nurse row to use hooks
function NurseRow({
  availability,
  nurse,
  nurseName,
  availableDays,
  yearMonth,
  navigate,
}: {
  availability: NurseAvailability;
  nurse?: { id?: number; role?: string; last_name?: string; first_name?: string };
  nurseName: string;
  availableDays: number;
  yearMonth: string;
  navigate: (path: string) => void;
}) {
  const { data: avatarUrl } = useAvatar(nurse?.id);

  const getUserInitials = () => {
    if (nurse?.last_name && nurse?.first_name) {
      return `${nurse.last_name.charAt(0)}${nurse.first_name.charAt(0)}`.toUpperCase();
    }
    return "N";
  };

  return (
    <tr
      className="hover:bg-slate-50 cursor-pointer"
      onClick={() =>
        navigate(
          `/view-nurse-availability/${availability.nurse_id}/${yearMonth}`
        )
      }
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img
              src={avatarUrl || getDefaultAvatar(nurse?.role as any)}
              alt={nurseName}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <span className="hidden text-brand-600 font-semibold text-sm">
              {getUserInitials()}
            </span>
          </div>
          <span className="text-sm font-medium text-slate-900">{nurseName}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {availability.nurse_id}
      </td>
      <td className="px-4 py-3 text-sm">
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
            availability.status === "submitted"
              ? "bg-green-100 text-green-700"
              : availability.status === "approved"
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {availability.status === "draft"
            ? "下書き"
            : availability.status === "submitted"
            ? "提出済み"
            : "承認済み"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {availability.submitted_at
          ? new Date(availability.submitted_at).toLocaleString("ja-JP")
          : "-"}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">
        {availableDays} 日
      </td>
    </tr>
  );
}

