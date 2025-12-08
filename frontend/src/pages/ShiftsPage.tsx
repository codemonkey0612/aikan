import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useFacilities } from "../hooks/useFacilities";
import type { Shift } from "../api/types";
import { Card } from "../components/ui/Card";
import { ModernCalendar } from "../components/calendar/ModernCalendar";
import type { CalendarEvent } from "../components/calendar/ModernCalendar";

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

export function ShiftsPage() {
  const navigate = useNavigate();
  const { data: users } = useUsers();
  const userList = useMemo(() => Array.isArray(users) ? users : users?.data || [], [users]);
  const { data: facilities, isLoading: facilitiesLoading } = useFacilities();
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
  });

  // 月の開始日と終了日を計算
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data, isLoading } = useShifts({
    date_from: monthStart.toISOString().slice(0, 10),
    date_to: monthEnd.toISOString().slice(0, 10),
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

  // 日付ごとにシフトをグループ化してイベントに変換
  const calendarEvents = useMemo(() => {
    const eventsMap = new Map<string, CalendarEvent[]>();
    if (!data?.data) return eventsMap;

    data.data.forEach((shift) => {
      if (!shift.start_datetime) return;
      const date = new Date(shift.start_datetime);
      const key = formatKey(date);
      
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
        onClick: () => navigate(`/shifts/${shift.id}`),
      };

      const list = eventsMap.get(key) ?? [];
      list.push(event);
      eventsMap.set(key, list);
    });

    return eventsMap;
  }, [data, nurseMap, navigate]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          訪問スケジュール
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">シフト</h1>
      </header>

      <Card>
        <ModernCalendar
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
          showSearch={true}
          showAddButton={false}
        />
      </Card>
    </div>
  );
}
