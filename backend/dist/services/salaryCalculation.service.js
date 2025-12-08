"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAndSaveSalary = exports.calculateNurseSalary = void 0;
const ShiftModel = __importStar(require("../models/shift.model"));
const SalaryModel = __importStar(require("../models/salary.model"));
const UserModel = __importStar(require("../models/user.model"));
const ResidentModel = __importStar(require("../models/resident.model"));
const FacilityModel = __importStar(require("../models/facility.model"));
const distance_1 = require("../utils/distance");
const db_1 = require("../config/db");
/**
 * Calculate salary for a nurse for a given month
 */
const calculateNurseSalary = async (nurse_id, year_month) => {
    try {
        // Pay rates (hardcoded)
        const paykm = 50;
        const paymin = 35;
        // Get nurse location
        // Normalize nurse_id for comparison
        const normalizedNurseIdForUser = String(nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
        const users = await UserModel.getAllUsers();
        const nurse = users.find((u) => {
            if (!u.nurse_id)
                return false;
            const userNurseId = String(u.nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
            return userNurseId === normalizedNurseIdForUser;
        });
        const nurseCoords = (0, distance_1.parseCoordinates)(nurse?.latitude_longitude ?? null);
        // Get shifts for the month
        const year = parseInt(year_month.split("-")[0]);
        const month = parseInt(year_month.split("-")[1]);
        const monthStart = new Date(year, month - 1, 1);
        monthStart.setHours(0, 0, 0, 0);
        const monthEnd = new Date(year, month, 0, 23, 59, 59);
        // Normalize nurse_id (trim whitespace and newlines)
        const normalizedNurseId = String(nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
        const shifts = await ShiftModel.getShiftsPaginated(1, 10000, "start_datetime", "asc", {
            nurse_id: normalizedNurseId,
            date_from: monthStart.toISOString().slice(0, 10),
            date_to: monthEnd.toISOString().slice(0, 10),
        });
        let totalDistanceKm = 0;
        let totalMinutes = 0;
        let totalVitalCount = 0;
        const calculationDetails = [];
        // Get all facilities and residents for efficient lookup
        const allFacilities = await FacilityModel.getAllFacilities();
        const allResidents = await ResidentModel.getAllResidents();
        const facilityMap = new Map(allFacilities.map((f) => [f.facility_id, f]));
        // Process each shift
        for (const shift of shifts.data) {
            const shiftDate = new Date(shift.start_datetime);
            const shiftDetails = {
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
                }
                else {
                    // Calculate distance from nurse location to facility
                    const facility = facilityMap.get(shift.facility_id);
                    if (facility) {
                        const facilityCoords = (0, distance_1.parseCoordinates)(facility.latitude_longitude);
                        if (facilityCoords) {
                            const distance = (0, distance_1.calculateDistance)(nurseCoords.lat, nurseCoords.lng, facilityCoords.lat, facilityCoords.lng);
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
            }
            else if (shift.required_time) {
                // Fallback to required_time if end_datetime is not set
                shiftDetails.minutes = shift.required_time;
                totalMinutes += shift.required_time;
            }
            // Count vital records for residents in this facility on this date
            if (shift.facility_id) {
                // Get residents in this facility
                const facilityResidents = allResidents.filter((r) => r.facility_id === shift.facility_id && !r.is_excluded);
                const residentIds = facilityResidents.map((r) => r.resident_id);
                if (residentIds.length > 0) {
                    try {
                        // Count vital records for these residents on this date
                        const dateStart = new Date(shiftDate);
                        dateStart.setHours(0, 0, 0, 0);
                        const dateEnd = new Date(shiftDate);
                        dateEnd.setHours(23, 59, 59, 999);
                        const [vitalRows] = await db_1.db.query(`SELECT COUNT(*) as count FROM vital_records 
             WHERE resident_id IN (${residentIds.map(() => "?").join(",")})
             AND measured_at >= ? AND measured_at <= ?`, [
                            ...residentIds,
                            dateStart.toISOString().slice(0, 19).replace("T", " "),
                            dateEnd.toISOString().slice(0, 19).replace("T", " "),
                        ]);
                        const vitalCount = vitalRows?.[0]?.count ?? 0;
                        shiftDetails.vital_count = vitalCount;
                        totalVitalCount += vitalCount;
                    }
                    catch (vitalError) {
                        console.error(`Error counting vitals for shift ${shift.id}:`, vitalError);
                        // Continue with 0 vital count if query fails
                        shiftDetails.vital_count = 0;
                    }
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
    }
    catch (error) {
        console.error("Error in calculateNurseSalary:", error);
        console.error("nurse_id:", nurse_id, "year_month:", year_month);
        throw error;
    }
};
exports.calculateNurseSalary = calculateNurseSalary;
/**
 * Calculate and save salary for a nurse
 */
const calculateAndSaveSalary = async (user_id, nurse_id, year_month) => {
    const calculation = await (0, exports.calculateNurseSalary)(nurse_id, year_month);
    // Check if salary already exists
    const existing = await SalaryModel.getSalaryByNurseAndMonth(nurse_id, year_month);
    const salaryData = {
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
    }
    else {
        return SalaryModel.createSalary(salaryData);
    }
};
exports.calculateAndSaveSalary = calculateAndSaveSalary;
