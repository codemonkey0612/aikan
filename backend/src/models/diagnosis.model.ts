import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface DiagnosisRow extends RowDataPacket {
  id: number;
  resident_id: string; // VARCHAR(50) - references residents.resident_id
  diagnosis_code: string | null;
  diagnosis_name: string;
  diagnosis_date: string | null;
  severity: string | null;
  status: string;
  notes: string | null;
  diagnosed_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDiagnosisInput {
  resident_id: string; // VARCHAR(50)
  diagnosis_code?: string | null;
  diagnosis_name: string;
  diagnosis_date?: string | null;
  severity?: string | null;
  status?: string;
  notes?: string | null;
  diagnosed_by?: number | null;
}

export type UpdateDiagnosisInput = Partial<CreateDiagnosisInput>;

export const getAllDiagnoses = async () => {
  const [rows] = await db.query<DiagnosisRow[]>(
    "SELECT * FROM diagnoses ORDER BY diagnosis_date DESC, created_at DESC"
  );
  return rows;
};

export const getDiagnosisById = async (id: number) => {
  const [rows] = await db.query<DiagnosisRow[]>(
    "SELECT * FROM diagnoses WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getDiagnosesByResident = async (resident_id: string) => {
  const [rows] = await db.query<DiagnosisRow[]>(
    "SELECT * FROM diagnoses WHERE resident_id = ? ORDER BY diagnosis_date DESC, created_at DESC",
    [resident_id]
  );
  return rows;
};

export const createDiagnosis = async (data: CreateDiagnosisInput) => {
  const {
    resident_id,
    diagnosis_code,
    diagnosis_name,
    diagnosis_date,
    severity,
    status,
    notes,
    diagnosed_by,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO diagnoses 
     (resident_id, diagnosis_code, diagnosis_name, diagnosis_date, severity, status, notes, diagnosed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      diagnosis_code ?? null,
      diagnosis_name,
      diagnosis_date ?? null,
      severity ?? null,
      status ?? "ACTIVE",
      notes ?? null,
      diagnosed_by ?? null,
    ]
  );
  return getDiagnosisById(result.insertId);
};

export const updateDiagnosis = async (
  id: number,
  data: UpdateDiagnosisInput
) => {
  const fields = Object.keys(data) as (keyof UpdateDiagnosisInput)[];

  if (!fields.length) {
    return getDiagnosisById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE diagnoses SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getDiagnosisById(id);
};

export const deleteDiagnosis = async (id: number) => {
  await db.query("DELETE FROM diagnoses WHERE id = ?", [id]);
};

