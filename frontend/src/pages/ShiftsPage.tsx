import { useMemo, useState } from "react";
import { useShifts } from "../hooks/useShifts";
import type { Shift } from "../api/types";
import { Card } from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "../components/ui/Table";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Pagination } from "../components/ui/Pagination";

const WEEK_DAYS = ["日", "月", "火", "水", "木", "金", "土"];

const formatKey = (date: Date) => date.toISOString().slice(0, 10);

export function ShiftsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading } = useShifts({ page, limit });
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    now.setDate(1);
    return now;
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

  const shiftByDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    if (!data?.data) return map;
    data.data.forEach((shift) => {
      if (!shift.date) return;
      const key = formatKey(new Date(shift.date));
      const list = map.get(key) ?? [];
      list.push(shift);
      map.set(key, list);
    });
    return map;
  }, [data]);

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + delta);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm uppercase tracking-wide text-slate-500">
          勤務体制
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">シフト</h1>
      </header>

      <Card title="月間シフトカレンダー">
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
              const dayShifts = shiftByDate.get(key) ?? [];
              const isToday =
                formatKey(day) === formatKey(new Date());

              return (
                <div
                  key={key}
                  className={`flex flex-col rounded-2xl border p-3 text-sm ${
                    isToday
                      ? "border-brand-300 bg-brand-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{day.getDate()}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
                      {dayShifts.length} 件
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayShifts.slice(0, 3).map((shift) => (
                      <div
                        key={shift.id}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600"
                      >
                        #{shift.user_id} / {shift.shift_type ?? "未設定"}
                      </div>
                    ))}
                    {dayShifts.length > 3 && (
                      <p className="text-right text-[10px] text-slate-400">
                        他 {dayShifts.length - 3} 件
                      </p>
                    )}
                    {!dayShifts.length && (
                      <p className="text-xs text-slate-300">予定なし</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <Card title="シフト一覧">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>看護師</TableHeaderCell>
              <TableHeaderCell>施設</TableHeaderCell>
              <TableHeaderCell>日付</TableHeaderCell>
              <TableHeaderCell>区分</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  シフトを読み込み中...
                </TableCell>
              </TableRow>
            )}
            {data?.data.map((shift) => (
              <TableRow key={shift.id}>
                <TableCell>#{shift.user_id}</TableCell>
                <TableCell>#{shift.facility_id}</TableCell>
                <TableCell>{shift.date}</TableCell>
                <TableCell>{shift.shift_type ?? "N/A"}</TableCell>
              </TableRow>
            ))}
            {!isLoading && !data?.data.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-400">
                  シフトがまだ登録されていません。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
            <p className="mt-2 text-center text-sm text-slate-500">
              {data.pagination.total}件中 {((page - 1) * limit + 1)}-{Math.min(page * limit, data.pagination.total)}件を表示
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

