import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNurseAvailabilityByNurseAndMonth } from "../hooks/useNurseAvailability";
import { useUsers } from "../hooks/useUsers";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function NurseAvailabilityDetailPage() {
  const { nurseId, yearMonth } = useParams<{
    nurseId: string;
    yearMonth: string;
  }>();
  const navigate = useNavigate();

  // Parse yearMonth or use current month
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (yearMonth) {
      const [year, month] = yearMonth.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    const now = new Date();
    now.setDate(1);
    now.setMonth(now.getMonth() + 1);
    return now;
  });

  const displayYearMonth = formatYearMonth(currentMonth);
  const actualNurseId = nurseId || "";
  const actualYearMonth = yearMonth || displayYearMonth;

  const { data: availability, isLoading } = useNurseAvailabilityByNurseAndMonth(
    actualNurseId,
    actualYearMonth
  );
  const { data: users } = useUsers();

  // Get nurse info
  const nurse = useMemo(() => {
    return users?.find((u) => u.nurse_id === actualNurseId);
  }, [users, actualNurseId]);

  const nurseName = nurse
    ? `${nurse.last_name} ${nurse.first_name}`
    : actualNurseId;

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
    const next = new Date(currentMonth);
    next.setMonth(currentMonth.getMonth() + delta);
    setCurrentMonth(next);
    // Update URL
    const newYearMonth = formatYearMonth(next);
    navigate(`/view-nurse-availability/${actualNurseId}/${newYearMonth}`);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!availability?.availability_data) {
      return { totalDays: 0, availableDays: 0, unavailableDays: 0 };
    }

    const data = availability.availability_data;
    const totalDays = Object.keys(data).length;
    const availableDays = Object.values(data).filter((d) => d.available).length;
    const unavailableDays = totalDays - availableDays;

    return { totalDays, availableDays, unavailableDays };
  }, [availability]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (!availability) {
    return (
      <div className="space-y-6">
        <header>
          <button
            onClick={() => navigate("/view-nurse-availability")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            一覧に戻る
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">
            {nurseName} - 希望シフト詳細
          </h1>
        </header>
        <Card>
          <p className="text-slate-500">
            {actualYearMonth}の希望シフトデータがありません。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <button
          onClick={() => navigate("/view-nurse-availability")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          一覧に戻る
        </button>
        <div className="flex items-center gap-3">
          <UserIcon className="h-8 w-8 text-brand-600" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {nurseName}
            </h1>
            <p className="text-sm text-slate-500">
              看護師ID: {actualNurseId} | {monthLabel}
            </p>
          </div>
        </div>
      </header>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">ステータス</p>
            <p className="text-lg font-semibold text-slate-900 mt-1">
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
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">登録日数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.totalDays} 日
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">利用可能日数</p>
            <p className="text-2xl font-semibold text-green-600">
              {stats.availableDays} 日
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">利用不可日数</p>
            <p className="text-2xl font-semibold text-slate-400">
              {stats.unavailableDays} 日
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar View */}
      <Card title={`${monthLabel} - 希望シフト`}>
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
              const dayData = availability.availability_data[key] || {
                available: false,
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
                      : dayData.available
                      ? "border-green-200 bg-green-50"
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
                      {dayData.time_slots && dayData.time_slots.length > 0 ? (
                        <div className="space-y-1">
                          {dayData.time_slots.map((slot, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs"
                            >
                              <ClockIcon className="h-3 w-3 text-green-600" />
                              <span className="text-green-700 font-medium">
                                {slot}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-green-600">利用可能</p>
                      )}
                      {dayData.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {dayData.notes}
                        </p>
                      )}
                    </div>
                  )}
                  {!dayData.available && (
                    <p className="text-xs text-slate-400 mt-2">利用不可</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Additional Information */}
      <Card title="詳細情報">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-700">提出日時</p>
            <p className="text-sm text-slate-600 mt-1">
              {availability.submitted_at
                ? new Date(availability.submitted_at).toLocaleString("ja-JP")
                : "未提出"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">作成日時</p>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(availability.created_at).toLocaleString("ja-JP")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">更新日時</p>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(availability.updated_at).toLocaleString("ja-JP")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

