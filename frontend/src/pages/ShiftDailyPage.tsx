import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useFacilities } from "../hooks/useFacilities";
import { useUsers } from "../hooks/useUsers";
import { FacilityImage } from "../components/shifts/FacilityImage";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Shift, User } from "../api/types";

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

export function ShiftDailyPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const selectedDate = date ? new Date(date) : new Date();
  const dateKey = formatKey(selectedDate);

  const { data: shiftsData, isLoading } = useShifts({
    date_from: dateKey,
    date_to: dateKey,
  });

  const { data: facilities } = useFacilities();
  const { data: users } = useUsers();

  const dateLabel = selectedDate.toLocaleDateString("ja-JP", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shiftsByNurse = useMemo(() => {
    const map = new Map<string, { nurse: User; shifts: Shift[] }>();
    if (!shiftsData?.data || !users) return map;

    shiftsData.data.forEach((shift) => {
      if (!shift.nurse_id) return;
      const nurse = users.find((u) => u.nurse_id === shift.nurse_id);
      if (!nurse) return;

      const existing = map.get(shift.nurse_id);
      if (existing) {
        existing.shifts.push(shift);
      } else {
        map.set(shift.nurse_id, { nurse, shifts: [shift] });
      }
    });

    // シフトを時間順にソート
    map.forEach((entry) => {
      entry.shifts.sort((a, b) => {
        const timeA = a.start_datetime ? new Date(a.start_datetime).getTime() : 0;
        const timeB = b.start_datetime ? new Date(b.start_datetime).getTime() : 0;
        return timeA - timeB;
      });
    });

    return map;
  }, [shiftsData, users]);

  const filteredShiftsByNurse = useMemo(() => {
    const filtered = new Map<string, { nurse: User; shifts: Shift[] }>();

    shiftsByNurse.forEach((entry, nurseId) => {
      const filteredShifts = entry.shifts.filter((shift) => {
        if (!searchQuery) return true;
        const facility = facilities?.find((f) => f.facility_id === shift.facility_id);
        const query = searchQuery.toLowerCase();
        return (
          facility?.name?.toLowerCase().includes(query) ||
          shift.facility_name?.toLowerCase().includes(query)
        );
      });

      if (filteredShifts.length > 0) {
        filtered.set(nurseId, { ...entry, shifts: filteredShifts });
      }
    });

    return filtered;
  }, [shiftsByNurse, facilities, searchQuery]);

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const getTimeRange = (shift: Shift) => {
    if (!shift.start_datetime) return "";
    const start = formatTime(shift.start_datetime);
    const end = shift.required_time
      ? new Date(
          new Date(shift.start_datetime).getTime() + shift.required_time * 60000
        )
      : null;
    const endStr = end ? formatTime(end.toISOString()) : "";
    return endStr ? `${start}~${endStr}` : start;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link to="/shifts/schedule" className="hover:text-brand-600">
            医療連携シフト
          </Link>
          <span>/</span>
          <span>日別シフト</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-64 rounded-md border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FunnelIcon className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 rounded-md bg-pink-500 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-600">
            <UserGroupIcon className="h-4 w-4" />
            同行訪問
          </button>
        </div>
      </div>

      {/* 日付表示 */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">{dateLabel}</h1>
      </div>

      {/* シフトリスト */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">シフトを読み込み中...</p>
        </div>
      ) : filteredShiftsByNurse.size === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">
            この日のシフトが見つかりませんでした。
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(filteredShiftsByNurse.values()).map((entry) => {
            const { nurse, shifts } = entry;

            return (
              <div key={nurse.id} className="space-y-3">
                <h2 className="text-lg font-semibold text-slate-900">
                  {nurse.last_name} {nurse.first_name}
                </h2>
                <div className="space-y-2">
                  {shifts.map((shift) => {
                    const facility = facilities?.find(
                      (f) => f.facility_id === shift.facility_id
                    );
                    const facilityName = facility?.name || shift.facility_name || "施設名なし";
                    const facilityNameKana = facility?.name_kana || "";

                    return (
                      <Link
                        key={shift.id}
                        to={`/shifts/${shift.id}`}
                        className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md"
                      >
                        {shift.facility_id ? (
                          <FacilityImage
                            facilityId={shift.facility_id}
                            alt={facilityName}
                            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 flex-shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                            NO IMAGE
                            <br />
                            AVAILABLE
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {facilityName}
                          </h3>
                          {facilityNameKana && (
                            <p className="text-sm text-slate-500">
                              ({facilityNameKana})
                            </p>
                          )}
                        </div>
                        <div className="text-sm font-medium text-slate-600">
                          {getTimeRange(shift)}
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

