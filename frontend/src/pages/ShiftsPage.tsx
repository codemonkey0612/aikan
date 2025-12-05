import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import type { Shift } from "../api/types";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

export function ShiftsPage() {
  const { data: users } = useUsers();
  const { data: facilities } = useFacilities();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });

  // 月の開始日と終了日を計算
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data, isLoading } = useShifts({
    date_from: monthStart.toISOString().slice(0, 10),
    date_to: monthEnd.toISOString().slice(0, 10),
  });

  // 看護師IDから看護師名へのマッピング
  const nurseMap = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => {
      if (u.nurse_id) {
        map.set(u.nurse_id, `${u.last_name} ${u.first_name}`);
      }
    });
    return map;
  }, [users]);

  // 施設IDから施設名へのマッピング
  const facilityMap = useMemo(() => {
    const map = new Map<string, string>();
    facilities?.forEach((f) => {
      if (f.facility_id) {
        map.set(f.facility_id, f.name);
      }
    });
    return map;
  }, [facilities]);

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

  // 日付ごとにシフトをグループ化（看護師と施設の組み合わせ）
  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    if (!data?.data) return map;
    data.data.forEach((shift) => {
      if (!shift.start_datetime) return;
      const date = new Date(shift.start_datetime);
      const key = formatKey(date);
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    });
    return map;
  }, [data]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          訪問スケジュール
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">シフト</h1>
      </header>

      <Card title="月間訪問スケジュール">
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
              const dayShifts = shiftsByDate.get(key) ?? [];
              const isToday = formatKey(day) === formatKey(new Date());

              // 施設ごとにグループ化（同じ施設への訪問をまとめる）
              const shiftsByFacility = new Map<string, Shift[]>();
              dayShifts.forEach((shift) => {
                const facilityId = shift.facility_id || "unknown";
                const list = shiftsByFacility.get(facilityId) ?? [];
                list.push(shift);
                shiftsByFacility.set(facilityId, list);
              });

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
                    {dayShifts.length > 0 && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                        {dayShifts.length} 件
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {Array.from(shiftsByFacility.entries()).slice(0, 3).map(([facilityId, shifts]) => {
                      const shift = shifts[0];
                      const facilityName = shift.facility_id
                        ? shift.facility_name || facilityMap.get(shift.facility_id) || shift.facility_id
                        : "未設定";
                      const nurseName = shift.nurse_id
                        ? nurseMap.get(shift.nurse_id) || shift.nurse_id
                        : "未設定";
                      
                      // 時間をフォーマット
                      const startTime = shift.start_datetime
                        ? new Date(shift.start_datetime).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";
                      const endTime = shift.end_datetime
                        ? new Date(shift.end_datetime).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "";
                      const timeDisplay = startTime && endTime 
                        ? `${startTime}-${endTime}`
                        : startTime || "時間未設定";
                      
                      return (
                        <Link
                          key={shift.id}
                          to={`/shifts/${shift.id}`}
                          className="block rounded-lg bg-pink-100 px-2 py-1.5 text-xs transition hover:bg-pink-200"
                          title={`${nurseName} - ${facilityName} (${timeDisplay})`}
                        >
                          <div className="font-medium text-pink-700 truncate">
                            {facilityName}
                          </div>
                          <div className="text-[10px] text-pink-600 mt-0.5">
                            {nurseName}
                          </div>
                          <div className="text-[10px] text-pink-500 mt-0.5">
                            {timeDisplay}
                          </div>
                        </Link>
                      );
                    })}
                    {dayShifts.length > 3 && (
                      <p className="text-right text-[10px] text-slate-400">
                        他 {dayShifts.length - 3} 件
                      </p>
                    )}
                    {dayShifts.length === 0 && (
                      <p className="text-xs text-slate-300">予定なし</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
