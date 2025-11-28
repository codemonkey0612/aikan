import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface OptionMasterRow extends RowDataPacket {
  id: number;
  category: string;
  code: string;
  label: string;
  value: string | null;
  display_order: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOptionMasterInput {
  category: string;
  code: string;
  label: string;
  value?: string | null;
  display_order?: number;
  active?: number;
}

export type UpdateOptionMasterInput = Partial<CreateOptionMasterInput>;

export const getAllOptionMasters = async () => {
  const [rows] = await db.query<OptionMasterRow[]>(
    "SELECT * FROM option_master WHERE active = 1 ORDER BY category, display_order, code"
  );
  return rows;
};

export const getOptionMasterByCategory = async (category: string) => {
  const [rows] = await db.query<OptionMasterRow[]>(
    "SELECT * FROM option_master WHERE category = ? AND active = 1 ORDER BY display_order, code",
    [category]
  );
  return rows;
};

export const getOptionMasterById = async (id: number) => {
  const [rows] = await db.query<OptionMasterRow[]>(
    "SELECT * FROM option_master WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createOptionMaster = async (data: CreateOptionMasterInput) => {
  const { category, code, label, value, display_order, active } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO option_master (category, code, label, value, display_order, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [category, code, label, value ?? null, display_order ?? 0, active ?? 1]
  );
  return getOptionMasterById(result.insertId);
};

export const updateOptionMaster = async (
  id: number,
  data: UpdateOptionMasterInput
) => {
  const fields = Object.keys(data) as (keyof UpdateOptionMasterInput)[];

  if (!fields.length) {
    return getOptionMasterById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE option_master SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getOptionMasterById(id);
};

export const deleteOptionMaster = async (id: number) => {
  await db.query("DELETE FROM option_master WHERE id = ?", [id]);
};

