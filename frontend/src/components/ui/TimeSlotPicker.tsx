import { useState, useEffect, useMemo } from "react";
import { ClockIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface TimeSlot {
  start: string;
  end: string;
}

interface TimeSlotPickerProps {
  value: string[];
  onChange: (slots: string[]) => void;
  placeholder?: string;
}

export function TimeSlotPicker({
  value,
  onChange,
  placeholder = "時間帯を追加",
}: TimeSlotPickerProps) {
  const parseSlots = (slots: string[]): TimeSlot[] => {
    if (slots.length === 0) {
      return [{ start: "", end: "" }];
    }
    return slots.map((slot) => {
      const [start, end] = slot.split("-");
      return { start: start?.trim() || "", end: end?.trim() || "" };
    });
  };

  const [slots, setSlots] = useState<TimeSlot[]>(() => parseSlots(value));

  // Create a stable string representation for comparison
  const valueKey = useMemo(() => JSON.stringify(value), [value]);

  // Sync with external value changes
  useEffect(() => {
    const parsed = parseSlots(value);
    setSlots(parsed);
  }, [valueKey]);

  const updateSlot = (index: number, field: "start" | "end", time: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: time };
    setSlots(newSlots);
    onChange(
      newSlots
        .filter((s) => s.start && s.end)
        .map((s) => `${s.start}-${s.end}`)
    );
  };

  const addSlot = () => {
    const newSlots = [...slots, { start: "", end: "" }];
    setSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    const newSlots = slots.filter((_, i) => i !== index);
    setSlots(newSlots);
    onChange(
      newSlots
        .filter((s) => s.start && s.end)
        .map((s) => `${s.start}-${s.end}`)
    );
  };

  // Generate time options (every 30 minutes from 00:00 to 23:30)
  const timeOptions: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      timeOptions.push(time);
    }
  }

  return (
    <div className="space-y-2">
      {slots.map((slot, index) => (
        <div key={index} className="flex items-start sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 flex-1">
            <select
              value={slot.start}
              onChange={(e) => updateSlot(index, "start", e.target.value)}
              className="flex-1 rounded border border-slate-300 px-2 py-1.5 sm:py-1 text-xs sm:text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">開始</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 hidden sm:inline">〜</span>
            <select
              value={slot.end}
              onChange={(e) => updateSlot(index, "end", e.target.value)}
              className="flex-1 rounded border border-slate-300 px-2 py-1.5 sm:py-1 text-xs sm:text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">終了</option>
              {timeOptions
                .filter((time) => !slot.start || time > slot.start)
                .map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
            </select>
          </div>
          {(slot.start || slot.end) && slots.length > 1 && (
            <button
              onClick={() => removeSlot(index)}
              className="p-1.5 sm:p-1 text-slate-400 hover:text-red-500 flex-shrink-0"
              type="button"
              aria-label="時間帯を削除"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      ))}
      {slots.some((s) => s.start && s.end) && (
        <button
          onClick={addSlot}
          type="button"
          className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 w-full sm:w-auto"
        >
          <PlusIcon className="h-4 w-4" />
          {placeholder}
        </button>
      )}
    </div>
  );
}
