import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface CorporationRow extends RowDataPacket {
  corporation_id: string;
  corporation_number: string | null;
  name: string;
  name_kana: string | null;
  postal_code: string | null;
  address_prefecture: string | null;
  address_city: string | null;
  address_building: string | null;
  latitude_longitude: string | null;
  phone_number: string | null;
  contact_email: string | null;
  billing_unit_price: number | null;
  billing_method_id: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCorporationInput {
  corporation_id: string;
  corporation_number?: string | null;
  name: string;
  name_kana?: string | null;
  postal_code?: string | null;
  address_prefecture?: string | null;
  address_city?: string | null;
  address_building?: string | null;
  latitude_longitude?: string | null;
  phone_number?: string | null;
  contact_email?: string | null;
  billing_unit_price?: number | null;
  billing_method_id?: string | null;
  photo_url?: string | null;
  notes?: string | null;
}

export type UpdateCorporationInput = Partial<CreateCorporationInput>;

export const getAllCorporations = async () => {
  const [rows] = await db.query<CorporationRow[]>("SELECT * FROM corporations");
  return rows;
};

export const getCorporationById = async (corporation_id: string) => {
  const [rows] = await db.query<CorporationRow[]>(
    "SELECT * FROM corporations WHERE corporation_id = ?",
    [corporation_id]
  );
  return rows[0] ?? null;
};

export const getCorporationByNumber = async (corporation_number: string) => {
  const [rows] = await db.query<CorporationRow[]>(
    "SELECT * FROM corporations WHERE corporation_number = ?",
    [corporation_number]
  );
  return rows[0] ?? null;
};

export const createCorporation = async (data: CreateCorporationInput) => {
  const {
    corporation_id,
    corporation_number,
    name,
    name_kana,
    postal_code,
    address_prefecture,
    address_city,
    address_building,
    latitude_longitude,
    phone_number,
    contact_email,
    billing_unit_price,
    billing_method_id,
    photo_url,
    notes,
  } = data;

  await db.query<ResultSetHeader>(
    `INSERT INTO corporations (
      corporation_id, corporation_number, name, name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, phone_number, contact_email,
      billing_unit_price, billing_method_id, photo_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      corporation_id,
      corporation_number ?? null,
      name,
      name_kana ?? null,
      postal_code ?? null,
      address_prefecture ?? null,
      address_city ?? null,
      address_building ?? null,
      latitude_longitude ?? null,
      phone_number ?? null,
      contact_email ?? null,
      billing_unit_price ?? null,
      billing_method_id ?? null,
      photo_url ?? null,
      notes ?? null,
    ]
  );
  return getCorporationById(corporation_id);
};

export const updateCorporation = async (
  corporation_id: string,
  data: UpdateCorporationInput
) => {
  const fields = Object.keys(data) as (keyof UpdateCorporationInput)[];

  if (!fields.length) {
    return getCorporationById(corporation_id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE corporations SET ${setClause} WHERE corporation_id = ?`,
    [...values, corporation_id]
  );
  return getCorporationById(corporation_id);
};

export const deleteCorporation = async (corporation_id: string) => {
  await db.query("DELETE FROM corporations WHERE corporation_id = ?", [corporation_id]);
};



