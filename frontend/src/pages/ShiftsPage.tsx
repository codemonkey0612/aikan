import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import type { Shift } from "../api/types";
import { Card } from "../components/ui/Card";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import type { CalendarEvent } from "../components/calendar/ModernCalendar";
import { formatDateKey, extractDateFromDatetime } from "../utils/dateFormat";
import {
  UserGroupIcon,
  FunnelIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export function ShiftsPage() {
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const userList = useMemo(() => Array.isArray(users) ? users : users?.data || [], [users]);
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const [selectedNurseId, setSelectedNurseId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });

  // 月の開始日と終了日を計算
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data, isLoading } = useShifts({
    date_from: formatDateKey(monthStart),
    date_to: formatDateKey(monthEnd),
    nurse_id: selectedNurseId || undefined,
  });

  // 看護師IDから看護師名へのマッピング
  const nurseMap = useMemo(() => {
    const map = new Map<string, string>();
    userList.forEach((u) => {
      if (u.nurse_id) {
        map.set(u.nurse_id, `${u.last_name} ${u.first_name}`);
      }
    });
    return map;
  }, [userList]);

  // 施設IDを正規化するヘルパー関数（数値と文字列の両方に対応）
  const normalizeId = (id: string | number | null | undefined): string => {
    if (id === null || id === undefined) return '';
    // 数値も文字列も扱えるように変換
    return String(id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
  };

  // 施設IDから施設名へのマッピング（正規化してマッチング、数値と文字列の両方に対応）
  const facilityMap = useMemo(() => {
    const map = new Map<string, string>();
    if (!facilities) return map;
    
    facilities.forEach((f) => {
      if (f.facility_id && f.name) {
        // 数値も文字列も扱えるように正規化
        const normalizedId = normalizeId(f.facility_id);
        const originalId = String(f.facility_id);
        
        // 正規化されたIDでマップに追加
        map.set(normalizedId, f.name);
        
        // 元のID（正規化前）も保持
        map.set(originalId, f.name);
        
        // 数値としても保存（2366 のような数値IDに対応）
        const numericValue = Number(f.facility_id);
        if (!isNaN(numericValue)) {
          const numericId = String(numericValue);
          map.set(numericId, f.name);
          // 数値の正規化版も追加
          map.set(normalizeId(numericId), f.name);
        }
        
        // 大文字小文字を区別しないバージョンも追加
        map.set(normalizedId.toLowerCase(), f.name);
        map.set(originalId.toLowerCase(), f.name);
      }
    });
    return map;
  }, [facilities]);

  // 施設名を取得するヘルパー関数（ShiftPlanningPageと同じロジックを使用）
  const getFacilityNameById = (facilityId: string | number | null | undefined): string => {
    if (!facilityId) return "未設定";
    
    const idStr = String(facilityId);
    const normalizedId = normalizeId(facilityId);
    
    // 正規化されたIDで検索
    let name = facilityMap.get(normalizedId);
    if (name) return name;
    
    // 元のIDで検索
    name = facilityMap.get(idStr);
    if (name) return name;
    
    // 数値として検索
    const numericValue = Number(facilityId);
    if (!isNaN(numericValue)) {
      const numericId = String(numericValue);
      name = facilityMap.get(numericId);
      if (name) return name;
    }
    
    // 施設リストから直接検索（フォールバック）
    if (facilities && facilities.length > 0) {
      const facility = facilities.find((f) => {
        if (!f.facility_id || !f.name) return false;
        const fId = String(f.facility_id);
        const fNormalized = normalizeId(f.facility_id);
        const fNumeric = Number(f.facility_id);
        const shiftNumeric = numericValue;
        
        return fNormalized === normalizedId || 
               fId === idStr ||
               (!isNaN(fNumeric) && !isNaN(shiftNumeric) && fNumeric === shiftNumeric);
      });
      if (facility?.name) {
        return facility.name;
      }
    }
    
    // フォールバック: IDを表示
    return idStr;
  };

  // 看護師リスト
  const nurses = useMemo(() => {
    return userList.filter((u) => u.role === "nurse");
  }, [userList]);

  // 日付ごとにシフトをグループ化してイベントに変換
  const calendarEvents = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    if (!data?.data) return eventsMap;

    data.data.forEach((shift) => {
      if (!shift.start_datetime) return;
      
      // 看護師でフィルタリング（選択されている場合）
      if (selectedNurseId && shift.nurse_id !== selectedNurseId) {
        return;
      }
      
      // 検索クエリでフィルタリング
      if (searchQuery) {
        const facilityName = shift.facility_name && shift.facility_name.trim()
          ? shift.facility_name.trim()
          : getFacilityNameById(shift.facility_id);
        const query = searchQuery.toLowerCase();
        if (!facilityName.toLowerCase().includes(query)) {
          return;
        }
      }

      // Extract date from start_datetime string directly to avoid timezone issues
      // Use utility function to handle various datetime formats safely
      const extractedDate = extractDateFromDatetime(shift.start_datetime);
      const key = extractedDate || formatDateKey(new Date());
      
      const facilityName = shift.facility_name && shift.facility_name.trim()
        ? shift.facility_name.trim()
        : getFacilityNameById(shift.facility_id);
      const nurseName = shift.nurse_id
        ? nurseMap.get(shift.nurse_id) || shift.nurse_id
        : "未設定";
      
      const startTime = shift.start_datetime
        ? new Date(shift.start_datetime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const endTime = shift.end_datetime
        ? new Date(shift.end_datetime).toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";
      const timeDisplay = startTime && endTime 
        ? `${startTime}-${endTime}`
        : startTime || "";

      const event: CalendarEvent = {
        id: String(shift.id),
        title: facilityName,
        time: timeDisplay,
        color: "bg-pink-100 text-pink-700",
        onClick: () => {
          // Navigate to route page for this nurse on this date
          // Use the same date key that was used to group this shift in the calendar
          // This ensures consistency between calendar display and navigation
          if (shift.nurse_id && key) {
            navigate(`/shifts/daily/${key}/${shift.nurse_id}`);
          } else {
            // Fallback to detail page if nurse_id or date key is missing
            navigate(`/shifts/${shift.id}`);
          }
        },
      };

      const list = eventsMap.get(key) ?? [];
      list.push(event);
      eventsMap.set(key, list);
    });

    return eventsMap;
  }, [data, nurseMap, navigate, searchQuery, facilityMap, facilities, selectedNurseId]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          訪問スケジュール
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">シフト</h1>
      </header>

      <Card>
        {/* カレンダー上部のフィルター */}
        <div className="mb-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 shadow-sm">
          <div className="space-y-4">
            {/* 看護師選択 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <UserGroupIcon className="h-5 w-5 text-brand-600" />
                </div>
                <label className="text-sm font-semibold text-slate-700">看護師</label>
              </div>
              <div className="relative flex-1">
                <select
                  value={selectedNurseId}
                  onChange={(e) => setSelectedNurseId(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all hover:border-brand-400 hover:shadow-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="">すべての看護師</option>
                  {nurses.map((nurse) => (
                    <option key={nurse.id} value={nurse.nurse_id || ""}>
                      {nurse.last_name} {nurse.first_name} {nurse.nurse_id ? `(${nurse.nurse_id})` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {/* 施設名検索 */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 min-w-[120px]">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <FunnelIcon className="h-5 w-5 text-brand-600" />
                </div>
                <label className="text-sm font-semibold text-slate-700">施設名検索</label>
              </div>
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="施設名で検索..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 shadow-sm transition-all placeholder:text-slate-400 hover:border-brand-400 hover:shadow-md focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        <ModernCalendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
          showSearch={false}
          showAddButton={false}
          onDayClick={(date) => {
            // When clicking on a day cell, navigate to that day's route page
            // Only navigate if a nurse is selected
            if (selectedNurseId) {
              const dateKey = formatDateKey(date);
              navigate(`/shifts/daily/${dateKey}/${selectedNurseId}`);
            }
          }}
        />
      </Card>
    </div>
  );
}
