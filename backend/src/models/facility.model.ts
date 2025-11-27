import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface FacilityRow extends RowDataPacket {
  id: number;
  name: string;
  address: string;
  phone: string;
  capacity: number;
}

export type FacilityInput = Omit<FacilityRow, "id">;

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

export const createFacility = async (data: FacilityInput) => {
  const { name, address, phone, capacity } = data;
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO facilities (name, address, phone, capacity) VALUES (?, ?, ?, ?)",
    [name, address, phone, capacity]
  );

  return { id: result.insertId, ...data };
};

export const updateFacility = async (
  id: number,
  data: Partial<FacilityInput>
) => {
  const fields = Object.keys(data) as (keyof FacilityInput)[];

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
  await db.query<ResultSetHeader>("DELETE FROM facilities WHERE id = ?", [id]);
};

