import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface SalaryRuleRow extends RowDataPacket {
  id: number;
  name: string;
  rule_type: string;
  condition_json: string | null; // JSON string
  calculation_formula: string | null;
  priority: number;
  active: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSalaryRuleInput {
  name: string;
  rule_type: string;
  condition_json?: string | null;
  calculation_formula?: string | null;
  priority?: number;
  active?: number;
}

export type UpdateSalaryRuleInput = Partial<CreateSalaryRuleInput>;

export const getAllSalaryRules = async () => {
  const [rows] = await db.query<SalaryRuleRow[]>(
    "SELECT * FROM salary_rules WHERE active = 1 ORDER BY priority DESC, rule_type, name"
  );
  return rows;
};

export const getSalaryRuleById = async (id: number) => {
  const [rows] = await db.query<SalaryRuleRow[]>(
    "SELECT * FROM salary_rules WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getSalaryRulesByType = async (rule_type: string) => {
  const [rows] = await db.query<SalaryRuleRow[]>(
    "SELECT * FROM salary_rules WHERE rule_type = ? AND active = 1 ORDER BY priority DESC",
    [rule_type]
  );
  return rows;
};

export const createSalaryRule = async (data: CreateSalaryRuleInput) => {
  const {
    name,
    rule_type,
    condition_json,
    calculation_formula,
    priority,
    active,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO salary_rules (name, rule_type, condition_json, calculation_formula, priority, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      name,
      rule_type,
      condition_json ?? null,
      calculation_formula ?? null,
      priority ?? 0,
      active ?? 1,
    ]
  );
  return getSalaryRuleById(result.insertId);
};

export const updateSalaryRule = async (
  id: number,
  data: UpdateSalaryRuleInput
) => {
  const fields = Object.keys(data) as (keyof UpdateSalaryRuleInput)[];

  if (!fields.length) {
    return getSalaryRuleById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE salary_rules SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getSalaryRuleById(id);
};

export const deleteSalaryRule = async (id: number) => {
  await db.query("DELETE FROM salary_rules WHERE id = ?", [id]);
};

