import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftRow extends RowDataPacket {
  id: number;
  user_id: number;
  facility_id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  shift_type: string | null;
  created_at: string;
}

export type ShiftInput = Omit<ShiftRow, "id" | "created_at">;

export const getAllShifts = async () => {
  const [rows] = await db.query<ShiftRow[]>("SELECT * FROM shifts");
  return rows;
};

export const getShiftById = async (id: number) => {
  const [rows] = await db.query<ShiftRow[]>(
    "SELECT * FROM shifts WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createShift = async (data: ShiftInput) => {
  const { user_id, facility_id, date, start_time, end_time, shift_type } =
    data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shifts (user_id, facility_id, date, start_time, end_time, shift_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, facility_id, date, start_time, end_time, shift_type]
  );

  return getShiftById(result.insertId);
};

export const updateShift = async (id: number, data: Partial<ShiftInput>) => {
  const fields = Object.keys(data) as (keyof ShiftInput)[];

  if (!fields.length) {
    return getShiftById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE shifts SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getShiftById(id);
};

export const deleteShift = async (id: number) => {
  await db.query("DELETE FROM shifts WHERE id = ?", [id]);
};

