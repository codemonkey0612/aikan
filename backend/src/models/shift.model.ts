import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface ShiftRow extends RowDataPacket {
  id: number;
  user_id: number;
  facility_id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  shift_type: string | null;
  created_at: string;
}

export type ShiftInput = Omit<ShiftRow, "id" | "created_at">;

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
    user_id?: number;
    facility_id?: number;
    date_from?: string;
    date_to?: string;
  }
) => {
  const offset = (page - 1) * limit;
  const validSortColumns = ["id", "user_id", "facility_id", "date", "created_at"];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
  const order = sortOrder.toUpperCase() as "ASC" | "DESC";

  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.user_id) {
    whereClause += " AND user_id = ?";
    queryParams.push(filters.user_id);
  }
  if (filters?.facility_id) {
    whereClause += " AND facility_id = ?";
    queryParams.push(filters.facility_id);
  }
  if (filters?.date_from) {
    whereClause += " AND date >= ?";
    queryParams.push(filters.date_from);
  }
  if (filters?.date_to) {
    whereClause += " AND date <= ?";
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

export const createShift = async (data: ShiftInput) => {
  const { user_id, facility_id, date, start_time, end_time, shift_type } =
    data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shifts (user_id, facility_id, date, start_time, end_time, shift_type)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, facility_id, date, start_time, end_time, shift_type]
  );

  return getShiftById(result.insertId);
};

export const updateShift = async (id: number, data: Partial<ShiftInput>) => {
  const fields = Object.keys(data) as (keyof ShiftInput)[];

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

