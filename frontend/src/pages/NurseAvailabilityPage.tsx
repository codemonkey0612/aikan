import { useState, useMemo, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import {
  useNurseAvailabilityByNurseAndMonth,
  useCreateNurseAvailability,
  useUpdateNurseAvailability,
} from "../hooks/useNurseAvailability";
import { Card } from "../components/ui/Card";
import { TimeSlotPicker } from "../components/ui/TimeSlotPicker";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import {
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { NurseAvailability } from "../api/types";

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function NurseAvailabilityPage() {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    // 次の月を表示
    now.setMonth(now.getMonth() + 1);
    return now;
  });

  const yearMonth = formatYearMonth(currentMonth);
  const nurseId = user?.nurse_id || "";

  const { data: existingAvailability, isLoading } =
    useNurseAvailabilityByNurseAndMonth(nurseId, yearMonth);
  const createMutation = useCreateNurseAvailability();
  const updateMutation = useUpdateNurseAvailability();

  const [availabilityData, setAvailabilityData] = useState<
    NurseAvailability["availability_data"]
  >({});

  // 既存データをロード
  useEffect(() => {
    if (existingAvailability?.availability_data) {
      setAvailabilityData(existingAvailability.availability_data);
    } else {
      setAvailabilityData({});
    }
  }, [existingAvailability]);

  const monthLabel = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const handleDateToggle = (date: Date) => {
    const key = formatKey(date);
    const current = availabilityData[key] || { available: false };
    setAvailabilityData({
      ...availabilityData,
      [key]: {
        ...current,
        available: !current.available,
      },
    });
  };

  const handleTimeSlotChange = (date: Date, timeSlots: string[]) => {
    const key = formatKey(date);
    const current = availabilityData[key] || { available: true };
    setAvailabilityData({
      ...availabilityData,
      [key]: {
        ...current,
        available: true,
        time_slots: timeSlots,
      },
    });
  };

  const handleSave = async (status: "draft" | "submitted") => {
    if (!nurseId) {
      toast.error("看護師IDが設定されていません");
      return;
    }

    try {
      if (existingAvailability) {
        await updateMutation.mutateAsync({
          id: existingAvailability.id,
          data: {
            availability_data: availabilityData,
            status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          nurse_id: nurseId,
          year_month: yearMonth,
          availability_data: availabilityData,
          status,
        });
      }
      toast.success(status === "submitted" ? "提出しました" : "下書きを保存しました");
    } catch (error: any) {
      toast.error(`エラー: ${error.message}`);
    }
  };


  if (!user?.nurse_id) {
    return (
      <div className="space-y-6">
        <Card>
          <p className="text-slate-500">看護師IDが設定されていません。</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs sm:text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">
          希望シフト提出
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {monthLabel}の希望シフトを入力してください
        </p>
      </header>

      <Card>
        <div className="flex flex-col gap-4">
          <ModernCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            renderDayContent={(day) => {
              const key = formatKey(day.date);
              const dayData = availabilityData[key] || { available: false };

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-end mb-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateToggle(day.date);
                      }}
                      className={`h-5 w-5 rounded flex items-center justify-center ${
                        dayData.available
                          ? "bg-green-500 text-white"
                          : "bg-slate-200"
                      }`}
                      title={dayData.available ? "利用可能" : "利用不可"}
                    >
                      {dayData.available && (
                        <CheckCircleIcon className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  {dayData.available && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500 mb-1">
                        <ClockIcon className="h-3 w-3" />
                        <span>時間帯</span>
                      </div>
                      <TimeSlotPicker
                        value={dayData.time_slots || []}
                        onChange={(slots) => {
                          handleTimeSlotChange(day.date, slots);
                        }}
                        placeholder="時間帯を追加"
                      />
                    </div>
                  )}
                </div>
              );
            }}
          />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSave("draft")}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              onClick={() => handleSave("submitted")}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="w-full sm:w-auto rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
            >
              提出
            </button>
          </div>

          {existingAvailability && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                ステータス:{" "}
                <span className="font-medium">
                  {existingAvailability.status === "draft"
                    ? "下書き"
                    : existingAvailability.status === "submitted"
                    ? "提出済み"
                    : "承認済み"}
                </span>
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

