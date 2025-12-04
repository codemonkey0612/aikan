import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface VitalRow extends RowDataPacket {
  id: number;
  resident_id: string; // VARCHAR(50) - references residents.resident_id
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

/**
 * ページネーション対応でバイタルを取得
 */
export const getVitalsPaginated = async (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "created_at",
  sortOrder: "asc" | "desc" = "desc",
  filters?: {
    resident_id?: string; // VARCHAR(50)
    measured_from?: string;
    measured_to?: string;
    created_by?: number;
  }
) => {
  const offset = (page - 1) * limit;
  const validSortColumns = ["id", "resident_id", "measured_at", "created_at"];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const order = sortOrder.toUpperCase() as "ASC" | "DESC";

  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.resident_id) {
    whereClause += " AND resident_id = ?";
    queryParams.push(filters.resident_id);
  }
  if (filters?.measured_from) {
    whereClause += " AND measured_at >= ?";
    queryParams.push(filters.measured_from);
  }
  if (filters?.measured_to) {
    whereClause += " AND measured_at <= ?";
    queryParams.push(filters.measured_to);
  }
  if (filters?.created_by) {
    whereClause += " AND created_by = ?";
    queryParams.push(filters.created_by);
  }

  // データ取得
  const [rows] = await db.query<VitalRow[]>(
    `SELECT * FROM vital_records WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  // 総件数取得
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM vital_records WHERE ${whereClause}`,
    queryParams
  );
  const total = (countRows[0] as { count: number })?.count ?? 0;

  return { data: rows, total };
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

