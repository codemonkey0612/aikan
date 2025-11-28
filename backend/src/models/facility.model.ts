import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface FacilityRow extends RowDataPacket {
  id: number;
  corporation_id: number;
  name: string;
  code: string | null;
  postal_code: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

export interface CreateFacilityInput {
  corporation_id: number;
  name: string;
  code?: string | null;
  postal_code?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export type UpdateFacilityInput = Partial<CreateFacilityInput>;

export const getAllFacilities = async () => {
  const [rows] = await db.query<FacilityRow[]>("SELECT * FROM facilities");
  return rows;
};

export const getFacilityById = async (id: number) => {
  const [rows] = await db.query<FacilityRow[]>(
    "SELECT * FROM facilities WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createFacility = async (data: CreateFacilityInput) => {
  const {
    corporation_id,
    name,
    code,
    postal_code,
    address,
    lat,
    lng,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO facilities (corporation_id, name, code, postal_code, address, lat, lng)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [corporation_id, name, code ?? null, postal_code ?? null, address ?? null, lat ?? null, lng ?? null]
  );
  return getFacilityById(result.insertId);
};

export const updateFacility = async (
  id: number,
  data: UpdateFacilityInput
) => {
  const fields = Object.keys(data) as (keyof UpdateFacilityInput)[];

  if (!fields.length) {
    return getFacilityById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE facilities SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getFacilityById(id);
};

export const deleteFacility = async (id: number) => {
  await db.query("DELETE FROM facilities WHERE id = ?", [id]);
};

