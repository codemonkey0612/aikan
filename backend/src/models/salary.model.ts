import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface SalaryRow extends RowDataPacket {
  id: number;
  user_id: number;
  year_month: string;
  amount: number | null;
  created_at: string;
}

export type SalaryInput = Omit<SalaryRow, "id" | "created_at">;

export const getAllSalaries = async () => {
  const [rows] = await db.query<SalaryRow[]>("SELECT * FROM nurse_salaries");
  return rows;
};

export const getSalaryById = async (id: number) => {
  const [rows] = await db.query<SalaryRow[]>(
    "SELECT * FROM nurse_salaries WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createSalary = async (data: SalaryInput) => {
  const { user_id, year_month, amount } = data;

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO nurse_salaries (user_id, year_month, amount)
     VALUES (?, ?, ?)`,
    [user_id, year_month, amount]
  );

  return getSalaryById(result.insertId);
};

export const updateSalary = async (
  id: number,
  data: Partial<SalaryInput>
) => {
  const fields = Object.keys(data) as (keyof SalaryInput)[];

  if (!fields.length) {
    return getSalaryById(id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE nurse_salaries SET ${setClause} WHERE id = ?`,
    [...values, id]
  );

  return getSalaryById(id);
};

export const deleteSalary = async (id: number) => {
  await db.query("DELETE FROM nurse_salaries WHERE id = ?", [id]);
};

