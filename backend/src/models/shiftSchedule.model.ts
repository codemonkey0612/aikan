import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftScheduleRow extends RowDataPacket {
  shift_schedule_id: number; // BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  year_month: string; // CHAR(7) - e.g., "2025-12"
  nurse_id: string; // VARCHAR(100)
  shift_list: string; // JSON - stored as JSON type in MySQL
  is_latest: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftScheduleInput {
  year_month: string; // CHAR(7) - e.g., "2025-12"
  nurse_id: string; // VARCHAR(100)
  shift_list: string | object; // JSON string or object
  is_latest?: boolean;
}

export type UpdateShiftScheduleInput = Partial<CreateShiftScheduleInput>;

export const getAllShiftSchedules = async () => {
  const [rows] = await db.query<ShiftScheduleRow[]>(
    "SELECT * FROM shift_schedules"
  );
  return rows;
};

export const getShiftScheduleById = async (shift_schedule_id: number) => {
  const [rows] = await db.query<ShiftScheduleRow[]>(
    "SELECT * FROM shift_schedules WHERE shift_schedule_id = ?",
    [shift_schedule_id]
  );
  return rows[0] ?? null;
};

export const getShiftScheduleByNurseAndMonth = async (
  nurse_id: string, // VARCHAR(100)
  year_month: string // CHAR(7)
) => {
  const [rows] = await db.query<ShiftScheduleRow[]>(
    "SELECT * FROM shift_schedules WHERE nurse_id = ? AND year_month = ?",
    [nurse_id, year_month]
  );
  return rows[0] ?? null;
};

export const getLatestShiftScheduleByNurse = async (nurse_id: string) => {
  const [rows] = await db.query<ShiftScheduleRow[]>(
    "SELECT * FROM shift_schedules WHERE nurse_id = ? AND is_latest = TRUE ORDER BY year_month DESC LIMIT 1",
    [nurse_id]
  );
  return rows[0] ?? null;
};

export const createShiftSchedule = async (data: CreateShiftScheduleInput) => {
  const { year_month, nurse_id, shift_list, is_latest = false } = data;

  // Convert shift_list to JSON string if it's an object
  const shiftListJson =
    typeof shift_list === "string" ? shift_list : JSON.stringify(shift_list);

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shift_schedules (year_month, nurse_id, shift_list, is_latest)
     VALUES (?, ?, ?, ?)`,
    [year_month, nurse_id, shiftListJson, is_latest]
  );
  return getShiftScheduleById(result.insertId);
};

export const updateShiftSchedule = async (
  shift_schedule_id: number,
  data: UpdateShiftScheduleInput
) => {
  const fields = Object.keys(data) as (keyof UpdateShiftScheduleInput)[];

  if (!fields.length) {
    return getShiftScheduleById(shift_schedule_id);
  }

  // Handle shift_list conversion if present
  const processedData: any = { ...data };
  if (processedData.shift_list && typeof processedData.shift_list === "object") {
    processedData.shift_list = JSON.stringify(processedData.shift_list);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => processedData[field]);

  await db.query(
    `UPDATE shift_schedules SET ${setClause} WHERE shift_schedule_id = ?`,
    [...values, shift_schedule_id]
  );
  return getShiftScheduleById(shift_schedule_id);
};

export const deleteShiftSchedule = async (shift_schedule_id: number) => {
  await db.query("DELETE FROM shift_schedules WHERE shift_schedule_id = ?", [shift_schedule_id]);
};



