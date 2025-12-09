import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNurseAvailabilityByNurseAndMonth } from "../hooks/useNurseAvailability";
import { useUsers } from "../hooks/useUsers";
import { Card } from "../components/ui/Card";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import type { User } from "../api/types";

// Format date as YYYY-MM-DD in local timezone (not UTC)
const formatKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
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

  // Parse yearMonth from URL or use next month as default
  const getMonthFromYearMonth = (ym: string | undefined) => {
    if (ym) {
      const [year, month] = ym.split("-");
      return new Date(parseInt(year), parseInt(month) - 1, 1);
    }
    const now = new Date();
    now.setDate(1);
    now.setMonth(now.getMonth() + 1);
    return now;
  };

  const [currentMonth, setCurrentMonth] = useState(() =>
    getMonthFromYearMonth(yearMonth)
  );

  // Sync currentMonth with URL params when they change
  useEffect(() => {
    if (yearMonth) {
      const newMonth = getMonthFromYearMonth(yearMonth);
      setCurrentMonth(newMonth);
    }
  }, [yearMonth]);

  const actualNurseId = nurseId || "";
  const actualYearMonth = yearMonth || formatYearMonth(currentMonth);

  const { data: availability, isLoading, error } = useNurseAvailabilityByNurseAndMonth(
    actualNurseId,
    actualYearMonth
  );
  const { data: users } = useUsers();

  // Debug: Log the availability data
  useEffect(() => {
    console.log("=== Nurse Availability Debug ===");
    console.log("Fetching for:", { actualNurseId, actualYearMonth });
    console.log("Is loading:", isLoading);
    console.log("Error:", error);
    console.log("Availability:", availability);
    if (availability) {
      console.log("Availability data:", availability.availability_data);
      console.log("Availability data type:", typeof availability.availability_data);
      if (availability.availability_data) {
        const keys = Object.keys(availability.availability_data);
        console.log("Availability data keys:", keys);
        console.log("Total keys:", keys.length);
        console.log("Sample entries:", Object.entries(availability.availability_data).slice(0, 5));
        // Check for January 2026 dates specifically
        const jan2026Keys = keys.filter(k => k.startsWith('2026-01-'));
        console.log("January 2026 dates found:", jan2026Keys);
      }
    }
    console.log("================================");
  }, [availability, isLoading, error, actualNurseId, actualYearMonth]);

  // Get nurse info - normalize IDs by trimming to handle carriage returns
  const nurse = useMemo(() => {
    if (!users || !actualNurseId) return undefined;
    const userList: User[] = Array.isArray(users) ? users : users?.data || [];
    const normalizedNurseId = actualNurseId.trim();
    return userList.find((u: User) => {
      const nurseId = u.nurse_id;
      if (!nurseId || typeof nurseId !== "string") return false;
      return nurseId.trim() === normalizedNurseId;
    });
  }, [users, actualNurseId]);

  const nurseName = nurse
    ? `${nurse.last_name} ${nurse.first_name}`
    : actualNurseId;

  // Calendar setup
  const monthLabel = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    // Update URL
    const newYearMonth = formatYearMonth(newMonth);
    navigate(`/view-nurse-availability/${actualNurseId}/${newYearMonth}`);
  };

  // Use empty availability_data if no availability record exists
  // Ensure it's properly parsed and is an object
  const availabilityData = useMemo(() => {
    console.log("Processing availabilityData, availability:", availability);
    
    if (!availability) {
      console.log("No availability record");
      return {};
    }
    
    if (!availability.availability_data) {
      console.log("No availability_data in record");
      return {};
    }
    
    const data = availability.availability_data;
    console.log("Raw data:", data, "Type:", typeof data);
    
    // Handle case where data might be a string (shouldn't happen, but just in case)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        console.log("Parsed from string:", parsed);
        return parsed;
      } catch (e) {
        console.error("Failed to parse:", e);
        return {};
      }
    }
    
    // Ensure it's an object
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      console.log("Using data as object, keys:", Object.keys(data));
      console.log("Sample values:", Object.entries(data).slice(0, 3));
      return data;
    }
    
    console.log("Data is not a valid object");
    return {};
  }, [availability]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!availabilityData || Object.keys(availabilityData).length === 0) {
      return { totalDays: 0, availableDays: 0, unavailableDays: 0 };
    }

    const data = availabilityData as Record<string, { available: boolean }>;
    const totalDays = Object.keys(data).length;
    const availableDays = Object.values(data).filter((d) => (d as any).available).length;
    const unavailableDays = totalDays - availableDays;

    return { totalDays, availableDays, unavailableDays };
  }, [availabilityData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
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
              {monthLabel}
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
                  availability?.status === "submitted"
                    ? "bg-green-100 text-green-700"
                    : availability?.status === "approved"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {!availability
                  ? "データなし"
                  : availability.status === "draft"
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
        <ModernCalendar
          currentMonth={currentMonth}
          onMonthChange={handleMonthChange}
          renderDayContent={(day) => {
            const key = formatKey(day.date);
            let dayData = availabilityData[key];
            
            // If not found, try to find similar key (in case of timezone issues)
            if (!dayData && Object.keys(availabilityData).length > 0) {
              const allKeys = Object.keys(availabilityData);
              const similarKey = allKeys.find(k => {
                const datePart = k.split('T')[0].split(' ')[0];
                return datePart === key;
              });
              if (similarKey) {
                dayData = availabilityData[similarKey];
              }
            }
            
            dayData = dayData || { available: false };

            if (!dayData.available) {
              return <p className="text-xs text-slate-400">利用不可</p>;
            }

            return (
              <div className="space-y-1">
                {dayData.time_slots && dayData.time_slots.length > 0 ? (
                  <div className="space-y-1">
                    {dayData.time_slots.map((slot: string, idx: number) => (
                      <div
                        key={`${key}-slot-${idx}-${slot}`}
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
            );
          }}
        />
      </Card>

      {/* Additional Information */}
      {availability && (
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
      )}
      {!availability && (
        <Card>
          <p className="text-slate-500 text-center py-4">
            {actualYearMonth}の希望シフトデータがありません。
          </p>
        </Card>
      )}
    </div>
  );
}

