import { useMemo, useState } from "react";
import { useNurseAvailabilities } from "../hooks/useNurseAvailability";
import { useFacilityShiftRequests } from "../hooks/useFacilityShiftRequests";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import { useCreateShift } from "../hooks/useShifts";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import type { NurseAvailability, FacilityShiftRequest } from "../api/types";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

// Helper function to format date key
const formatKey = (date: Date) => date.toISOString().slice(0, 10);

// Helper function to parse time slot (e.g., "09:00-12:00")
const parseTimeSlot = (timeSlot: string) => {
  const [start, end] = timeSlot.split("-");
  return { start, end };
};

// Helper function to check if time slots overlap
const timeSlotsOverlap = (slot1: string, slot2: string): boolean => {
  const { start: start1, end: end1 } = parseTimeSlot(slot1);
  const { start: start2, end: end2 } = parseTimeSlot(slot2);
  
  const time1Start = parseInt(start1.replace(":", ""));
  const time1End = parseInt(end1.replace(":", ""));
  const time2Start = parseInt(start2.replace(":", ""));
  const time2End = parseInt(end2.replace(":", ""));
  
  return time1Start < time2End && time2Start < time1End;
};

interface ShiftMatch {
  date: string;
  nurse_id: string;
  nurse_name: string;
  facility_id: string;
  facility_name: string;
  time_slot: string;
  availability_id: number;
  request_id: number;
}

