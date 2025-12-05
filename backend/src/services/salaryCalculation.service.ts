import * as ShiftModel from "../models/shift.model";
import * as SalaryModel from "../models/salary.model";
import * as SalarySettingModel from "../models/salarySetting.model";
import * as VitalModel from "../models/vital.model";
import * as UserModel from "../models/user.model";
import * as ResidentModel from "../models/resident.model";
import * as FacilityModel from "../models/facility.model";
import { calculateDistance, parseCoordinates } from "../utils/distance";
import { db } from "../config/db";

export interface SalaryCalculationResult {
  total_amount: number;
  distance_pay: number;
  time_pay: number;
  vital_pay: number;
  total_distance_km: number;
  total_minutes: number;
  total_vital_count: number;
  calculation_details: any[];
}

/**
 * Calculate salary for a nurse for a given month
 */
export const calculateNurseSalary = async (
  nurse_id: string,
  year_month: string
): Promise<SalaryCalculationResult> => {
  // Get pay rates
  const paykmSetting = await SalarySettingModel.getSalarySettingByKey("paykm");
  const payminSetting = await SalarySettingModel.getSalarySettingByKey(
    "paymin"
  );

  const paykm = paykmSetting?.setting_value ?? 100.0;
  const paymin = payminSetting?.setting_value ?? 2000.0;

  // Get nurse location
  const users = await UserModel.getAllUsers({ nurse_id });
  const nurse = users.find((u) => u.nurse_id === nurse_id);
  const nurseCoords = parseCoordinates(nurse?.latitude_longitude ?? null);

  // Get shifts for the month
  const year = parseInt(year_month.split("-")[0]);
  const month = parseInt(year_month.split("-")[1]);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0, 23, 59, 59);

  const shifts = await ShiftModel.getShiftsPaginated(1, 10000, "start_datetime", "asc", {
    nurse_id,
    date_from: monthStart.toISOString().slice(0, 10),
    date_to: monthEnd.toISOString().slice(0, 10),
  });

  let totalDistanceKm = 0;
  let totalMinutes = 0;
  let totalVitalCount = 0;
  const calculationDetails: any[] = [];

  // Get all facilities and residents for efficient lookup
  const allFacilities = await FacilityModel.getAllFacilities();
  const allResidents = await ResidentModel.getAllResidents();
  const facilityMap = new Map(
    allFacilities.map((f) => [f.facility_id, f])
  );

  // Process each shift
  for (const shift of shifts.data) {
    const shiftDate = new Date(shift.start_datetime);
    const shiftDetails: any = {
      shift_id: shift.id,
      date: shiftDate.toISOString().slice(0, 10),
      facility_id: shift.facility_id,
      distance_km: 0,
      minutes: 0,
      vital_count: 0,
    };

    // Calculate distance if we have coordinates
    if (nurseCoords && shift.facility_id) {
      // Use pre-calculated distance if available
      if (shift.distance_km) {
        shiftDetails.distance_km = shift.distance_km;
        totalDistanceKm += shift.distance_km;
      } else {
        // Calculate distance from nurse location to facility
        const facility = facilityMap.get(shift.facility_id);
        if (facility) {
          const facilityCoords = parseCoordinates(
            facility.latitude_longitude
          );
          if (facilityCoords) {
            const distance = calculateDistance(
              nurseCoords.lat,
              nurseCoords.lng,
              facilityCoords.lat,
              facilityCoords.lng
            );
            shiftDetails.distance_km = distance;
            totalDistanceKm += distance;
          }
        }
      }
    }

    // Calculate minutes (visit duration)
    if (shift.end_datetime) {
      const startTime = new Date(shift.start_datetime);
      const endTime = new Date(shift.end_datetime);
      const diffMs = endTime.getTime() - startTime.getTime();
      const minutes = Math.round(diffMs / (1000 * 60));
      shiftDetails.minutes = minutes;
      totalMinutes += minutes;
    } else if (shift.required_time) {
      // Fallback to required_time if end_datetime is not set
      shiftDetails.minutes = shift.required_time;
      totalMinutes += shift.required_time;
    }

    // Count vital records for residents in this facility on this date
    if (shift.facility_id) {
      // Get residents in this facility
      const facilityResidents = allResidents.filter(
        (r) => r.facility_id === shift.facility_id && !r.is_excluded
      );
      const residentIds = facilityResidents.map((r) => r.resident_id);

      if (residentIds.length > 0) {
        // Count vital records for these residents on this date
        const dateStart = new Date(shiftDate);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(shiftDate);
        dateEnd.setHours(23, 59, 59, 999);

        const [vitalRows] = await db.query<any[]>(
          `SELECT COUNT(*) as count FROM vital_records 
           WHERE resident_id IN (${residentIds.map(() => "?").join(",")})
           AND measured_at >= ? AND measured_at <= ?`,
          [
            ...residentIds,
            dateStart.toISOString().slice(0, 19).replace("T", " "),
            dateEnd.toISOString().slice(0, 19).replace("T", " "),
          ]
        );

        const vitalCount = vitalRows[0]?.count ?? 0;
        shiftDetails.vital_count = vitalCount;
        totalVitalCount += vitalCount;
      }
    }

    calculationDetails.push(shiftDetails);
  }

  // Calculate payments
  const distancePay = Math.round(totalDistanceKm * paykm);
  const timePay = Math.round((totalMinutes / 60) * paymin);
  const vitalPay = Math.round(totalVitalCount * 10.0 * paymin);
  const totalAmount = distancePay + timePay + vitalPay;

  return {
    total_amount: totalAmount,
    distance_pay: distancePay,
    time_pay: timePay,
    vital_pay: vitalPay,
    total_distance_km: Math.round(totalDistanceKm * 100) / 100,
    total_minutes: totalMinutes,
    total_vital_count: totalVitalCount,
    calculation_details: calculationDetails,
  };
};

/**
 * Calculate and save salary for a nurse
 */
export const calculateAndSaveSalary = async (
  user_id: number,
  nurse_id: string,
  year_month: string
) => {
  const calculation = await calculateNurseSalary(nurse_id, year_month);

  // Check if salary already exists
  const existing = await SalaryModel.getSalaryByNurseAndMonth(
    nurse_id,
    year_month
  );

  const salaryData: SalaryModel.SalaryInput = {
    user_id,
    nurse_id,
    year_month,
    total_amount: calculation.total_amount,
    distance_pay: calculation.distance_pay,
    time_pay: calculation.time_pay,
    vital_pay: calculation.vital_pay,
    total_distance_km: calculation.total_distance_km,
    total_minutes: calculation.total_minutes,
    total_vital_count: calculation.total_vital_count,
    calculation_details: calculation.calculation_details,
  };

  if (existing) {
    return SalaryModel.updateSalary(existing.id, salaryData);
  } else {
    return SalaryModel.createSalary(salaryData);
  }
};

