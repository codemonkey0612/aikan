import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useFacilities } from "../hooks/useFacilities";
import {
  useFacilityShiftRequestByFacilityAndMonth,
  useCreateFacilityShiftRequest,
  useUpdateFacilityShiftRequest,
} from "../hooks/useFacilityShiftRequests";
import { Card } from "../components/ui/Card";
import { TimeSlotPicker } from "../components/ui/TimeSlotPicker";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import {
  ClockIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import type { FacilityShiftRequest } from "../api/types";

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

  const { data: existingRequest } =
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
      toast.error("施設を選択してください");
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
      toast.success(status === "submitted" ? "提出しました" : "下書きを保存しました");
    } catch (error: any) {
      toast.error(`エラー: ${error.message}`);
    }
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
              <ModernCalendar
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                renderDayContent={(day) => {
                  const key = formatKey(day.date);
                  const dayData = requestData[key] || {
                    time_slots: [],
                  };

                  return (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                          <ClockIcon className="h-3 w-3" />
                          時間帯
                        </label>
                        <TimeSlotPicker
                          value={dayData.time_slots || []}
                          onChange={(slots) => handleTimeSlotChange(day.date, slots)}
                          placeholder="時間帯を追加"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">備考</label>
                        <textarea
                          value={dayData.notes || ""}
                          onChange={(e) =>
                            handleNotesChange(day.date, e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded border border-slate-300 px-2 py-1 text-xs mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                }}
              />

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

