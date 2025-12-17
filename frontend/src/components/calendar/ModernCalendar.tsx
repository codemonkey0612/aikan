import { useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export interface CalendarEvent {
  id?: string;
  title: string;
  time?: string;
  color?: string;
  dotColor?: string;
  onClick?: () => void;
}

interface DayData {
  date: Date;
  events?: CalendarEvent[];
  isToday?: boolean;
  isCurrentMonth?: boolean;
}

interface ModernCalendarProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  events?: Map<string, CalendarEvent[]>;
  renderDayContent?: (day: DayData) => React.ReactNode;
  onDayClick?: (date: Date) => void;
  showSearch?: boolean;
  showAddButton?: boolean;
  onAddClick?: () => void;
}

export function ModernCalendar({
  currentMonth,
  onMonthChange,
  events = new Map(),
  renderDayContent,
  onDayClick,
  showSearch = false,
  showAddButton = false,
  onAddClick,
}: ModernCalendarProps) {
  const today = new Date();

  const monthLabel = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthShortLabel = currentMonth.toLocaleDateString("en-US", {
    month: "short",
  });

  const dateRange = useMemo(() => {
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    return {
      start: firstDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      end: lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  }, [currentMonth]);

  const calendarDays = useMemo(() => {
    const days: (Date | null)[] = [];
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    );
    const startWeekday = firstDay.getDay();
    // Convert Sunday (0) to be last day of week (6), Monday (1) to 0, etc.
    const adjustedStartWeekday = startWeekday === 0 ? 6 : startWeekday - 1;
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();

    // Add days from previous month
    for (let i = 0; i < adjustedStartWeekday; i++) {
      days.push(null);
    }
    // Add days of current month
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
    onMonthChange(next);
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Import date formatting utility
  // Note: We'll keep formatKey here for backward compatibility with this component
  // but it should use local timezone formatting
  const formatKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-slate-100 px-3 py-1.5 rounded-lg">
            <p className="text-sm font-semibold text-slate-700">
              {monthShortLabel.toUpperCase()} {currentMonth.getDate()}
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{monthLabel}</h2>
            <p className="text-sm text-slate-500">
              {dateRange.start} - {dateRange.end}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showSearch && (
            <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Today
          </button>
          <div className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700">
            Month view
          </div>
          {showAddButton && (
            <button
              onClick={onAddClick}
              className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add event
            </button>
          )}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200">
          {WEEK_DAYS.map((day) => (
            <div
              key={day}
              className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[120px] border-r border-b border-slate-100 bg-slate-50/30"
                />
              );
            }

            const dayKey = formatKey(day);
            const dayEvents = events.get(dayKey) || [];
            const isTodayDate = isToday(day);

            return (
              <div
                key={dayKey}
                onClick={() => onDayClick?.(day)}
                className={`min-h-[120px] border-r border-b border-slate-100 p-2 transition hover:bg-slate-50 ${
                  isTodayDate ? "bg-blue-50" : "bg-white"
                } ${onDayClick ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      isTodayDate
                        ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        : "text-slate-700"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  {renderDayContent ? (
                    renderDayContent({
                      date: day,
                      events: dayEvents,
                      isToday: isTodayDate,
                      isCurrentMonth: true,
                    })
                  ) : (
                    <>
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <div
                          key={event.id || idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            event.onClick?.();
                          }}
                          className={`text-xs px-2 py-1 rounded truncate ${
                            event.color || "bg-slate-100 text-slate-700"
                          } ${event.onClick ? "cursor-pointer hover:opacity-80" : ""}`}
                        >
                          {event.dotColor && (
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                                event.dotColor
                              }`}
                            />
                          )}
                          {event.time && (
                            <span className="font-medium mr-1">{event.time}</span>
                          )}
                          <span>{event.title}</span>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-slate-500 px-2">
                          {dayEvents.length - 3} more...
                        </div>
                      )}
                    </>
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

