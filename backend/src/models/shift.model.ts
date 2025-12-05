import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftRow extends RowDataPacket {
  id: number;
  shift_period: string | null;
  route_no: number | null;
  facility_id: string | null; // VARCHAR(50)
  facility_name: string | null;
  facility_address: string | null;
  resident_count: number | null;
  capacity: number | null;
  required_time: number | null;
  start_datetime: string; // DATETIME in DB, but string in TypeScript
  end_datetime: string | null; // DATETIME - optional, may not exist in old DB
  distance_km: number | null; // DECIMAL(10,2) - optional, may not exist in old DB
  nurse_id: string | null; // VARCHAR(100)
  created_at: string;
  updated_at: string;
}

export interface CreateShiftInput {
  shift_period?: string | null;
  route_no?: number | null;
  facility_id?: string | null; // VARCHAR(50)
  facility_name?: string | null;
  facility_address?: string | null;
  resident_count?: number | null;
  capacity?: number | null;
  required_time?: number | null;
  start_datetime: string; // DATE
  nurse_id?: string | null; // VARCHAR(100)
}

export type UpdateShiftInput = Partial<CreateShiftInput>;

export const getAllShifts = async () => {
  const [rows] = await db.query<ShiftRow[]>("SELECT * FROM shifts");
  return rows;
};

/**
 * ページネーション対応でシフトを取得
 */
export const getShiftsPaginated = async (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  filters?: {
    nurse_id?: string; // VARCHAR(100)
    facility_id?: string; // VARCHAR(50)
    shift_period?: string;
    date_from?: string;
    date_to?: string;
  }
) => {
  const offset = (page - 1) * limit;
  const validSortColumns = [
    "id",
    "nurse_id",
    "facility_id",
    "start_datetime",
    "created_at",
  ];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const order = sortOrder.toUpperCase() as "ASC" | "DESC";

  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.nurse_id) {
    whereClause += " AND nurse_id = ?";
    queryParams.push(filters.nurse_id);
  }
  if (filters?.facility_id) {
    whereClause += " AND facility_id = ?";
    queryParams.push(filters.facility_id);
  }
  if (filters?.shift_period) {
    whereClause += " AND shift_period = ?";
    queryParams.push(filters.shift_period);
  }
  if (filters?.date_from) {
    whereClause += " AND start_datetime >= ?";
    queryParams.push(filters.date_from);
  }
  if (filters?.date_to) {
    whereClause += " AND start_datetime <= ?";
    queryParams.push(filters.date_to);
  }

  // データ取得
  const [rows] = await db.query<ShiftRow[]>(
    `SELECT * FROM shifts WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  // 総件数取得
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM shifts WHERE ${whereClause}`,
    queryParams
  );
  const total = (countRows[0] as { count: number })?.count ?? 0;

  return { data: rows, total };
};

export const getShiftById = async (id: number) => {
  const [rows] = await db.query<ShiftRow[]>(
    "SELECT * FROM shifts WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createShift = async (data: CreateShiftInput) => {
  const {
    shift_period,
    route_no,
    facility_id,
    facility_name,
    facility_address,
    resident_count,
    capacity,
    required_time,
    start_datetime,
    nurse_id,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shifts (
      shift_period, route_no, facility_id,
      facility_name, facility_address, resident_count, capacity,
      required_time, start_datetime, nurse_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shift_period ?? null,
      route_no ?? null,
      facility_id ?? null,
      facility_name ?? null,
      facility_address ?? null,
      resident_count ?? null,
      capacity ?? null,
      required_time ?? null,
      start_datetime,
      nurse_id ?? null,
    ]
  );

  return getShiftById(result.insertId);
};

export const updateShift = async (id: number, data: UpdateShiftInput) => {
  const fields = Object.keys(data) as (keyof UpdateShiftInput)[];

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

