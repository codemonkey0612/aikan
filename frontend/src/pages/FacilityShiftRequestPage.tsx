import { useState, useMemo, useEffect } from "react";
import { useFacilities } from "../hooks/useFacilities";
import {
  useFacilityShiftRequestByFacilityAndMonth,
  useCreateFacilityShiftRequest,
  useUpdateFacilityShiftRequest,
} from "../hooks/useFacilityShiftRequests";
import { Card } from "../components/ui/Card";
import { TimeSlotPicker } from "../components/ui/TimeSlotPicker";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import type { FacilityShiftRequest } from "../api/types";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function FacilityShiftRequestPage() {
  const { data: facilities } = useFacilities();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    // 次の月を表示
    now.setMonth(now.getMonth() + 1);
    return now;
  });

  const yearMonth = formatYearMonth(currentMonth);

  const { data: existingRequest, isLoading } =
    useFacilityShiftRequestByFacilityAndMonth(
      selectedFacilityId,
      yearMonth
    );

  const createMutation = useCreateFacilityShiftRequest();
  const updateMutation = useUpdateFacilityShiftRequest();

  const [requestData, setRequestData] = useState<
    FacilityShiftRequest["request_data"]
  >({});

  // 既存データをロード
  useEffect(() => {
    if (existingRequest?.request_data) {
      setRequestData(existingRequest.request_data);
    } else {
      setRequestData({});
    }
  }, [existingRequest]);

  // 月の日付を生成
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const handleTimeSlotChange = (date: Date, timeSlots: string[]) => {
    const key = formatKey(date);
    setRequestData({
      ...requestData,
      [key]: {
        time_slots: timeSlots,
        notes: requestData[key]?.notes || "",
      },
    });
  };

  const handleNotesChange = (date: Date, notes: string) => {
    const key = formatKey(date);
    setRequestData({
      ...requestData,
      [key]: {
        time_slots: requestData[key]?.time_slots || [],
        notes,
      },
    });
  };

  const handleSave = async (status: "draft" | "submitted") => {
    if (!selectedFacilityId) {
      alert("施設を選択してください");
      return;
    }

    try {
      if (existingRequest) {
        await updateMutation.mutateAsync({
          id: existingRequest.id,
          data: {
            request_data: requestData,
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          facility_id: selectedFacilityId,
          year_month: yearMonth,
          request_data: requestData,
          status,
        });
      }
      alert(status === "submitted" ? "提出しました" : "下書きを保存しました");
    } catch (error: any) {
      alert(`エラー: ${error.message}`);
    }
  };

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
        <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          施設シフト依頼
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {monthLabel}のシフト依頼を入力してください
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BuildingOffice2Icon className="h-5 w-5" />
              施設:
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">施設を選択</option>
              {facilities?.map((facility) => (
                <option key={facility.facility_id} value={facility.facility_id}>
                  {facility.name}
                </option>
              ))}
            </select>
          </div>

          {selectedFacilityId && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => changeMonth(-1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:bg-slate-50"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">前の月</span>
                </button>
                <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-800">
                  <CalendarDaysIcon className="h-5 w-5 sm:h-6 sm:w-6 text-brand-600" />
                  <span className="whitespace-nowrap">{monthLabel}</span>
                </div>
                <button
                  onClick={() => changeMonth(1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-slate-600 hover:bg-slate-50"
                >
                  <span className="hidden sm:inline">次の月</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="hidden md:grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
                {WEEK_DAYS.map((day) => (
                  <div key={day} className="uppercase tracking-wide">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-2 md:gap-2">
                {calendarDays.map((day) => {
                  const key = formatKey(day);
                  const dayData = requestData[key] || {
                    time_slots: [],
                  };
                  const isToday = formatKey(day) === formatKey(new Date());
                  const dayOfWeek = day.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  const dayName = WEEK_DAYS[dayOfWeek];
                  const dateStr = day.toLocaleDateString("ja-JP", {
                    month: "short",
                    day: "numeric",
                  });

                  return (
                    <div
                      key={key}
                      className={`flex flex-col rounded-lg md:rounded-2xl border p-3 md:p-3 text-sm ${
                        isToday
                          ? "border-brand-300 bg-brand-50"
                          : isWeekend
                          ? "border-slate-200 bg-slate-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm md:text-xs font-semibold text-slate-600">
                          {dateStr}
                        </span>
                        <span className="text-xs text-slate-400 md:hidden">
                          ({dayName})
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                            <ClockIcon className="h-3 w-3" />
                            時間帯
                          </label>
                          <TimeSlotPicker
                            value={dayData.time_slots || []}
                            onChange={(slots) => handleTimeSlotChange(day, slots)}
                            placeholder="時間帯を追加"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">備考</label>
                          <textarea
                            value={dayData.notes || ""}
                            onChange={(e) =>
                              handleNotesChange(day, e.target.value)
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs mt-1"
                            rows={2}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="w-full sm:w-auto rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  下書き保存
                </button>
                <button
                  onClick={() => handleSave("submitted")}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="w-full sm:w-auto rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  提出
                </button>
              </div>

              {existingRequest && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500">
                    ステータス:{" "}
                    <span className="font-medium">
                      {existingRequest.status === "draft"
                        ? "下書き"
                        : existingRequest.status === "submitted"
                        ? "提出済み"
                        : "スケジュール済み"}
                    </span>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

