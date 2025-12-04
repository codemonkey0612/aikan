import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface VisitRow extends RowDataPacket {
  id: number;
  shift_id: number;
  resident_id: string | null; // VARCHAR(50) - references residents.resident_id
  visited_at: string;
  note: string | null;
}

export type VisitInput = Omit<VisitRow, "id">;

export const getAllVisits = async () => {
  const [rows] = await db.query<VisitRow[]>("SELECT * FROM visits");
  return rows;
};

/**
 * ページネーション対応で訪問を取得
 */
export const getVisitsPaginated = async (
  page: number = 1,
  limit: number = 20,
  sortBy: string = "visited_at",
  sortOrder: "asc" | "desc" = "desc",
  filters?: {
    shift_id?: number;
    resident_id?: string; // VARCHAR(50)
    visited_from?: string;
    visited_to?: string;
  }
) => {
  const offset = (page - 1) * limit;
  const validSortColumns = ["id", "shift_id", "resident_id", "visited_at"];
  const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "visited_at";
  const order = sortOrder.toUpperCase() as "ASC" | "DESC";

  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.shift_id) {
    whereClause += " AND shift_id = ?";
    queryParams.push(filters.shift_id);
  }
  if (filters?.resident_id) {
    whereClause += " AND resident_id = ?";
    queryParams.push(filters.resident_id);
  }
  if (filters?.visited_from) {
    whereClause += " AND visited_at >= ?";
    queryParams.push(filters.visited_from);
  }
  if (filters?.visited_to) {
    whereClause += " AND visited_at <= ?";
    queryParams.push(filters.visited_to);
  }

  // データ取得
  const [rows] = await db.query<VisitRow[]>(
    `SELECT * FROM visits WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  // 総件数取得
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM visits WHERE ${whereClause}`,
    queryParams
  );
  const total = (countRows[0] as { count: number })?.count ?? 0;

  return { data: rows, total };
};

export const getVisitById = async (id: number) => {
  const [rows] = await db.query<VisitRow[]>(
    "SELECT * FROM visits WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createVisit = async (data: VisitInput) => {
  const { shift_id, resident_id, visited_at, note } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO visits (shift_id, resident_id, visited_at, note)
     VALUES (?, ?, ?, ?)`,
    [shift_id, resident_id, visited_at, note]
  );

  return getVisitById(result.insertId);
};

export const updateVisit = async (id: number, data: Partial<VisitInput>) => {
  const fields = Object.keys(data) as (keyof VisitInput)[];

  if (!fields.length) {
    return getVisitById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE visits SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getVisitById(id);
};

export const deleteVisit = async (id: number) => {
  await db.query("DELETE FROM visits WHERE id = ?", [id]);
};

