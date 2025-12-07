import type { Facility, Resident, Shift } from "../api/types";

const MONTHS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

/**
 * Get last 12 months data for facilities
 */
export function getMonthlyFacilityData(facilities: Facility[] | undefined) {
  if (!facilities) return [];

  const now = new Date();
  const monthlyData: Record<string, number> = {};

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  // Count facilities by created_at month
  facilities.forEach((facility) => {
    if (facility.created_at) {
      const date = new Date(facility.created_at);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    }
  });

  // Convert to array format
  return Object.entries(monthlyData)
    .slice(-12)
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      const monthIndex = parseInt(month) - 1;
      return {
        month: MONTHS[monthIndex] || month,
        count: count,
      };
    });
}

/**
 * Get monthly resident counts
 */
export function getMonthlyResidentData(residents: Resident[] | undefined) {
  if (!residents) return [];

  const now = new Date();
  const monthlyData: Record<string, number> = {};

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  // Count residents by admission_date month (active residents)
  residents.forEach((resident) => {
    if (resident.admission_date && !resident.is_excluded) {
      const date = new Date(resident.admission_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    }
  });

  // Convert to cumulative counts
  let cumulative = 0;
  return Object.entries(monthlyData)
    .slice(-12)
    .map(([key, count]) => {
      cumulative += count;
      const [year, month] = key.split("-");
      const monthIndex = parseInt(month) - 1;
      return {
        month: MONTHS[monthIndex] || month,
        value: cumulative,
      };
    });
}

/**
 * Calculate occupancy rates for facilities
 */
export function getOccupancyData(facilities: Facility[] | undefined) {
  if (!facilities) {
    return {
      occupied: 0,
      available: 0,
      total: 0,
      percentage: 0,
    };
  }

  let totalCapacity = 0;
  let totalResidents = 0;

  facilities.forEach((facility) => {
    const capacity = facility.capacity || 0;
    const residents = facility.current_residents || 0;
    totalCapacity += capacity;
    totalResidents += residents;
  });

  const occupied = totalResidents;
  const available = totalCapacity - totalResidents;
  const percentage = totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0;

  return {
    occupied,
    available,
    total: totalCapacity,
    percentage,
  };
}

/**
 * Get statistics data for radar chart
 */
export function getStatisticsData(
  facilities: Facility[] | undefined,
  residents: Resident[] | undefined,
  shifts: Shift[] | undefined
) {
  const facilityCount = facilities?.length || 0;
  const residentCount = residents?.length || 0;
  const shiftCount = shifts?.data?.length || shifts?.length || 0;

  // Normalize to 0-100 scale
  const maxFacilities = 50;
  const maxResidents = 200;
  const maxShifts = 100;

  return [
    {
      category: "施設",
      value: Math.min(100, Math.round((facilityCount / maxFacilities) * 100)),
    },
    {
      category: "入居者",
      value: Math.min(100, Math.round((residentCount / maxResidents) * 100)),
    },
    {
      category: "シフト",
      value: Math.min(100, Math.round((shiftCount / maxShifts) * 100)),
    },
    {
      category: "ケア",
      value: Math.min(100, Math.round((residentCount / maxResidents) * 80)),
    },
    {
      category: "訪問",
      value: Math.min(100, Math.round((shiftCount / maxShifts) * 90)),
    },
    {
      category: "管理",
      value: Math.min(100, Math.round((facilityCount / maxFacilities) * 70)),
    },
  ];
}

/**
 * Get monthly shift counts
 */
export function getMonthlyShiftData(shifts: Shift[] | undefined) {
  if (!shifts) return [];
  
  const shiftArray = Array.isArray(shifts) ? shifts : shifts.data || [];
  if (shiftArray.length === 0) return [];

  const now = new Date();
  const monthlyData: Record<string, number> = {};

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyData[key] = 0;
  }

  // Count shifts by start_datetime month
  shiftArray.forEach((shift) => {
    if (shift.start_datetime) {
      const date = new Date(shift.start_datetime);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key]++;
      }
    }
  });

  // Convert to array format
  return Object.entries(monthlyData)
    .slice(-12)
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      const monthIndex = parseInt(month) - 1;
      return {
        month: MONTHS[monthIndex] || month,
        value: count,
      };
    });
}

