import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFacilityShiftRequestByFacilityAndMonth } from "../hooks/useFacilityShiftRequests";
import { useFacilities } from "../hooks/useFacilities";
import { Card } from "../components/ui/Card";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  ClockIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function FacilityShiftRequestDetailPage() {
  const { facilityId, yearMonth } = useParams<{
    facilityId: string;
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
  const actualFacilityId = facilityId || "";
  const actualYearMonth = yearMonth || displayYearMonth;

  const { data: request, isLoading } =
    useFacilityShiftRequestByFacilityAndMonth(actualFacilityId, actualYearMonth);
  const { data: facilities } = useFacilities();

  // Get facility info
  const facility = useMemo(() => {
    return facilities?.find((f) => f.facility_id === actualFacilityId);
  }, [facilities, actualFacilityId]);

  const facilityName = facility?.name || actualFacilityId;

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
    navigate(`/view-facility-shift-requests/${actualFacilityId}/${newYearMonth}`);
  };

  // Calculate statistics
  const stats = useMemo(() => {
    if (!request?.request_data) {
      return { totalDays: 0, requestDays: 0, totalTimeSlots: 0 };
    }

    const data = request.request_data;
    const totalDays = Object.keys(data).length;
    const requestDays = Object.values(data).filter(
      (d) => d.time_slots && d.time_slots.length > 0
    ).length;
    const totalTimeSlots = Object.values(data).reduce(
      (sum, d) => sum + (d.time_slots?.length || 0),
      0
    );

    return { totalDays, requestDays, totalTimeSlots };
  }, [request]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="space-y-6">
        <header>
          <button
            onClick={() => navigate("/view-facility-shift-requests")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            一覧に戻る
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">
            {facilityName} - シフト依頼詳細
          </h1>
        </header>
        <Card>
          <p className="text-slate-500">
            {actualYearMonth}のシフト依頼データがありません。
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <button
          onClick={() => navigate("/view-facility-shift-requests")}
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          一覧に戻る
        </button>
        <div className="flex items-center gap-3">
          <BuildingOffice2Icon className="h-8 w-8 text-brand-600" />
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {facilityName}
            </h1>
            <p className="text-sm text-slate-500">
              施設ID: {actualFacilityId} | {monthLabel}
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
                  request.status === "submitted"
                    ? "bg-green-100 text-green-700"
                    : request.status === "scheduled"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {request.status === "draft"
                  ? "下書き"
                  : request.status === "submitted"
                  ? "提出済み"
                  : "スケジュール済み"}
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
            <p className="text-sm text-slate-500">依頼日数</p>
            <p className="text-2xl font-semibold text-blue-600">
              {stats.requestDays} 日
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">時間帯数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats.totalTimeSlots} 件
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar View */}
      <Card title={`${monthLabel} - シフト依頼`}>
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
              const dayData = request.request_data[key] || {
                time_slots: [],
              };
              const isToday = formatKey(day) === formatKey(new Date());
              const dayOfWeek = day.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const hasRequests =
                dayData.time_slots && dayData.time_slots.length > 0;

              return (
                <div
                  key={key}
                  className={`flex flex-col rounded-2xl border p-3 text-sm ${
                    isToday
                      ? "border-brand-300 bg-brand-50"
                      : isWeekend
                      ? "border-slate-200 bg-slate-50"
                      : hasRequests
                      ? "border-blue-200 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{day.getDate()}</span>
                    {hasRequests && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                        {dayData.time_slots.length}
                      </span>
                    )}
                  </div>
                  {hasRequests && (
                    <div className="mt-2 space-y-1">
                      <div className="space-y-1">
                        {dayData.time_slots.map((slot, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs"
                          >
                            <ClockIcon className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-700 font-medium">
                              {slot}
                            </span>
                          </div>
                        ))}
                      </div>
                      {dayData.required_nurses && (
                        <div className="flex items-center gap-1 mt-1">
                          <UserGroupIcon className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-600">
                            必要: {dayData.required_nurses}名
                          </span>
                        </div>
                      )}
                      {dayData.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {dayData.notes}
                        </p>
                      )}
                    </div>
                  )}
                  {!hasRequests && (
                    <p className="text-xs text-slate-400 mt-2">依頼なし</p>
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
              {request.submitted_at
                ? new Date(request.submitted_at).toLocaleString("ja-JP")
                : "未提出"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">作成日時</p>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(request.created_at).toLocaleString("ja-JP")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">更新日時</p>
            <p className="text-sm text-slate-600 mt-1">
              {new Date(request.updated_at).toLocaleString("ja-JP")}
            </p>
          </div>
          {facility && (
            <>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm font-medium text-slate-700">施設情報</p>
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {facility.address_prefecture && facility.address_city && (
                    <p>
                      {facility.address_prefecture} {facility.address_city}
                    </p>
                  )}
                  {facility.phone_number && (
                    <p>電話: {facility.phone_number}</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

