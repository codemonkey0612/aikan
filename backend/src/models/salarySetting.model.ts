import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface SalarySettingRow extends RowDataPacket {
  id: number;
  setting_key: string;
  setting_value: number;
  description: string | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSalarySettingInput {
  setting_key: string;
  setting_value: number;
  description?: string;
  updated_by?: number;
}

export interface UpdateSalarySettingInput {
  setting_value?: number;
  description?: string;
  updated_by?: number;
}

export const getAllSalarySettings = async () => {
  const [rows] = await db.query<SalarySettingRow[]>(
    "SELECT * FROM salary_settings ORDER BY setting_key"
  );
  return rows;
};

export const getSalarySettingByKey = async (setting_key: string) => {
  const [rows] = await db.query<SalarySettingRow[]>(
    "SELECT * FROM salary_settings WHERE setting_key = ?",
    [setting_key]
  );
  return rows[0] ?? null;
};

export const createSalarySetting = async (data: CreateSalarySettingInput) => {
  const { setting_key, setting_value, description, updated_by } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO salary_settings (setting_key, setting_value, description, updated_by)
     VALUES (?, ?, ?, ?)`,
    [setting_key, setting_value, description ?? null, updated_by ?? null]
  );

  return getSalarySettingByKey(setting_key);
};

export const updateSalarySetting = async (
  setting_key: string,
  data: UpdateSalarySettingInput
) => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.setting_value !== undefined) {
    fields.push("setting_value = ?");
    values.push(data.setting_value);
  }

  if (data.description !== undefined) {
    fields.push("description = ?");
    values.push(data.description);
  }

  if (data.updated_by !== undefined) {
    fields.push("updated_by = ?");
    values.push(data.updated_by);
  }

  if (fields.length === 0) {
    return getSalarySettingByKey(setting_key);
  }

  values.push(setting_key);

  await db.query(
    `UPDATE salary_settings SET ${fields.join(", ")} WHERE setting_key = ?`,
    values
  );

  return getSalarySettingByKey(setting_key);
};

export const deleteSalarySetting = async (setting_key: string) => {
  await db.query("DELETE FROM salary_settings WHERE setting_key = ?", [
    setting_key,
  ]);
};

