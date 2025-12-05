import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface NurseAvailabilityRow extends RowDataPacket {
  id: number;
  nurse_id: string;
  year_month: string; // "2025-12"
  availability_data: string; // JSON string
  status: "draft" | "submitted" | "approved";
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityData {
  [date: string]: {
    available: boolean;
    time_slots?: string[]; // ["09:00-12:00", "14:00-17:00"]
    notes?: string;
  };
}

export interface CreateNurseAvailabilityInput {
  nurse_id: string;
  year_month: string;
  availability_data: AvailabilityData;
  status?: "draft" | "submitted" | "approved";
}

export interface UpdateNurseAvailabilityInput {
  availability_data?: AvailabilityData;
  status?: "draft" | "submitted" | "approved";
}

export const getAllNurseAvailabilities = async (
  filters?: {
    nurse_id?: string;
    year_month?: string;
    status?: "draft" | "submitted" | "approved";
  }
) => {
  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.nurse_id) {
    whereClause += " AND nurse_id = ?";
    queryParams.push(filters.nurse_id);
  }
  if (filters?.year_month) {
    whereClause += " AND year_month = ?";
    queryParams.push(filters.year_month);
  }
  if (filters?.status) {
    whereClause += " AND status = ?";
    queryParams.push(filters.status);
  }

  const [rows] = await db.query<NurseAvailabilityRow[]>(
    `SELECT * FROM nurse_availability WHERE ${whereClause} ORDER BY year_month DESC, created_at DESC`,
    queryParams
  );

  return rows.map((row) => ({
    ...row,
    availability_data: JSON.parse(row.availability_data),
  }));
};

export const getNurseAvailabilityById = async (id: number) => {
  const [rows] = await db.query<NurseAvailabilityRow[]>(
    "SELECT * FROM nurse_availability WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    availability_data: JSON.parse(row.availability_data),
  };
};

export const getNurseAvailabilityByNurseAndMonth = async (
  nurse_id: string,
  year_month: string
) => {
  const [rows] = await db.query<NurseAvailabilityRow[]>(
    "SELECT * FROM nurse_availability WHERE nurse_id = ? AND year_month = ?",
    [nurse_id, year_month]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    availability_data: JSON.parse(row.availability_data),
  };
};

export const createNurseAvailability = async (
  data: CreateNurseAvailabilityInput
) => {
  const { nurse_id, year_month, availability_data, status = "draft" } = data;

  const submitted_at = status === "submitted" ? new Date() : null;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO nurse_availability (
      nurse_id, year_month, availability_data, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      nurse_id,
      year_month,
      JSON.stringify(availability_data),
      status,
      submitted_at,
    ]
  );

  return getNurseAvailabilityById(result.insertId);
};

export const updateNurseAvailability = async (
  id: number,
  data: UpdateNurseAvailabilityInput
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.availability_data !== undefined) {
    fields.push("availability_data = ?");
    values.push(JSON.stringify(data.availability_data));
  }

  if (data.status !== undefined) {
    fields.push("status = ?");
    values.push(data.status);
    if (data.status === "submitted") {
      fields.push("submitted_at = ?");
      values.push(new Date());
    }
  }

  if (fields.length === 0) {
    return getNurseAvailabilityById(id);
  }

  values.push(id);

  await db.query(
    `UPDATE nurse_availability SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getNurseAvailabilityById(id);
};

export const deleteNurseAvailability = async (id: number) => {
  await db.query("DELETE FROM nurse_availability WHERE id = ?", [id]);
};

