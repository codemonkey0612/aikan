import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftLocationRow extends RowDataPacket {
  shift_location_id: number; // BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
  facility_id: string | null; // VARCHAR(50)
  nurse_id: string | null; // VARCHAR(100)
  date_time: string | null; // VARCHAR(50)
  latitude_longitude_from: string | null; // VARCHAR(50) - combined "lat,lng"
  distance_m: number | null; // INT
  duration_sec: number | null; // INT
  shift_period: string | null; // VARCHAR(255)
  created_at: string;
  updated_at: string;
}

export interface CreateShiftLocationInput {
  facility_id?: string | null; // VARCHAR(50)
  nurse_id?: string | null; // VARCHAR(100)
  date_time?: string | null; // VARCHAR(50)
  latitude_longitude_from?: string | null; // VARCHAR(50) - combined "lat,lng"
  distance_m?: number | null; // INT
  duration_sec?: number | null; // INT
  shift_period?: string | null; // VARCHAR(255)
}

export type UpdateShiftLocationInput = Partial<CreateShiftLocationInput>;

export const getAllShiftLocations = async () => {
  const [rows] = await db.query<ShiftLocationRow[]>(
    "SELECT * FROM shift_locations"
  );
  return rows;
};

export const getShiftLocationById = async (shift_location_id: number) => {
  const [rows] = await db.query<ShiftLocationRow[]>(
    "SELECT * FROM shift_locations WHERE shift_location_id = ?",
    [shift_location_id]
  );
  return rows[0] ?? null;
};

export const getShiftLocationsByFacility = async (facility_id: string) => {
  const [rows] = await db.query<ShiftLocationRow[]>(
    "SELECT * FROM shift_locations WHERE facility_id = ? ORDER BY date_time DESC",
    [facility_id]
  );
  return rows;
};

export const getShiftLocationsByNurse = async (nurse_id: string) => {
  const [rows] = await db.query<ShiftLocationRow[]>(
    "SELECT * FROM shift_locations WHERE nurse_id = ? ORDER BY date_time DESC",
    [nurse_id]
  );
  return rows;
};

export const createShiftLocation = async (data: CreateShiftLocationInput) => {
  const {
    facility_id,
    nurse_id,
    date_time,
    latitude_longitude_from,
    distance_m,
    duration_sec,
    shift_period,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shift_locations (
      facility_id, nurse_id, date_time,
      latitude_longitude_from, distance_m, duration_sec, shift_period
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      facility_id ?? null,
      nurse_id ?? null,
      date_time ?? null,
      latitude_longitude_from ?? null,
      distance_m ?? null,
      duration_sec ?? null,
      shift_period ?? null,
    ]
  );
  return getShiftLocationById(result.insertId);
};

export const updateShiftLocation = async (
  shift_location_id: number,
  data: UpdateShiftLocationInput
) => {
  const fields = Object.keys(data) as (keyof UpdateShiftLocationInput)[];

  if (!fields.length) {
    return getShiftLocationById(shift_location_id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE shift_locations SET ${setClause} WHERE shift_location_id = ?`,
    [...values, shift_location_id]
  );
  return getShiftLocationById(shift_location_id);
};

export const deleteShiftLocation = async (shift_location_id: number) => {
  await db.query("DELETE FROM shift_locations WHERE shift_location_id = ?", [shift_location_id]);
};



