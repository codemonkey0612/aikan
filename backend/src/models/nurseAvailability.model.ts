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
    whereClause += " AND TRIM(REPLACE(REPLACE(`nurse_id`, '\\r', ''), '\\n', '')) = ?";
    queryParams.push(filters.nurse_id.trim());
  }
  if (filters?.year_month) {
    whereClause += " AND `year_month` = ?";
    queryParams.push(filters.year_month);
  }
  if (filters?.status) {
    whereClause += " AND `status` = ?";
    queryParams.push(filters.status);
  }

  const [rows] = await db.query<NurseAvailabilityRow[]>(
    `SELECT * FROM \`nurse_availability\` WHERE ${whereClause} ORDER BY \`year_month\` DESC, \`created_at\` DESC`,
    queryParams
  );

  return rows.map((row) => {
    let availabilityData = null;
    if (row.availability_data) {
      try {
        availabilityData = typeof row.availability_data === 'string' 
          ? JSON.parse(row.availability_data) 
          : row.availability_data;
      } catch (e) {
        availabilityData = null;
      }
    }
    return {
      ...row,
      availability_data: availabilityData,
    };
  });
};

export const getNurseAvailabilityById = async (id: number) => {
  const [rows] = await db.query<NurseAvailabilityRow[]>(
    "SELECT * FROM `nurse_availability` WHERE `id` = ?",
    [id]
  );

  if (rows.length === 0) return null;

  const row = rows[0];
  let availabilityData = null;
  if (row.availability_data) {
    try {
      availabilityData = typeof row.availability_data === 'string' 
        ? JSON.parse(row.availability_data) 
        : row.availability_data;
    } catch (e) {
      availabilityData = null;
    }
  }
  return {
    ...row,
    availability_data: availabilityData,
  };
};

export const getNurseAvailabilityByNurseAndMonth = async (
  nurse_id: string,
  year_month: string
) => {
  // Trim and normalize parameters
  const normalizedNurseId = nurse_id?.trim();
  const normalizedYearMonth = year_month?.trim();
  
  console.log("Querying nurse_availability with:", { 
    original: { nurse_id, year_month },
    normalized: { normalizedNurseId, normalizedYearMonth }
  });
  
  // Diagnostic: Check database connection and table existence
  try {
    const [dbCheck] = await db.query<RowDataPacket[]>("SELECT DATABASE() as db_name");
    console.log("Current database:", dbCheck[0]?.db_name);
    
    const [tableCheck] = await db.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM `nurse_availability`"
    );
    console.log("Total rows in nurse_availability table:", tableCheck[0]?.count);
    
    // Check what nurse_ids exist
    const [nurseIds] = await db.query<RowDataPacket[]>(
      "SELECT DISTINCT `nurse_id` FROM `nurse_availability` LIMIT 10"
    );
    console.log("Sample nurse_ids in table:", nurseIds.map(r => r.nurse_id));
    
    // Check what year_months exist for this nurse_id (using REPLACE + TRIM to handle \r characters)
    const [yearMonths] = await db.query<RowDataPacket[]>(
      "SELECT DISTINCT `year_month` FROM `nurse_availability` WHERE TRIM(REPLACE(REPLACE(`nurse_id`, '\\r', ''), '\\n', '')) = ? LIMIT 10",
      [normalizedNurseId]
    );
    console.log("Year months for nurse_id", normalizedNurseId, ":", yearMonths.map(r => r.year_month));
  } catch (diagError: any) {
    console.error("Diagnostic query error:", diagError.message);
  }
  
  // Also try a query to see what exists in the database (using REPLACE + TRIM to handle \r characters)
  const [allRows] = await db.query<NurseAvailabilityRow[]>(
    "SELECT `nurse_id`, `year_month` FROM `nurse_availability` WHERE TRIM(REPLACE(REPLACE(`nurse_id`, '\\r', ''), '\\n', '')) = ? LIMIT 5",
    [normalizedNurseId]
  );
  console.log("Sample rows for this nurse_id:", allRows.map(r => ({ 
    nurse_id: r.nurse_id, 
    year_month: r.year_month,
    match: r.nurse_id?.trim() === normalizedNurseId && r.year_month === normalizedYearMonth
  })));
  
  // Use REPLACE to remove \r and \n, then TRIM to handle whitespace
  // This handles cases where nurse_id has carriage returns
  const [rows] = await db.query<NurseAvailabilityRow[]>(
    "SELECT * FROM `nurse_availability` WHERE TRIM(REPLACE(REPLACE(`nurse_id`, '\\r', ''), '\\n', '')) = ? AND `year_month` = ?",
    [normalizedNurseId, normalizedYearMonth]
  );

  console.log("Query result:", { 
    rowCount: rows.length, 
    firstRow: rows[0] ? {
      id: rows[0].id,
      nurse_id: rows[0].nurse_id,
      year_month: rows[0].year_month,
      hasData: !!rows[0].availability_data
    } : null
  });

  if (rows.length === 0) {
    console.log("No rows found for nurse_id:", normalizedNurseId, "year_month:", normalizedYearMonth);
    return null;
  }

  const row = rows[0];
  let availabilityData = null;
  if (row.availability_data) {
    try {
      availabilityData = typeof row.availability_data === 'string' 
        ? JSON.parse(row.availability_data) 
        : row.availability_data;
      console.log("Parsed availability_data, keys:", Object.keys(availabilityData || {}));
    } catch (e) {
      console.error("Error parsing availability_data:", e);
      availabilityData = null;
    }
  }
  
  const result = {
    ...row,
    availability_data: availabilityData,
  };
  
  console.log("Returning result with availability_data keys:", availabilityData ? Object.keys(availabilityData) : "null");
  return result;
};

export const createNurseAvailability = async (
  data: CreateNurseAvailabilityInput
) => {
  const { nurse_id, year_month, availability_data, status = "draft" } = data;

  const submitted_at = status === "submitted" ? new Date() : null;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO \`nurse_availability\` (
      \`nurse_id\`, \`year_month\`, \`availability_data\`, \`status\`, \`submitted_at\`
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
    fields.push("`availability_data` = ?");
    values.push(JSON.stringify(data.availability_data));
  }

  if (data.status !== undefined) {
    fields.push("`status` = ?");
    values.push(data.status);
    if (data.status === "submitted") {
      fields.push("`submitted_at` = ?");
      values.push(new Date());
    }
  }

  if (fields.length === 0) {
    return getNurseAvailabilityById(id);
  }

  values.push(id);

  await db.query(
    `UPDATE \`nurse_availability\` SET ${fields.join(", ")} WHERE \`id\` = ?`,
    values
  );

  return getNurseAvailabilityById(id);
};

export const deleteNurseAvailability = async (id: number) => {
  await db.query("DELETE FROM `nurse_availability` WHERE `id` = ?", [id]);
};

