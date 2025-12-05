import { useState, useMemo, useEffect } from "react";
import { useFacilities } from "../hooks/useFacilities";
import {
  useFacilityShiftRequestByFacilityAndMonth,
  useCreateFacilityShiftRequest,
  useUpdateFacilityShiftRequest,
} from "../hooks/useFacilityShiftRequests";
import { Card } from "../components/ui/Card";
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
        required_nurses: requestData[key]?.required_nurses || 1,
        notes: requestData[key]?.notes || "",
      },
    });
  };

  const handleRequiredNursesChange = (date: Date, count: number) => {
    const key = formatKey(date);
    setRequestData({
      ...requestData,
      [key]: {
        time_slots: requestData[key]?.time_slots || [],
        required_nurses: count,
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
        required_nurses: requestData[key]?.required_nurses || 1,
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
        <p className="text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          施設シフト依頼
        </h1>
        <p className="text-slate-500">
          {monthLabel}のシフト依頼を入力してください
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <BuildingOffice2Icon className="h-5 w-5" />
              施設:
            </label>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                {calendarDays.map((day) => {
                  const key = formatKey(day);
                  const dayData = requestData[key] || {
                    time_slots: [],
                    required_nurses: 1,
                  };
                  const isToday = formatKey(day) === formatKey(new Date());
                  const dayOfWeek = day.getDay();
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                  return (
                    <div
                      key={key}
                      className={`flex flex-col rounded-2xl border p-3 text-sm ${
                        isToday
                          ? "border-brand-300 bg-brand-50"
                          : isWeekend
                          ? "border-slate-200 bg-slate-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-600 mb-2">
                        {day.getDate()}
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-slate-500 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            時間帯
                          </label>
                          <input
                            type="text"
                            placeholder="例: 15:00-20:00"
                            value={dayData.time_slots?.join(",") || ""}
                            onChange={(e) => {
                              const slots = e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean);
                              handleTimeSlotChange(day, slots);
                            }}
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-500">
                            必要人数
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={dayData.required_nurses || 1}
                            onChange={(e) =>
                              handleRequiredNursesChange(
                                day,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs mt-1"
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

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleSave("draft")}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  下書き保存
                </button>
                <button
                  onClick={() => handleSave("submitted")}
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
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

