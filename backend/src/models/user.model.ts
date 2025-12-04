import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type UserRole = "admin" | "nurse" | "facility_manager" | "corporate_officer";

export interface UserRow extends RowDataPacket {
  id: number; // BIGINT UNSIGNED in DB, but number in TypeScript is fine
  role: UserRole;
  nurse_id: string | null;
  last_name: string;
  first_name: string;
  last_name_kana: string | null;
  first_name_kana: string | null;
  postal_code: string | null;
  address_prefecture: string | null;
  address_city: string | null;
  address_building: string | null;
  latitude_longitude: string | null;
  email: string;
  password: string;
  phone_number: string | null;
  user_photo_url: string | null;
  notes: string | null;
  position: string | null;
  alcohol_check: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  role?: UserRole;
  nurse_id?: string | null;
  last_name: string;
  first_name: string;
  last_name_kana?: string | null;
  first_name_kana?: string | null;
  postal_code?: string | null;
  address_prefecture?: string | null;
  address_city?: string | null;
  address_building?: string | null;
  latitude_longitude?: string | null;
  email: string;
  password: string;
  phone_number?: string | null;
  user_photo_url?: string | null;
  notes?: string | null;
  position?: string | null;
  alcohol_check?: boolean;
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
  const {
    role = "nurse",
    nurse_id,
    last_name,
    first_name,
    last_name_kana,
    first_name_kana,
    postal_code,
    address_prefecture,
    address_city,
    address_building,
    latitude_longitude,
    email,
    password,
    phone_number,
    user_photo_url,
    notes,
    position,
    alcohol_check = false,
  } = data;
  
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO users (
      role, nurse_id, last_name, first_name, last_name_kana, first_name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, email, password, phone_number,
      user_photo_url, notes, position, alcohol_check
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      role,
      nurse_id ?? null,
      last_name,
      first_name,
      last_name_kana ?? null,
      first_name_kana ?? null,
      postal_code ?? null,
      address_prefecture ?? null,
      address_city ?? null,
      address_building ?? null,
      latitude_longitude ?? null,
      email,
      password,
      phone_number ?? null,
      user_photo_url ?? null,
      notes ?? null,
      position ?? null,
      alcohol_check,
    ]
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
