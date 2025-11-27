import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface VitalRow extends RowDataPacket {
  id: number;
  resident_id: number;
  measured_at: string | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  pulse: number | null;
  temperature: number | null;
  spo2: number | null;
  note: string | null;
  created_by: number | null;
  created_at: string;
}

export type VitalInput = Omit<VitalRow, "id" | "created_at">;

export const getAllVitals = async () => {
  const [rows] = await db.query<VitalRow[]>("SELECT * FROM vital_records");
  return rows;
};

export const getVitalById = async (id: number) => {
  const [rows] = await db.query<VitalRow[]>(
    "SELECT * FROM vital_records WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createVital = async (data: VitalInput) => {
  const {
    resident_id,
    measured_at,
    systolic_bp,
    diastolic_bp,
    pulse,
    temperature,
    spo2,
    note,
    created_by,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO vital_records
    (resident_id, measured_at, systolic_bp, diastolic_bp, pulse, temperature, spo2, note, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      measured_at,
      systolic_bp,
      diastolic_bp,
      pulse,
      temperature,
      spo2,
      note,
      created_by,
    ]
  );

  return getVitalById(result.insertId);
};

export const updateVital = async (id: number, data: Partial<VitalInput>) => {
  const fields = Object.keys(data) as (keyof VitalInput)[];

  if (!fields.length) {
    return getVitalById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE vital_records SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getVitalById(id);
};

export const deleteVital = async (id: number) => {
  await db.query("DELETE FROM vital_records WHERE id = ?", [id]);
};