export function ShiftPlanningPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    // Default to next month
    now.setMonth(now.getMonth() + 1);
    now.setDate(1);
    return now;
  });

  const yearMonth = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

  // Fetch data
  const { data: users } = useUsers();
  const { data: facilities } = useFacilities();
  const { data: availabilities, isLoading: loadingAvailabilities } = useNurseAvailabilities({
    year_month: yearMonth,
    status: "submitted",
  });
  const { data: requests, isLoading: loadingRequests } = useFacilityShiftRequests({
    year_month: yearMonth,
    status: "submitted",
  });
  const createShiftMutation = useCreateShift();

  // Create maps for quick lookup
  const nurseMap = useMemo(() => {
    const map = new Map<string, string>();
    users?.forEach((u) => {
      if (u.nurse_id) {
        map.set(u.nurse_id, `${u.last_name} ${u.first_name}`);
      }
    });
    return map;
  }, [users]);

  const facilityMap = useMemo(() => {
    const map = new Map<string, string>();
    facilities?.forEach((f) => {
      if (f.facility_id) {
        map.set(f.facility_id, f.name);
      }
    });
    return map;
  }, [facilities]);

  // Find matches between availability and requests
  const matches = useMemo<ShiftMatch[]>(() => {
    if (!availabilities || !requests) return [];

    const matchesList: ShiftMatch[] = [];

    availabilities.forEach((availability: NurseAvailability) => {
      if (!availability.availability_data || availability.status !== "submitted") return;

      requests.forEach((request: FacilityShiftRequest) => {
        if (!request.request_data || request.status !== "submitted") return;

        // Check each date in availability
        Object.keys(availability.availability_data).forEach((date) => {
          const availData = availability.availability_data[date];
          if (!availData.available || !availData.time_slots) return;

          // Check if request has data for this date
          const requestData = request.request_data[date];
          if (!requestData || !requestData.time_slots) return;

          // Find overlapping time slots
          availData.time_slots.forEach((availSlot) => {
            requestData.time_slots.forEach((requestSlot) => {
              if (timeSlotsOverlap(availSlot, requestSlot)) {
                matchesList.push({
                  date,
                  nurse_id: availability.nurse_id,
                  nurse_name: nurseMap.get(availability.nurse_id) || availability.nurse_id,
                  facility_id: request.facility_id,
                  facility_name: facilityMap.get(request.facility_id) || request.facility_id,
                  time_slot: requestSlot, // Use request time slot
                  availability_id: availability.id,
                  request_id: request.id,
                });
              }
            });
          });
        });
      });
    });

    return matchesList;
  }, [availabilities, requests, nurseMap, facilityMap]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    const map = new Map<string, ShiftMatch[]>();
    matches.forEach((match) => {
      const list = map.get(match.date) ?? [];
      list.push(match);
      map.set(match.date, list);
    });
    return map;
  }, [matches]);

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

  const handleCreateShift = async (match: ShiftMatch) => {
    try {
      const [startTime, endTime] = match.time_slot.split("-");
      const startDatetime = new Date(`${match.date}T${startTime}:00`);
      const endDatetime = new Date(`${match.date}T${endTime}:00`);
      
      await createShiftMutation.mutateAsync({
        facility_id: match.facility_id,
        facility_name: match.facility_name,
        nurse_id: match.nurse_id,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        shift_period: yearMonth,
      });
      
      alert(`シフトを作成しました: ${match.nurse_name} - ${match.facility_name} (${match.date} ${match.time_slot})`);
    } catch (error: any) {
      alert(`エラー: ${error.message || "シフトの作成に失敗しました"}`);
    }
  };

  const handleCreateAllShifts = async () => {
    if (!confirm(`${matches.length}件のシフトを作成しますか？`)) return;

    try {
      const promises = matches.map((match) => {
        const [startTime, endTime] = match.time_slot.split("-");
        const startDatetime = new Date(`${match.date}T${startTime}:00`);
        const endDatetime = new Date(`${match.date}T${endTime}:00`);
        
        return createShiftMutation.mutateAsync({
          facility_id: match.facility_id,
          facility_name: match.facility_name,
          nurse_id: match.nurse_id,
          start_datetime: startDatetime.toISOString(),
          end_datetime: endDatetime.toISOString(),
          shift_period: yearMonth,
        });
      });

      await Promise.all(promises);
      alert(`${matches.length}件のシフトを作成しました`);
    } catch (error: any) {
      alert(`エラー: ${error.message || "シフトの作成に失敗しました"}`);
    }
  };

  if (loadingAvailabilities || loadingRequests) {
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
          シフト計画
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          看護師の希望シフトと施設の依頼を確認してシフトを作成
        </h1>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">看護師の希望シフト</p>
            <p className="text-2xl font-semibold text-slate-900">
              {availabilities?.length || 0} 件
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">施設のシフト依頼</p>
            <p className="text-2xl font-semibold text-slate-900">
              {requests?.length || 0} 件
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">マッチング候補</p>
            <p className="text-2xl font-semibold text-slate-900">
              {matches.length} 件
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar View */}
      <Card title={`${monthLabel} - マッチング候補`}>
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
              const dayMatches = matchesByDate.get(key) ?? [];
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
                    {dayMatches.length > 0 && (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] text-green-700">
                        {dayMatches.length} 件
                      </span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayMatches.slice(0, 2).map((match, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-green-50 px-2 py-1 text-xs"
                      >
                        <div className="font-medium text-green-700 truncate">
                          {match.facility_name}
                        </div>
                        <div className="text-[10px] text-green-600 mt-0.5">
                          {match.nurse_name}
                        </div>
                        <div className="text-[10px] text-green-500 mt-0.5">
                          {match.time_slot}
                        </div>
                      </div>
                    ))}
                    {dayMatches.length > 2 && (
                      <p className="text-right text-[10px] text-slate-400">
                        他 {dayMatches.length - 2} 件
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Matches Table */}
      <Card
        title="マッチング候補一覧"
        action={
          matches.length > 0 && (
            <button
              onClick={handleCreateAllShifts}
              disabled={createShiftMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <PlusIcon className="h-4 w-4" />
              すべてのシフトを作成
            </button>
          )
        }
      >
        {matches.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <p>マッチング候補がありません。</p>
            <p className="mt-2 text-sm">
              看護師の希望シフトと施設の依頼が一致する場合、ここに表示されます。
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    日付
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    時間
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    看護師
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    施設
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {matches.map((match, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {new Date(match.date).toLocaleDateString("ja-JP", {
                        month: "long",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {match.time_slot}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {match.nurse_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {match.facility_name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleCreateShift(match)}
                        disabled={createShiftMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                        シフト作成
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

