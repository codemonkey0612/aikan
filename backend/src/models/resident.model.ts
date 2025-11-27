import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ResidentRow extends RowDataPacket {
  id: number;
  facility_id: number;
  first_name: string | null;
  last_name: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  birth_date: string | null;
  status: string | null;
  created_at: string;
}

export type ResidentInput = Omit<ResidentRow, "id" | "created_at">;

export const getAllResidents = async () => {
  const [rows] = await db.query<ResidentRow[]>("SELECT * FROM residents");
  return rows;
};

export const getResidentById = async (id: number) => {
  const [rows] = await db.query<ResidentRow[]>(
    "SELECT * FROM residents WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createResident = async (data: ResidentInput) => {
  const { facility_id, first_name, last_name, gender, birth_date, status } =
    data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO residents 
    (facility_id, first_name, last_name, gender, birth_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [facility_id, first_name, last_name, gender, birth_date, status]
  );

  return getResidentById(result.insertId);
};

export const updateResident = async (
  id: number,
  data: Partial<ResidentInput>
) => {
  const fields = Object.keys(data) as (keyof ResidentInput)[];

  if (!fields.length) {
    return getResidentById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE residents SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getResidentById(id);
};

export const deleteResident = async (id: number) => {
  await db.query("DELETE FROM residents WHERE id = ?", [id]);
};

