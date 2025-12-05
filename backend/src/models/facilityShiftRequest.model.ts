import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface FacilityShiftRequestRow extends RowDataPacket {
  id: number;
  facility_id: string;
  year_month: string; // "2025-12"
  request_data: string; // JSON string
  status: "draft" | "submitted" | "scheduled";
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestData {
  [date: string]: {
    time_slots: string[]; // ["15:00-20:00"]
    required_nurses?: number;
    notes?: string;
  };
}

export interface CreateFacilityShiftRequestInput {
  facility_id: string;
  year_month: string;
  request_data: RequestData;
  status?: "draft" | "submitted" | "scheduled";
}

export interface UpdateFacilityShiftRequestInput {
  request_data?: RequestData;
  status?: "draft" | "submitted" | "scheduled";
}

export const getAllFacilityShiftRequests = async (
  filters?: {
    facility_id?: string;
    year_month?: string;
    status?: "draft" | "submitted" | "scheduled";
  }
) => {
  let whereClause = "1=1";
  const queryParams: any[] = [];

  if (filters?.facility_id) {
    whereClause += " AND facility_id = ?";
    queryParams.push(filters.facility_id);
  }
  if (filters?.year_month) {
    whereClause += " AND year_month = ?";
    queryParams.push(filters.year_month);
  }
  if (filters?.status) {
    whereClause += " AND status = ?";
    queryParams.push(filters.status);
  }

  const [rows] = await db.query<FacilityShiftRequestRow[]>(
    `SELECT * FROM facility_shift_requests WHERE ${whereClause} ORDER BY year_month DESC, created_at DESC`,
    queryParams
  );

  return rows.map((row) => ({
    ...row,
    request_data: JSON.parse(row.request_data),
  }));
};

export const getFacilityShiftRequestById = async (id: number) => {
  const [rows] = await db.query<FacilityShiftRequestRow[]>(
    "SELECT * FROM facility_shift_requests WHERE id = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    request_data: JSON.parse(row.request_data),
  };
};

export const getFacilityShiftRequestByFacilityAndMonth = async (
  facility_id: string,
  year_month: string
) => {
  const [rows] = await db.query<FacilityShiftRequestRow[]>(
    "SELECT * FROM facility_shift_requests WHERE facility_id = ? AND year_month = ?",
    [facility_id, year_month]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  return {
    ...row,
    request_data: JSON.parse(row.request_data),
  };
};

export const createFacilityShiftRequest = async (
  data: CreateFacilityShiftRequestInput
) => {
  const { facility_id, year_month, request_data, status = "draft" } = data;

  const submitted_at = status === "submitted" ? new Date() : null;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO facility_shift_requests (
      facility_id, year_month, request_data, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?)`,
    [facility_id, year_month, JSON.stringify(request_data), status, submitted_at]
  );

  return getFacilityShiftRequestById(result.insertId);
};

export const updateFacilityShiftRequest = async (
  id: number,
  data: UpdateFacilityShiftRequestInput
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.request_data !== undefined) {
    fields.push("request_data = ?");
    values.push(JSON.stringify(data.request_data));
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
    return getFacilityShiftRequestById(id);
  }

  values.push(id);

  await db.query(
    `UPDATE facility_shift_requests SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return getFacilityShiftRequestById(id);
};

export const deleteFacilityShiftRequest = async (id: number) => {
  await db.query("DELETE FROM facility_shift_requests WHERE id = ?", [id]);
};

