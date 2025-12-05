import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  useNurseAvailabilityByNurseAndMonth,
  useCreateNurseAvailability,
  useUpdateNurseAvailability,
} from "../hooks/useNurseAvailability";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
      alert("看護師IDが設定されていません");
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
        <p className="text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          希望シフト提出
        </h1>
        <p className="text-slate-500">
          {monthLabel}の希望シフトを入力してください
        </p>
      </header>

      <Card>
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
            {calendarDays.map((day) => {
              const key = formatKey(day);
              const dayData = availabilityData[key] || { available: false };
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600">
                      {day.getDate()}
                    </span>
                    <button
                      onClick={() => handleDateToggle(day)}
                      className={`h-5 w-5 rounded ${
                        dayData.available
                          ? "bg-green-500 text-white"
                          : "bg-slate-200"
                      }`}
                      title={dayData.available ? "利用可能" : "利用不可"}
                    >
                      {dayData.available && (
                        <CheckCircleIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {dayData.available && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <ClockIcon className="h-3 w-3" />
                        <span>時間帯</span>
                      </div>
                      <input
                        type="text"
                        placeholder="例: 09:00-12:00,14:00-17:00"
                        value={dayData.time_slots?.join(",") || ""}
                        onChange={(e) => {
                          const slots = e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean);
                          handleTimeSlotChange(day, slots);
                        }}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={() => handleSave("draft")}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              下書き保存
            </button>
            <button
              onClick={() => handleSave("submitted")}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
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

