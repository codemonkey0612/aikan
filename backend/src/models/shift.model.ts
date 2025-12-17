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
  start_datetime: string; // DATETIME
  end_datetime?: string | null; // DATETIME - optional
  nurse_id?: string | null; // VARCHAR(100)
}

export type UpdateShiftInput = Partial<CreateShiftInput>;

export const getAllShifts = async () => {
  const [rows] = await db.query<ShiftRow[]>(
    `SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))`
  );
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
    // Normalize nurse_id for comparison (handle whitespace and newlines)
    // Use CAST to ensure string comparison, match the pattern used in JOIN clause
    whereClause += " AND TRIM(REPLACE(REPLACE(CAST(s.nurse_id AS CHAR), '\r', ''), '\n', '')) = ?";
    const normalizedNurseId = String(filters.nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
    queryParams.push(normalizedNurseId);
  }
  if (filters?.facility_id) {
    whereClause += " AND facility_id = ?";
    queryParams.push(filters.facility_id);
  }
  if (filters?.shift_period) {
    whereClause += " AND shift_period = ?";
    queryParams.push(filters.shift_period);
  }
  // Handle date filtering - use DATE() function for simple date comparison
  // Ensure we only use the date part (YYYY-MM-DD) and handle timezone correctly
  if (filters?.date_from && filters?.date_to) {
    // Extract only the date part (YYYY-MM-DD) from the filter strings
    const dateFromOnly = filters.date_from.split(' ')[0].split('T')[0];
    const dateToOnly = filters.date_to.split(' ')[0].split('T')[0];
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFromOnly) || !/^\d{4}-\d{2}-\d{2}$/.test(dateToOnly)) {
      console.error('Invalid date format in filters:', { date_from: filters.date_from, date_to: filters.date_to });
    }
    
    // If both dates are the same, use DATE() function for exact match
    // DATE() function extracts the date part from DATETIME in the server's timezone
    if (dateFromOnly === dateToOnly) {
      whereClause += " AND DATE(s.start_datetime) = ?";
      queryParams.push(dateFromOnly);
      console.log('Date filter (exact match):', dateFromOnly);
    } else {
      // Date range
      whereClause += " AND DATE(s.start_datetime) >= ? AND DATE(s.start_datetime) <= ?";
      queryParams.push(dateFromOnly);
      queryParams.push(dateToOnly);
      console.log('Date filter (range):', dateFromOnly, 'to', dateToOnly);
    }
  } else if (filters?.date_from) {
    const dateFromOnly = filters.date_from.split(' ')[0].split('T')[0];
    whereClause += " AND DATE(s.start_datetime) >= ?";
    queryParams.push(dateFromOnly);
    console.log('Date filter (from):', dateFromOnly);
  } else if (filters?.date_to) {
    const dateToOnly = filters.date_to.split(' ')[0].split('T')[0];
    whereClause += " AND DATE(s.start_datetime) <= ?";
    queryParams.push(dateToOnly);
    console.log('Date filter (to):', dateToOnly);
  }

  // データ取得
  // facilitiesテーブルとJOINしてfacility_nameを取得
  // TRIMとREPLACEで改行文字を除去してから比較
  const [rows] = await db.query<ShiftRow[]>(
    `SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))
    WHERE ${whereClause} 
    ORDER BY ${sortColumn} ${order} 
    LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  // 総件数取得
  // Replace s. prefix in whereClause for count query (since it doesn't use alias)
  // Also replace DATE(s.start_datetime) with DATE(start_datetime) for count query
  const countWhereClause = whereClause.replace(/s\./g, '');
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM shifts WHERE ${countWhereClause}`,
    queryParams
  );
  const total = (countRows[0] as { count: number })?.count ?? 0;

  return { data: rows, total };
};

export const getShiftById = async (id: number) => {
  const [rows] = await db.query<ShiftRow[]>(
    `SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))
    WHERE s.id = ?`,
    [id]
  );
  return rows[0] ?? null;
};

// Helper function to convert ISO datetime string to MySQL DATETIME format
const formatDateTimeForMySQL = (datetime: string | null | undefined): string | null => {
  if (!datetime) return null;
  try {
    // If it's already in MySQL format (YYYY-MM-DD HH:MM:SS), return as is
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
      return datetime;
    }
    // Convert ISO string to MySQL DATETIME format
    const date = new Date(datetime);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid datetime: ${datetime}`);
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    throw new Error(`Failed to format datetime: ${datetime}`);
  }
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
    end_datetime,
    nurse_id,
  } = data;

  // Validate and format datetime
  if (!start_datetime) {
    throw new Error("start_datetime is required");
  }

  const formattedStartDatetime = formatDateTimeForMySQL(start_datetime);
  const formattedEndDatetime = formatDateTimeForMySQL(end_datetime);

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO shifts (
      shift_period, route_no, facility_id,
      facility_name, facility_address, resident_count, capacity,
      required_time, start_datetime, end_datetime, nurse_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      shift_period ?? null,
      route_no ?? null,
      facility_id ?? null,
      facility_name ?? null,
      facility_address ?? null,
      resident_count ?? null,
      capacity ?? null,
      required_time ?? null,
      formattedStartDatetime,
      formattedEndDatetime,
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

