import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface SalaryRow extends RowDataPacket {
  id: number;
  user_id: number;
  nurse_id: string | null;
  year_month: string;
  total_amount: number;
  distance_pay: number;
  time_pay: number;
  vital_pay: number;
  total_distance_km: number;
  total_minutes: number;
  total_vital_count: number;
  calculation_details: string | null; // JSON string
  calculated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalaryInput {
  user_id: number;
  nurse_id?: string;
  year_month: string;
  total_amount: number;
  distance_pay: number;
  time_pay: number;
  vital_pay: number;
  total_distance_km: number;
  total_minutes: number;
  total_vital_count: number;
  calculation_details?: any; // Will be JSON stringified
}

export const getAllSalaries = async (filters?: {
  user_id?: number;
  nurse_id?: string;
  year_month?: string;
}) => {
  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.user_id) {
    whereClause += " AND user_id = ?";
    queryParams.push(filters.user_id);
  }
  if (filters?.nurse_id) {
    whereClause += " AND nurse_id = ?";
    queryParams.push(filters.nurse_id);
  }
  if (filters?.year_month) {
    whereClause += " AND year_month = ?";
    queryParams.push(filters.year_month);
  }

  const [rows] = await db.query<SalaryRow[]>(
    `SELECT * FROM nurse_salaries WHERE ${whereClause} ORDER BY year_month DESC, created_at DESC`,
    queryParams
  );

  return rows.map((row) => {
    let calculationDetails = null;
    if (row.calculation_details) {
      try {
        // Handle both JSON type (already parsed) and TEXT type (needs parsing)
        calculationDetails = typeof row.calculation_details === 'string' 
          ? JSON.parse(row.calculation_details) 
          : row.calculation_details;
      } catch (e) {
        calculationDetails = null;
      }
    }
    return {
      ...row,
      calculation_details: calculationDetails,
    };
  });
};

export const getSalaryById = async (id: number) => {
  const [rows] = await db.query<SalaryRow[]>(
    "SELECT * FROM nurse_salaries WHERE id = ?",
    [id]
  );
  if (rows.length === 0) return null;

  const row = rows[0];
  let calculationDetails = null;
  if (row.calculation_details) {
    try {
      calculationDetails = typeof row.calculation_details === 'string' 
        ? JSON.parse(row.calculation_details) 
        : row.calculation_details;
    } catch (e) {
      calculationDetails = null;
    }
  }
  return {
    ...row,
    calculation_details: calculationDetails,
  };
};

export const getSalaryByNurseAndMonth = async (
  nurse_id: string,
  year_month: string
) => {
  const [rows] = await db.query<SalaryRow[]>(
    "SELECT * FROM nurse_salaries WHERE nurse_id = ? AND year_month = ?",
    [nurse_id, year_month]
  );
  if (rows.length === 0) return null;

  const row = rows[0];
  let calculationDetails = null;
  if (row.calculation_details) {
    try {
      calculationDetails = typeof row.calculation_details === 'string' 
        ? JSON.parse(row.calculation_details) 
        : row.calculation_details;
    } catch (e) {
      calculationDetails = null;
    }
  }
  return {
    ...row,
    calculation_details: calculationDetails,
  };
};

export const createSalary = async (data: SalaryInput) => {
  const {
    user_id,
    nurse_id,
    year_month,
    total_amount,
    distance_pay,
    time_pay,
    vital_pay,
    total_distance_km,
    total_minutes,
    total_vital_count,
    calculation_details,
  } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO nurse_salaries (
      user_id, nurse_id, year_month, total_amount,
      distance_pay, time_pay, vital_pay,
      total_distance_km, total_minutes, total_vital_count,
      calculation_details, calculated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      user_id,
      nurse_id ?? null,
      year_month,
      total_amount,
      distance_pay,
      time_pay,
      vital_pay,
      total_distance_km,
      total_minutes,
      total_vital_count,
      calculation_details ? JSON.stringify(calculation_details) : null,
    ]
  );

  return getSalaryById(result.insertId);
};

export const updateSalary = async (
  id: number,
  data: Partial<SalaryInput>
) => {
  const fields: string[] = [];
  const values: any[] = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (key === "calculation_details") {
        fields.push("calculation_details = ?");
        values.push(JSON.stringify(value));
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
  });

  if (fields.length === 0) {
    return getSalaryById(id);
  }

  values.push(id);

  await db.query(
    `UPDATE nurse_salaries SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getSalaryById(id);
};

export const deleteSalary = async (id: number) => {
  await db.query("DELETE FROM nurse_salaries WHERE id = ?", [id]);
};

