import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFacilityShiftRequests } from "../hooks/useFacilityShiftRequests";
import { useFacilities } from "../hooks/useFacilities";
import { Card } from "../components/ui/Card";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import {
  BuildingOffice2Icon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import type { FacilityShiftRequest } from "../api/types";

const formatKey = (date: Date) => date.toISOString().slice(0, 10);
const formatYearMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export function ViewFacilityShiftRequestsPage() {
  const navigate = useNavigate();
  const { data: facilities } = useFacilities();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    // Default to next month
    now.setMonth(now.getMonth() + 1);
    return now;
  });

  const yearMonth = formatYearMonth(currentMonth);

  // Fetch all requests for the selected month, optionally filtered by facility
  const { data: requests, isLoading } = useFacilityShiftRequests({
    year_month: yearMonth,
    facility_id: selectedFacilityId || undefined,
  });

  // Group requests by facility
  const requestsByFacility = useMemo(() => {
    const map = new Map<string, FacilityShiftRequest>();
    requests?.forEach((req) => {
      map.set(req.facility_id, req);
    });
    return map;
  }, [requests]);

  // Calendar setup
  const monthLabel = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  // Get facility name - normalize IDs to handle string/number and whitespace
  const getFacilityName = (facilityId: string) => {
    if (!facilities || !facilityId) return facilityId;
    const normalizedId = String(facilityId).trim();
    const facility = facilities.find((f) => {
      if (!f.facility_id) return false;
      return String(f.facility_id).trim() === normalizedId;
    });
    return facility?.name || facilityId;
  };

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
        <p className="text-sm uppercase tracking-wide text-slate-500">
          シフト管理
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          施設のシフト依頼確認
        </h1>
        <p className="text-sm text-slate-500">
          {monthLabel}の施設のシフト依頼を確認できます
        </p>
      </header>

      {/* Filter */}
      <Card>
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
            <option value="">すべての施設</option>
            {facilities?.map((facility) => (
              <option key={facility.facility_id} value={facility.facility_id}>
                {facility.name} ({facility.facility_id})
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">登録施設数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {facilities?.length || 0} 施設
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">シフト依頼提出施設数</p>
            <p className="text-2xl font-semibold text-slate-900">
              {requests?.length || 0} 施設
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <p className="text-sm text-slate-500">提出済み</p>
            <p className="text-2xl font-semibold text-slate-900">
              {requests?.filter((r) => r.status === "submitted").length || 0} 施設
            </p>
          </div>
        </Card>
      </div>

      {/* Calendar View for Selected Facility */}
      {selectedFacilityId && requestsByFacility.has(selectedFacilityId) && (
        <Card
          title={`${getFacilityName(selectedFacilityId)} - ${monthLabel}`}
          actions={
            <button
              onClick={() =>
                navigate(
                  `/view-facility-shift-requests/${selectedFacilityId}/${yearMonth}`
                )
              }
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              詳細を見る →
            </button>
          }
        >
          <ModernCalendar
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            renderDayContent={(day) => {
              const key = formatKey(day.date);
              const request = requestsByFacility.get(selectedFacilityId);
              const dayData = request?.request_data[key] || {
                time_slots: [],
              };

              if (!dayData.time_slots || dayData.time_slots.length === 0) return null;

              return (
                <div className="space-y-1">
                  {dayData.time_slots.map((slot, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs"
                    >
                      <ClockIcon className="h-3 w-3 text-blue-600" />
                      <span className="text-blue-700">{slot}</span>
                    </div>
                  ))}
                  {dayData.notes && (
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {dayData.notes}
                    </p>
                  )}
                  {dayData.required_nurses && (
                    <p className="text-xs text-slate-400">
                      必要看護師数: {dayData.required_nurses}
                    </p>
                  )}
                </div>
              );
            }}
          />
          {requestsByFacility.get(selectedFacilityId) && (
            <div className="pt-4 border-t border-slate-200 mt-4">
              <p className="text-sm text-slate-500">
                ステータス:{" "}
                <span className="font-medium">
                  {requestsByFacility.get(selectedFacilityId)?.status === "draft"
                    ? "下書き"
                    : requestsByFacility.get(selectedFacilityId)?.status === "submitted"
                    ? "提出済み"
                    : "スケジュール済み"}
                </span>
                {requestsByFacility.get(selectedFacilityId)?.submitted_at && (
                  <span className="ml-4 text-xs text-slate-400">
                    提出日時:{" "}
                    {new Date(requestsByFacility.get(selectedFacilityId)!.submitted_at!).toLocaleString("ja-JP")}
                  </span>
                )}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* List View - All Facilities */}
      <Card title="施設一覧">
        {requests && requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    施設
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    施設ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    提出日時
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500">
                    依頼日数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {requests.map((request) => {
                  const facilityName = getFacilityName(request.facility_id);
                  const requestDays = Object.keys(request.request_data).filter(
                    (date) =>
                      request.request_data[date]?.time_slots &&
                      request.request_data[date].time_slots.length > 0
                  ).length;

                  return (
                    <tr
                      key={request.id}
                      className="hover:bg-slate-50 cursor-pointer"
                      onClick={() =>
                        navigate(
                          `/view-facility-shift-requests/${request.facility_id}/${yearMonth}`
                        )
                      }
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {facilityName}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {request.facility_id}
                      </td>
                      <td className="px-4 py-3 text-sm">
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
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {request.submitted_at
                          ? new Date(request.submitted_at).toLocaleString(
                              "ja-JP"
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {requestDays} 日
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">
            <p>シフト依頼の提出がありません。</p>
          </div>
        )}
      </Card>
    </div>
  );
}

