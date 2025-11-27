import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface UserRow extends RowDataPacket {
  id: number;
  role: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  active: number;
  created_at: string;
}

export interface CreateUserInput {
  role: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  password_hash?: string | null;
}

export type UpdateUserInput = Partial<CreateUserInput>;

export const getAllUsers = async () => {
  const [rows] = await db.query<UserRow[]>("SELECT * FROM users");
  return rows;
};

export const getUserById = async (id: number) => {
  const [rows] = await db.query<UserRow[]>(
    "SELECT * FROM users WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getUserByEmail = async (email: string) => {
  const [rows] = await db.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return rows[0] ?? null;
};

export const createUser = async (data: CreateUserInput) => {
  const { first_name, last_name, email, phone, role, password_hash } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO users (first_name, last_name, email, phone, role, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, email, phone, role, password_hash ?? null]
  );
  return getUserById(result.insertId);
};

export const updateUser = async (id: number, data: UpdateUserInput) => {
  const fields = Object.keys(data) as (keyof UpdateUserInput)[];

  if (!fields.length) {
    return getUserById(id);
  }

  const setClause = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => data[key]);

  await db.query(
    `UPDATE users SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getUserById(id);
};

export const deleteUser = async (id: number) => {
  await db.query("DELETE FROM users WHERE id = ?", [id]);
};
