import { useMemo, useState } from "react";
import { useShifts } from "../hooks/useShifts";
import { useVisits } from "../hooks/useVisits";
import { useMyAttendance } from "../hooks/useAttendance";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import { useResidents } from "../hooks/useResidents";
import type { Shift, Visit, Attendance } from "../api/types";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

interface DayData {
  shifts: Shift[];
  visits: Visit[];
  attendances: Attendance[];
}

export function CalendarPage() {
  const { data: users } = useUsers();
  const { data: facilities } = useFacilities();
  const { data: residents } = useResidents();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // 月の開始日と終了日を計算
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data: shiftsData } = useShifts({
    date_from: monthStart.toISOString().slice(0, 10),
    date_to: monthEnd.toISOString().slice(0, 10),
  });

  const { data: visitsData } = useVisits({
    visited_from: monthStart.toISOString().slice(0, 10),
    visited_to: monthEnd.toISOString().slice(0, 10),
    limit: 1000,
  });

  const { data: attendancesData } = useMyAttendance(1000);

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

  // 入所者IDから入所者名へのマッピング
  const residentMap = useMemo(() => {
    const map = new Map<string, string>();
    residents?.forEach((r) => {
      if (r.resident_id) {
        map.set(r.resident_id, `${r.last_name} ${r.first_name}`);
      }
    });
    return map;
  }, [residents]);

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

  // 日付ごとにデータをグループ化
  const dataByDate = useMemo(() => {
    const map = new Map<string, DayData>();

    // シフトをグループ化
    shiftsData?.data?.forEach((shift) => {
      if (!shift.start_datetime) return;
      const date = new Date(shift.start_datetime);
      const key = formatKey(date);
      const dayData = map.get(key) || { shifts: [], visits: [], attendances: [] };
      dayData.shifts.push(shift);
      map.set(key, dayData);
    });

    // 訪問をグループ化
    visitsData?.data?.forEach((visit) => {
      if (!visit.visited_at) return;
      const date = new Date(visit.visited_at);
      const key = formatKey(date);
      const dayData = map.get(key) || { shifts: [], visits: [], attendances: [] };
      dayData.visits.push(visit);
      map.set(key, dayData);
    });

    // 出退勤をグループ化
    attendancesData?.forEach((attendance) => {
      const date = attendance.check_in_at
        ? new Date(attendance.check_in_at)
        : attendance.created_at
        ? new Date(attendance.created_at)
        : null;
      if (!date) return;
      const key = formatKey(date);
      const dayData = map.get(key) || { shifts: [], visits: [], attendances: [] };
      dayData.attendances.push(attendance);
      map.set(key, dayData);
    });

    return map;
  }, [shiftsData, visitsData, attendancesData]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
    setExpandedDate(null);
  };

  const toggleExpand = (dateKey: string) => {
    setExpandedDate(expandedDate === dateKey ? null : dateKey);
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateTime = (datetime: string | null) => {
    if (!datetime) return "--";
    const date = new Date(datetime);
    return date.toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          勤務管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          シフト・訪問・出退勤カレンダー
        </h1>
      </header>

      <Card title="月間カレンダー">
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
              const dayData = dataByDate.get(key) || { shifts: [], visits: [], attendances: [] };
              const isToday = formatKey(day) === formatKey(new Date());
              const isExpanded = expandedDate === key;
              const totalCount = dayData.shifts.length + dayData.visits.length + dayData.attendances.length;

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
                    {totalCount > 0 && (
                      <button
                        onClick={() => toggleExpand(key)}
                        className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 hover:bg-slate-200"
                      >
                        {totalCount} 件
                        {isExpanded ? (
                          <ChevronUpIcon className="h-3 w-3" />
                        ) : (
                          <ChevronDownIcon className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {!isExpanded && (
                      <>
                        {dayData.shifts.slice(0, 2).map((shift) => {
                          const nurseName = shift.nurse_id
                            ? nurseMap.get(shift.nurse_id) || shift.nurse_id
                            : "未設定";
                          const facilityName = shift.facility_id
                            ? shift.facility_name || facilityMap.get(shift.facility_id) || shift.facility_id
                            : "未設定";
                          return (
                            <div
                              key={`shift-${shift.id}`}
                              className="rounded-lg bg-blue-100 px-2 py-1 text-xs text-blue-700"
                              title={`シフト: ${nurseName} - ${facilityName}`}
                            >
                              📅 {nurseName}
                            </div>
                          );
                        })}
                        {dayData.visits.slice(0, 1).map((visit) => {
                          const residentName = visit.resident_id
                            ? residentMap.get(visit.resident_id) || visit.resident_id
                            : "未設定";
                          return (
                            <div
                              key={`visit-${visit.id}`}
                              className="rounded-lg bg-green-100 px-2 py-1 text-xs text-green-700"
                              title={`訪問: ${residentName}`}
                            >
                              🏠 {residentName}
                            </div>
                          );
                        })}
                        {dayData.attendances.slice(0, 1).map((attendance) => {
                          const status = attendance.check_in_at && attendance.check_out_at
                            ? "完了"
                            : attendance.check_in_at
                            ? "出勤中"
                            : "未出勤";
                          return (
                            <div
                              key={`attendance-${attendance.id}`}
                              className="rounded-lg bg-purple-100 px-2 py-1 text-xs text-purple-700"
                              title={`出退勤: ${status}`}
                            >
                              ⏰ {status}
                            </div>
                          );
                        })}
                        {totalCount > 3 && (
                          <p className="text-right text-[10px] text-slate-400">
                            他 {totalCount - 3} 件
                          </p>
                        )}
                      </>
                    )}
                    {isExpanded && (
                      <div className="space-y-3 border-t border-slate-200 pt-2">
                        {/* シフト詳細 */}
                        {dayData.shifts.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold text-slate-700">シフト</h4>
                            <div className="space-y-1">
                              {dayData.shifts.map((shift) => {
                                const nurseName = shift.nurse_id
                                  ? nurseMap.get(shift.nurse_id) || shift.nurse_id
                                  : "未設定";
                                const facilityName = shift.facility_id
                                  ? shift.facility_name || facilityMap.get(shift.facility_id) || shift.facility_id
                                  : "未設定";
                                const timeRange = shift.start_datetime
                                  ? formatTime(shift.start_datetime)
                                  : "";
                                return (
                                  <div
                                    key={shift.id}
                                    className="rounded-lg bg-blue-50 px-2 py-1.5 text-xs"
                                  >
                                    <div className="font-medium text-blue-900">
                                      {nurseName} - {facilityName}
                                    </div>
                                    {timeRange && (
                                      <div className="text-blue-600">{timeRange}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 訪問詳細 */}
                        {dayData.visits.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold text-slate-700">訪問</h4>
                            <div className="space-y-1">
                              {dayData.visits.map((visit) => {
                                const residentName = visit.resident_id
                                  ? residentMap.get(visit.resident_id) || visit.resident_id
                                  : "未設定";
                                const visitTime = formatTime(visit.visited_at);
                                return (
                                  <div
                                    key={visit.id}
                                    className="rounded-lg bg-green-50 px-2 py-1.5 text-xs"
                                  >
                                    <div className="font-medium text-green-900">
                                      {residentName}
                                    </div>
                                    <div className="text-green-600">{visitTime}</div>
                                    {visit.note && (
                                      <div className="mt-1 text-green-600">{visit.note}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 出退勤詳細 */}
                        {dayData.attendances.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-xs font-semibold text-slate-700">出退勤</h4>
                            <div className="space-y-1">
                              {dayData.attendances.map((attendance) => {
                                const checkInTime = formatDateTime(attendance.check_in_at);
                                const checkOutTime = formatDateTime(attendance.check_out_at);
                                return (
                                  <div
                                    key={attendance.id}
                                    className="rounded-lg bg-purple-50 px-2 py-1.5 text-xs"
                                  >
                                    <div className="font-medium text-purple-900">
                                      チェックイン: {checkInTime}
                                    </div>
                                    {checkOutTime !== "--" && (
                                      <div className="text-purple-600">
                                        チェックアウト: {checkOutTime}
                                      </div>
                                    )}
                                    <div className="mt-1 flex gap-1">
                                      <span
                                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                                          attendance.check_in_status === "CONFIRMED"
                                            ? "bg-green-100 text-green-700"
                                            : attendance.check_in_status === "REJECTED"
                                            ? "bg-red-100 text-red-700"
                                            : "bg-yellow-100 text-yellow-700"
                                        }`}
                                      >
                                        {attendance.check_in_status === "CONFIRMED"
                                          ? "確認済み"
                                          : attendance.check_in_status === "REJECTED"
                                          ? "却下"
                                          : "確認待ち"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {totalCount === 0 && (
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

