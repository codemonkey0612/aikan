import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import { FacilityImage } from "../components/shifts/FacilityImage";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { Shift } from "../api/types";

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Shift Route Page
 * Displays a list of visit locations (routes) for a specific nurse on a given day.
 * Shows facility images, names, phonetic readings, and time slots in a mobile-friendly layout.
 */
export function ShiftRoutePage() {
  const { date, nurseId } = useParams<{ date: string; nurseId: string }>();
  const navigate = useNavigate();

  const selectedDate = date ? new Date(date) : new Date();
  const dateKey = formatKey(selectedDate);

  const { data: shiftsData, isLoading } = useShifts({
    date_from: dateKey,
    date_to: dateKey,
    nurse_id: nurseId || undefined,
  });

  const { data: facilities } = useFacilities();
  const { data: users } = useUsers();
  const userList = useMemo(() => Array.isArray(users) ? users : users?.data || [], [users]);

  // Find the nurse
  const nurse = useMemo(() => {
    if (!nurseId) return null;
    return userList.find((u) => u.nurse_id === nurseId);
  }, [userList, nurseId]);

  // Format date label
  const dateLabel = selectedDate.toLocaleDateString("ja-JP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Get and sort shifts for this nurse on this date
  const shifts = useMemo(() => {
    if (!shiftsData?.data || !nurseId) return [];
    
    const nurseShifts = shiftsData.data.filter((shift) => shift.nurse_id === nurseId);
    
    // Sort by start time
    return nurseShifts.sort((a, b) => {
      const timeA = a.start_datetime ? new Date(a.start_datetime).getTime() : 0;
      const timeB = b.start_datetime ? new Date(b.start_datetime).getTime() : 0;
      return timeA - timeB;
    });
  }, [shiftsData, nurseId]);

  // Format time range
  const formatTimeRange = (shift: Shift) => {
    if (!shift.start_datetime) return "";
    const start = new Date(shift.start_datetime).toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    
    if (shift.end_datetime) {
      const end = new Date(shift.end_datetime).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${start}~${end}`;
    }
    
    if (shift.required_time) {
      const end = new Date(
        new Date(shift.start_datetime).getTime() + shift.required_time * 60000
      ).toLocaleTimeString("ja-JP", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return `${start}~${end}`;
    }
    
    return start;
  };

  // Check if shift requires Aikan contact (あいかん連絡)
  const requiresAikanContact = (shift: Shift): boolean => {
    if (!shift.facility_id || !facilities) return false;
    const facility = facilities.find((f) => f.facility_id === shift.facility_id);
    // Check if pre_visit_contact_id indicates Aikan contact
    // This might need adjustment based on actual data values
    return facility?.pre_visit_contact_id === "aikan" || 
           facility?.pre_visit_contact_id?.toLowerCase().includes("aikan") ||
           facility?.pre_visit_contact_id === "1"; // Assuming 1 might indicate Aikan
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with breadcrumb */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <Link
          to="/shifts"
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-brand-600 transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>医療連携シフト</span>
          <span className="text-slate-400 mx-1">/</span>
          <span>日別シフト</span>
        </Link>
      </div>

      {/* Date and Nurse Name */}
      <div className="border-b border-slate-200 bg-white px-4 py-5">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          {dateLabel}
        </h1>
        {nurse && (
          <p className="text-lg font-semibold text-slate-800">
            {nurse.last_name} {nurse.first_name}
          </p>
        )}
      </div>

      {/* Shift List */}
      <div className="px-4 py-4 bg-slate-50 min-h-[calc(100vh-180px)]">
        {shifts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-slate-500">
              この日のシフトが見つかりませんでした。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {shifts.map((shift) => {
              const facility = facilities?.find(
                (f) => f.facility_id === shift.facility_id
              );
              const facilityName = facility?.name || shift.facility_name || "施設名なし";
              const facilityNameKana = facility?.name_kana || "";
              const hasAikanContact = requiresAikanContact(shift);

              return (
                <div
                  key={shift.id}
                  className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
                  onClick={() => navigate(`/shifts/${shift.id}`)}
                >
                  {/* Facility Image - Square thumbnail */}
                  <div className="flex-shrink-0">
                    {shift.facility_id ? (
                      <FacilityImage
                        facilityId={shift.facility_id}
                        alt={facilityName}
                        className="h-24 w-24 rounded-lg object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-[10px] text-slate-400 leading-tight p-2">
                        <span>NO IMAGE</span>
                        <span>AVAILABLE</span>
                      </div>
                    )}
                  </div>

                  {/* Facility Info */}
                  <div className="flex-1 min-w-0">
                    {hasAikanContact && (
                      <p className="text-sm font-semibold text-pink-600 mb-2">
                        あいかん連絡
                      </p>
                    )}
                    <h3 className="font-semibold text-slate-900 text-base mb-1 leading-tight">
                      {facilityName}
                    </h3>
                    {facilityNameKana && (
                      <p className="text-sm text-slate-500 mb-3 leading-tight">
                        ({facilityNameKana})
                      </p>
                    )}
                    <p className="text-sm font-semibold text-slate-700">
                      {formatTimeRange(shift)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

