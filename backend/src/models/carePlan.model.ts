import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type CarePlanStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type CarePlanPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CarePlanRow extends RowDataPacket {
  id: number;
  resident_id: string; // VARCHAR(50) - references residents.resident_id
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: CarePlanStatus;
  priority: CarePlanPriority;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CarePlanItemRow extends RowDataPacket {
  id: number;
  care_plan_id: number;
  task_description: string;
  frequency: string | null;
  assigned_to: number | null;
  completed: number;
  completed_at: string | null;
  completed_by: number | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCarePlanInput {
  resident_id: string; // VARCHAR(50)
  title: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  status?: CarePlanStatus;
  priority?: CarePlanPriority;
  created_by?: number | null;
}

export interface CreateCarePlanItemInput {
  care_plan_id: number;
  task_description: string;
  frequency?: string | null;
  assigned_to?: number | null;
  due_date?: string | null;
}

export type UpdateCarePlanInput = Partial<CreateCarePlanInput>;
export type UpdateCarePlanItemInput = Partial<
  Omit<CreateCarePlanItemInput, "care_plan_id">
> & {
  completed?: boolean;
  completed_by?: number | null;
};

export const getAllCarePlans = async () => {
  const [rows] = await db.query<CarePlanRow[]>(
    "SELECT * FROM care_plans ORDER BY start_date DESC, created_at DESC"
  );
  return rows;
};

export const getCarePlanById = async (id: number) => {
  const [rows] = await db.query<CarePlanRow[]>(
    "SELECT * FROM care_plans WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getCarePlansByResident = async (resident_id: string) => {
  const [rows] = await db.query<CarePlanRow[]>(
    "SELECT * FROM care_plans WHERE resident_id = ? ORDER BY start_date DESC, created_at DESC",
    [resident_id]
  );
  return rows;
};

export const createCarePlan = async (data: CreateCarePlanInput) => {
  const {
    resident_id,
    title,
    description,
    start_date,
    end_date,
    status,
    priority,
    created_by,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO care_plans 
     (resident_id, title, description, start_date, end_date, status, priority, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      title,
      description ?? null,
      start_date,
      end_date ?? null,
      status ?? "ACTIVE",
      priority ?? "MEDIUM",
      created_by ?? null,
    ]
  );
  return getCarePlanById(result.insertId);
};

export const updateCarePlan = async (
  id: number,
  data: UpdateCarePlanInput
) => {
  const fields = Object.keys(data) as (keyof UpdateCarePlanInput)[];

  if (!fields.length) {
    return getCarePlanById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE care_plans SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getCarePlanById(id);
};

export const deleteCarePlan = async (id: number) => {
  await db.query("DELETE FROM care_plans WHERE id = ?", [id]);
};

// Care Plan Items
export const getCarePlanItems = async (care_plan_id: number) => {
  const [rows] = await db.query<CarePlanItemRow[]>(
    "SELECT * FROM care_plan_items WHERE care_plan_id = ? ORDER BY due_date ASC, created_at ASC",
    [care_plan_id]
  );
  return rows;
};

export const getCarePlanItemById = async (id: number) => {
  const [rows] = await db.query<CarePlanItemRow[]>(
    "SELECT * FROM care_plan_items WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const createCarePlanItem = async (data: CreateCarePlanItemInput) => {
  const { care_plan_id, task_description, frequency, assigned_to, due_date } =
    data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO care_plan_items 
     (care_plan_id, task_description, frequency, assigned_to, due_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      care_plan_id,
      task_description,
      frequency ?? null,
      assigned_to ?? null,
      due_date ?? null,
    ]
  );
  return getCarePlanItemById(result.insertId);
};

export const updateCarePlanItem = async (
  id: number,
  data: UpdateCarePlanItemInput
) => {
  const fields = Object.keys(data) as (keyof UpdateCarePlanItemInput)[];

  if (!fields.length) {
    return getCarePlanItemById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => {
    if (key === "completed" && data[key] !== undefined) {
      return data[key] ? 1 : 0;
    }
    return data[key];
  });

  // completedがtrueの場合、completed_atを設定
  if (data.completed) {
    const completedAtIndex = fields.indexOf("completed_at" as any);
    if (completedAtIndex === -1) {
      fields.push("completed_at" as any);
      values.push(new Date().toISOString());
    }
  } else if (data.completed === false) {
    // completedがfalseの場合、completed_atをクリア
    const completedAtIndex = fields.indexOf("completed_at" as any);
    if (completedAtIndex === -1) {
      fields.push("completed_at" as any);
      values.push(null);
    }
  }

  await db.query(
    `UPDATE care_plan_items SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getCarePlanItemById(id);
};

export const deleteCarePlanItem = async (id: number) => {
  await db.query("DELETE FROM care_plan_items WHERE id = ?", [id]);
};

