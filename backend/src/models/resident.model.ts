import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ResidentRow extends RowDataPacket {
  resident_id: string; // VARCHAR(50) PRIMARY KEY
  user_id: string | null; // VARCHAR(50)
  status_id: string | null; // VARCHAR(50)
  facility_id: string | null; // VARCHAR(50)
  last_name: string;
  first_name: string;
  last_name_kana: string | null;
  first_name_kana: string | null;
  phone_number: string | null;
  admission_date: string | null; // DATE
  effective_date: string | null; // DATE
  discharge_date: string | null; // DATE
  is_excluded: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateResidentInput {
  resident_id: string; // Required - VARCHAR(50) PRIMARY KEY
  user_id?: string | null; // VARCHAR(50)
  status_id?: string | null; // VARCHAR(50)
  facility_id?: string | null; // VARCHAR(50)
  last_name: string;
  first_name: string;
  last_name_kana?: string | null;
  first_name_kana?: string | null;
  phone_number?: string | null;
  admission_date?: string | null; // DATE
  effective_date?: string | null; // DATE
  discharge_date?: string | null; // DATE
  is_excluded?: boolean;
  notes?: string | null;
}

export type UpdateResidentInput = Partial<CreateResidentInput>;

export const getAllResidents = async () => {
  const [rows] = await db.query<ResidentRow[]>("SELECT * FROM residents");
  return rows;
};

export const getResidentById = async (resident_id: string) => {
  const [rows] = await db.query<ResidentRow[]>(
    "SELECT * FROM residents WHERE resident_id = ?",
    [resident_id]
  );
  return rows[0] ?? null;
};

export const createResident = async (data: CreateResidentInput) => {
  const {
    resident_id,
    user_id,
    status_id,
    facility_id,
    last_name,
    first_name,
    last_name_kana,
    first_name_kana,
    phone_number,
    admission_date,
    effective_date,
    discharge_date,
    is_excluded = false,
    notes,
  } = data;

  await db.query<ResultSetHeader>(
    `INSERT INTO residents (
      resident_id, user_id, status_id, facility_id, last_name, first_name,
      last_name_kana, first_name_kana, phone_number,
      admission_date, effective_date, discharge_date,
      is_excluded, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      user_id ?? null,
      status_id ?? null,
      facility_id ?? null,
      last_name,
      first_name,
      last_name_kana ?? null,
      first_name_kana ?? null,
      phone_number ?? null,
      admission_date ?? null,
      effective_date ?? null,
      discharge_date ?? null,
      is_excluded,
      notes ?? null,
    ]
  );

  return getResidentById(resident_id);
};

export const updateResident = async (
  resident_id: string,
  data: UpdateResidentInput
) => {
  const fields = Object.keys(data) as (keyof UpdateResidentInput)[];

  if (!fields.length) {
    return getResidentById(resident_id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE residents SET ${setClause} WHERE resident_id = ?`,
    [...values, resident_id]
  );

  return getResidentById(resident_id);
};

export const deleteResident = async (resident_id: string) => {
  await db.query("DELETE FROM residents WHERE resident_id = ?", [resident_id]);
};

