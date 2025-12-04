import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type MedicationStatus = "ACTIVE" | "DISCONTINUED" | "COMPLETED";

export interface MedicationNoteRow extends RowDataPacket {
  id: number;
  resident_id: string; // VARCHAR(50) - references residents.resident_id
  medication_name: string;
  dosage: string | null;
  frequency: string | null;
  route: string | null;
  start_date: string | null;
  end_date: string | null;
  prescribed_by: string | null;
  notes: string | null;
  status: MedicationStatus;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateMedicationNoteInput {
  resident_id: string; // VARCHAR(50)
  medication_name: string;
  dosage?: string | null;
  frequency?: string | null;
  route?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  prescribed_by?: string | null;
  notes?: string | null;
  status?: MedicationStatus;
  created_by?: number | null;
}

export type UpdateMedicationNoteInput = Partial<CreateMedicationNoteInput>;

export const getAllMedicationNotes = async () => {
  const [rows] = await db.query<MedicationNoteRow[]>(
    "SELECT * FROM medication_notes ORDER BY start_date DESC, created_at DESC"
  );
  return rows;
};

export const getMedicationNoteById = async (id: number) => {
  const [rows] = await db.query<MedicationNoteRow[]>(
    "SELECT * FROM medication_notes WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getMedicationNotesByResident = async (resident_id: string) => {
  const [rows] = await db.query<MedicationNoteRow[]>(
    "SELECT * FROM medication_notes WHERE resident_id = ? ORDER BY start_date DESC, created_at DESC",
    [resident_id]
  );
  return rows;
};

export const getActiveMedicationNotesByResident = async (
  resident_id: string
) => {
  const [rows] = await db.query<MedicationNoteRow[]>(
    "SELECT * FROM medication_notes WHERE resident_id = ? AND status = 'ACTIVE' ORDER BY start_date DESC",
    [resident_id]
  );
  return rows;
};

export const createMedicationNote = async (data: CreateMedicationNoteInput) => {
  const {
    resident_id,
    medication_name,
    dosage,
    frequency,
    route,
    start_date,
    end_date,
    prescribed_by,
    notes,
    status,
    created_by,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO medication_notes 
     (resident_id, medication_name, dosage, frequency, route, start_date, end_date, prescribed_by, notes, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      medication_name,
      dosage ?? null,
      frequency ?? null,
      route ?? null,
      start_date ?? null,
      end_date ?? null,
      prescribed_by ?? null,
      notes ?? null,
      status ?? "ACTIVE",
      created_by ?? null,
    ]
  );
  return getMedicationNoteById(result.insertId);
};

export const updateMedicationNote = async (
  id: number,
  data: UpdateMedicationNoteInput
) => {
  const fields = Object.keys(data) as (keyof UpdateMedicationNoteInput)[];

  if (!fields.length) {
    return getMedicationNoteById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE medication_notes SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getMedicationNoteById(id);
};

export const deleteMedicationNote = async (id: number) => {
  await db.query("DELETE FROM medication_notes WHERE id = ?", [id]);
};

