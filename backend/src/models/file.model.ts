import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type FileCategory =
  | "RESIDENT_IMAGE"
  | "PROFILE_AVATAR"
  | "SHIFT_REPORT"
  | "SALARY_STATEMENT"
  | "CARE_NOTE_ATTACHMENT";

export interface FileRow extends RowDataPacket {
  id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: string | null;
  category: FileCategory;
  entity_type: string;
  entity_id: number;
  uploaded_by: number | null;
  created_at: string;
}

export interface CreateFileInput {
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type?: string | null;
  category: FileCategory;
  entity_type: string;
  entity_id: number;
  uploaded_by?: number | null;
}

export type UpdateFileInput = Partial<
  Omit<CreateFileInput, "file_name" | "file_path" | "file_type" | "file_size">
>;

export const getAllFiles = async () => {
  const [rows] = await db.query<FileRow[]>(
    "SELECT * FROM files ORDER BY created_at DESC"
  );
  return rows;
};

export const getFileById = async (id: number) => {
  const [rows] = await db.query<FileRow[]>(
    "SELECT * FROM files WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getFilesByEntity = async (
  entity_type: string,
  entity_id: number
) => {
  const [rows] = await db.query<FileRow[]>(
    "SELECT * FROM files WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC",
    [entity_type, entity_id]
  );
  return rows;
};

export const getFilesByCategory = async (category: FileCategory) => {
  const [rows] = await db.query<FileRow[]>(
    "SELECT * FROM files WHERE category = ? ORDER BY created_at DESC",
    [category]
  );
  return rows;
};

export const createFile = async (data: CreateFileInput) => {
  const {
    file_name,
    original_name,
    file_path,
    file_type,
    file_size,
    mime_type,
    category,
    entity_type,
    entity_id,
    uploaded_by,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO files 
     (file_name, original_name, file_path, file_type, file_size, mime_type, category, entity_type, entity_id, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      file_name,
      original_name,
      file_path,
      file_type,
      file_size,
      mime_type ?? null,
      category,
      entity_type,
      entity_id,
      uploaded_by ?? null,
    ]
  );
  return getFileById(result.insertId);
};

export const updateFile = async (id: number, data: UpdateFileInput) => {
  const fields = Object.keys(data) as (keyof UpdateFileInput)[];

  if (!fields.length) {
    return getFileById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE files SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getFileById(id);
};

export const deleteFile = async (id: number) => {
  await db.query("DELETE FROM files WHERE id = ?", [id]);
};

