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
  climax: "very_good" | "good" | "average" | "not_very_good" | "very_bad" | null;
  food: "sufficient" | "almost_sufficient" | "half_sufficient" | "not_much" | "almost_none" | null;
  sleep: "sufficient" | "almost_sufficient" | "slightly_insufficient" | "considerably_insufficient" | "very_insufficient" | null;
  note: string | null;
  created_by: number | null;
  created_at: string;
}

export type VitalInput = Omit<VitalRow, "id" | "created_at">;

export const getAllVitals = async () => {
  const [rawRows] = await db.query<any[]>("SELECT * FROM vital_records");
  
  // Map database columns (schema.sql) to interface fields
  return rawRows.map((row: any) => ({
    id: row.id,
    resident_id: row.resident_id,
    temperature: row.body_temperature ?? null,
    pulse: row.pulse_measurement ?? null,
    systolic_bp: row.highest_blood_pressure ?? null,
    diastolic_bp: row.lowest_blood_pressure ?? null,
    spo2: row.oxidant_saturation ?? null,
    climax: row.climax ?? null,
    food: row.food ?? null,
    sleep: row.sleep ?? null,
    note: row.notes ?? null,
    created_by: row.nurse_id ? parseInt(row.nurse_id) : null,
    measured_at: row.created_at ?? null, // Use created_at as measured_at
    created_at: row.created_at,
  })) as VitalRow[];
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
  // Map sortBy to actual database column names (schema.sql)
  const sortColumnMap: Record<string, string> = {
    "id": "id",
    "resident_id": "resident_id",
    "measured_at": "created_at", // measured_at maps to created_at in schema.sql
    "created_at": "created_at",
  };
  const dbSortColumn = sortColumnMap[sortBy] || "created_at";
  const order = sortOrder.toUpperCase() as "ASC" | "DESC";

  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.resident_id) {
    whereClause += " AND resident_id = ?";
    queryParams.push(filters.resident_id);
  }
  if (filters?.measured_from) {
    // measured_at maps to created_at in schema.sql
    whereClause += " AND created_at >= ?";
    queryParams.push(filters.measured_from);
  }
  if (filters?.measured_to) {
    // measured_at maps to created_at in schema.sql
    whereClause += " AND created_at <= ?";
    queryParams.push(filters.measured_to);
  }
  if (filters?.created_by) {
    // created_by maps to nurse_id in schema.sql
    whereClause += " AND nurse_id = ?";
    queryParams.push(String(filters.created_by));
  }

  // データ取得 - Map database columns to interface fields
  const [rawRows] = await db.query<any[]>(
    `SELECT * FROM vital_records WHERE ${whereClause} ORDER BY ${dbSortColumn} ${order} LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );
  
  // Map database columns (schema.sql) to interface fields
  const rows: VitalRow[] = rawRows.map((row: any) => ({
    id: row.id,
    resident_id: row.resident_id,
    temperature: row.body_temperature ?? null,
    pulse: row.pulse_measurement ?? null,
    systolic_bp: row.highest_blood_pressure ?? null,
    diastolic_bp: row.lowest_blood_pressure ?? null,
    spo2: row.oxidant_saturation ?? null,
    climax: row.climax ?? null,
    food: row.food ?? null,
    sleep: row.sleep ?? null,
    note: row.notes ?? null,
    created_by: row.nurse_id ? parseInt(row.nurse_id) : null,
    measured_at: row.created_at ?? null, // Use created_at as measured_at
    created_at: row.created_at,
  }));

  // 総件数取得
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM vital_records WHERE ${whereClause}`,
    queryParams
  );
  const total = (countRows[0] as { count: number })?.count ?? 0;

  return { data: rows, total };
};

export const getVitalById = async (id: number) => {
  const [rawRows] = await db.query<any[]>(
    "SELECT * FROM vital_records WHERE id = ?",
    [id]
  );
  
  if (!rawRows[0]) return null;
  
  const row = rawRows[0];
  return {
    id: row.id,
    resident_id: row.resident_id,
    temperature: row.body_temperature ?? null,
    pulse: row.pulse_measurement ?? null,
    systolic_bp: row.highest_blood_pressure ?? null,
    diastolic_bp: row.lowest_blood_pressure ?? null,
    spo2: row.oxidant_saturation ?? null,
    climax: row.climax ?? null,
    food: row.food ?? null,
    sleep: row.sleep ?? null,
    note: row.notes ?? null,
    created_by: row.nurse_id ? parseInt(row.nurse_id) : null,
    measured_at: row.created_at ?? null, // Use created_at as measured_at
    created_at: row.created_at,
  } as VitalRow;
};

export const createVital = async (data: VitalInput) => {
  const {
    resident_id,
    systolic_bp,
    diastolic_bp,
    pulse,
    temperature,
    spo2,
    climax,
    food,
    sleep,
    note,
    created_by,
  } = data;

  // Map interface fields to database columns (schema.sql)
  // Note: measured_at is not in schema.sql, we use created_at (auto-set by DB)
  // created_by (number) maps to nurse_id (VARCHAR(100))
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO vital_records
    (resident_id, body_temperature, pulse_measurement, highest_blood_pressure, lowest_blood_pressure, oxidant_saturation, climax, food, sleep, notes, nurse_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      temperature,
      pulse,
      systolic_bp,
      diastolic_bp,
      spo2,
      climax,
      food,
      sleep,
      note,
      created_by ? String(created_by) : null, // Convert number to string for nurse_id
    ]
  );

  return getVitalById(result.insertId);
};

export const updateVital = async (id: number, data: Partial<VitalInput>) => {
  const fields = Object.keys(data) as (keyof VitalInput)[];

  if (!fields.length) {
    return getVitalById(id);
  }

  // Map interface field names to database column names (schema.sql)
  const columnMap: Record<string, string> = {
    temperature: 'body_temperature',
    pulse: 'pulse_measurement',
    systolic_bp: 'highest_blood_pressure',
    diastolic_bp: 'lowest_blood_pressure',
    spo2: 'oxidant_saturation',
    climax: 'climax',
    food: 'food',
    sleep: 'sleep',
    note: 'notes',
    created_by: 'nurse_id',
    // measured_at is not in schema.sql, skip it
  };

  const setClause = fields
    .filter(field => field !== 'measured_at') // Skip measured_at as it's not in DB
    .map((field) => {
      const dbColumn = columnMap[field] || field;
      return `${dbColumn} = ?`;
    })
    .join(", ");
  
  const values = fields
    .filter(field => field !== 'measured_at')
    .map((field) => {
      const value = data[field];
      // Convert created_by (number) to nurse_id (string) if needed
      if (field === 'created_by' && value !== null) {
        return String(value);
      }
      return value;
    });

  if (setClause) {
    await db.query(
      `UPDATE vital_records SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
  }

  return getVitalById(id);
};

export const deleteVital = async (id: number) => {
  await db.query("DELETE FROM vital_records WHERE id = ?", [id]);
};

