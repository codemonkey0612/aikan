import { useMemo, useState } from "react";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import type { Shift, Facility } from "../api/types";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

export function ShiftSchedulePage() {
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [filterAikan, setFilterAikan] = useState(true);
  const [filterJointVisit, setFilterJointVisit] = useState(true);
  const [filterFirstVisit, setFilterFirstVisit] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });

  const { data: users } = useUsers();
  const { data: facilities } = useFacilities();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  
  const { data: shiftsData, isLoading } = useShifts({
    date_from: monthStart.toISOString().slice(0, 10),
    date_to: monthEnd.toISOString().slice(0, 10),
    nurse_id: selectedNurseId || undefined,
  });

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

    // 前月の最後の日を追加
    const prevMonthLastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      0
    ).getDate();
    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() - 1,
          prevMonthLastDay - i
        )
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      );
    }

    // 次の月の最初の日を追加（42セルになるまで）
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      days.push(
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth() + 1,
          day
        )
      );
    }

    return days;
  }, [currentMonth]);

  const shiftsByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    if (!shiftsData?.data) return map;
    
    shiftsData.data.forEach((shift) => {
      if (!shift.start_datetime) return;
      const date = new Date(shift.start_datetime);
      const key = formatKey(date);
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    });
    return map;
  }, [shiftsData]);

  const filteredShiftsByDate = useMemo(() => {
    const filtered = new Map<string, Shift[]>();
    
    shiftsByDate.forEach((shifts, dateKey) => {
      const filteredShifts = shifts.filter((shift) => {
        // 施設情報を取得
        const facility = facilities?.find((f) => f.facility_id === shift.facility_id);
        if (!facility) return false;

        // 検索クエリでフィルター
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const facilityName = (facility.name || "").toLowerCase();
          if (!facilityName.includes(query)) return false;
        }

        // フィルター条件
        if (filterAikan) {
          // 訪問前連絡「あいかん」の施設フィルター
          // pre_visit_contact_idが"aikan"または関連する値の場合
          if (facility.pre_visit_contact_id && 
              facility.pre_visit_contact_id.toLowerCase().includes("aikan")) {
            // フィルターに一致
          } else {
            return false;
          }
        }
        
        // 同行訪問フィルター（実装が必要 - facilityに同行訪問フラグがある場合）
        // 今月が初回訪問の施設フィルター（実装が必要）

        return true;
      });

      if (filteredShifts.length > 0) {
        filtered.set(dateKey, filteredShifts);
      }
    });

    return filtered;
  }, [shiftsByDate, facilities, searchQuery, filterAikan, filterJointVisit, filterFirstVisit]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  const nurses = useMemo(() => {
    return users?.filter((u) => u.role === "nurse") || [];
  }, [users]);

  return (
    <div className="space-y-6">
      {/* ピンクのヘッダー */}
      <div className="rounded-lg bg-pink-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">看護師</h1>
          <select
            value={selectedNurseId}
            onChange={(e) => setSelectedNurseId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="">―</option>
            {nurses.map((nurse) => (
              <option key={nurse.id} value={nurse.nurse_id || ""}>
                {nurse.last_name} {nurse.first_name}
              </option>
            ))}
          </select>
        </div>

        {/* フィルター */}
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-white p-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                訪問前連絡「あいかん」の施設
              </h3>
              <p className="text-sm text-slate-500">
                訪問前連絡に「あいかん」が指定されている施設のみ表示
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={filterAikan}
                onChange={(e) => setFilterAikan(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4">
            <div>
              <h3 className="font-semibold text-slate-900">同行訪問する施設</h3>
              <p className="text-sm text-slate-500">
                同行訪問に設定されている施設のみ表示
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={filterJointVisit}
                onChange={(e) => setFilterJointVisit(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-white p-4">
            <div>
              <h3 className="font-semibold text-slate-900">
                今月 ({currentMonth.getMonth() + 1}月) が初回訪問の施設
              </h3>
              <p className="text-sm text-slate-500">
                担当看護師が今月初めて訪問する施設のみ表示
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={filterFirstVisit}
                onChange={(e) => setFilterFirstVisit(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300"></div>
            </label>
          </div>
        </div>
      </div>

      {/* カレンダー */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">
            {monthLabel}
          </h2>
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
            <select className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option>Month</option>
            </select>
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-md border border-slate-300 bg-white p-2 hover:bg-slate-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-2">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-semibold text-slate-600"
            >
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => {
            if (!day) return null;
            const key = formatKey(day);
            const dayShifts = filteredShiftsByDate.get(key) || [];
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
            const isToday = formatKey(day) === formatKey(new Date());

            return (
              <div
                key={key}
                className={`min-h-[120px] rounded-lg border p-2 ${
                  isCurrentMonth
                    ? isToday
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200 bg-white"
                    : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="mb-1 text-xs font-semibold text-slate-600">
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayShifts.slice(0, 4).map((shift) => {
                    const facility = facilities?.find(
                      (f) => f.facility_id === shift.facility_id
                    );
                    return (
                      <Link
                        key={shift.id}
                        to={`/shifts/daily/${formatKey(day)}`}
                        className="block rounded bg-pink-100 px-1.5 py-0.5 text-xs text-slate-700 hover:bg-pink-200"
                      >
                        {facility?.name || shift.facility_name || "施設名なし"}
                      </Link>
                    );
                  })}
                  {dayShifts.length > 4 && (
                    <div className="text-xs text-slate-500">
                      +{dayShifts.length - 4} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

