import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface AlcoholCheckRow extends RowDataPacket {
  id: number;
  user_id: number; // BIGINT UNSIGNED - references users.id
  resident_id: string | null; // VARCHAR(50) - references residents.resident_id
  breath_alcohol_concentration: number;
  checked_at: string;
  device_image_path: string | null;
  notes: string | null;
  checked_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface AlcoholCheckInput {
  user_id: number; // BIGINT UNSIGNED
  resident_id?: string | null; // VARCHAR(50)
  breath_alcohol_concentration: number;
  checked_at: string;
  device_image_path?: string | null;
  notes?: string | null;
  checked_by?: number | null;
}

export type AlcoholCheckUpdate = Partial<Omit<AlcoholCheckInput, "user_id">>;

export const getAllAlcoholChecks = async () => {
  const [rows] = await db.query<AlcoholCheckRow[]>(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    ORDER BY ac.checked_at DESC
  `);
  return rows;
};

export const getAlcoholCheckById = async (id: number) => {
  const [rows] = await db.query<AlcoholCheckRow[]>(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    WHERE ac.id = ?
  `, [id]);
  return rows[0] ?? null;
};

export const getAlcoholChecksByUser = async (user_id: number) => {
  const [rows] = await db.query<AlcoholCheckRow[]>(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    WHERE ac.user_id = ?
    ORDER BY ac.checked_at DESC
  `, [user_id]);
  return rows;
};

export const createAlcoholCheck = async (data: AlcoholCheckInput) => {
  const {
    user_id,
    resident_id,
    breath_alcohol_concentration,
    checked_at,
    device_image_path,
    notes,
    checked_by,
  } = data;

  const [result] = await db.query<ResultSetHeader>(`
    INSERT INTO alcohol_checks (
      user_id, resident_id, breath_alcohol_concentration, 
      checked_at, device_image_path, notes, checked_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    user_id,
    resident_id || null,
    breath_alcohol_concentration,
    checked_at,
    device_image_path || null,
    notes || null,
    checked_by || null,
  ]);

  return getAlcoholCheckById(result.insertId);
};

export const updateAlcoholCheck = async (
  id: number,
  data: AlcoholCheckUpdate
) => {
  const fields = Object.keys(data) as (keyof AlcoholCheckUpdate)[];
  if (!fields.length) {
    return getAlcoholCheckById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE alcohol_checks SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getAlcoholCheckById(id);
};

export const deleteAlcoholCheck = async (id: number) => {
  await db.query("DELETE FROM alcohol_checks WHERE id = ?", [id]);
};

