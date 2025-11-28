import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftTemplateRow extends RowDataPacket {
  id: number;
  name: string;
  facility_id: number | null;
  shift_type: string | null;
  start_time: string | null;
  end_time: string | null;
  day_of_week: number | null;
  is_recurring: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftTemplateInput {
  name: string;
  facility_id?: number | null;
  shift_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  day_of_week?: number | null;
  is_recurring?: number;
  active?: number;
}

export type UpdateShiftTemplateInput = Partial<CreateShiftTemplateInput>;

export const getAllShiftTemplates = async () => {
  const [rows] = await db.query<ShiftTemplateRow[]>(
    "SELECT * FROM shift_templates WHERE active = 1 ORDER BY name"
  );
  return rows;
};

export const getShiftTemplateById = async (id: number) => {
  const [rows] = await db.query<ShiftTemplateRow[]>(
    "SELECT * FROM shift_templates WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getShiftTemplatesByFacility = async (facility_id: number) => {
  const [rows] = await db.query<ShiftTemplateRow[]>(
    "SELECT * FROM shift_templates WHERE facility_id = ? AND active = 1 ORDER BY name",
    [facility_id]
  );
  return rows;
};

export const createShiftTemplate = async (data: CreateShiftTemplateInput) => {
  const {
    name,
    facility_id,
    shift_type,
    start_time,
    end_time,
    day_of_week,
    is_recurring,
    active,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shift_templates (name, facility_id, shift_type, start_time, end_time, day_of_week, is_recurring, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      facility_id ?? null,
      shift_type ?? null,
      start_time ?? null,
      end_time ?? null,
      day_of_week ?? null,
      is_recurring ?? 0,
      active ?? 1,
    ]
  );
  return getShiftTemplateById(result.insertId);
};

export const updateShiftTemplate = async (
  id: number,
  data: UpdateShiftTemplateInput
) => {
  const fields = Object.keys(data) as (keyof UpdateShiftTemplateInput)[];

  if (!fields.length) {
    return getShiftTemplateById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE shift_templates SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getShiftTemplateById(id);
};

export const deleteShiftTemplate = async (id: number) => {
  await db.query("DELETE FROM shift_templates WHERE id = ?", [id]);
};

