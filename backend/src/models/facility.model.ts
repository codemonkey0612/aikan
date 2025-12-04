import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export interface FacilityRow extends RowDataPacket {
  facility_id: string;
  facility_number: string | null;
  corporation_id: string | null;
  name: string;
  name_kana: string | null;
  postal_code: string | null;
  address_prefecture: string | null;
  address_city: string | null;
  address_building: string | null;
  latitude_longitude: string | null;
  phone_number: string | null;
  facility_status_id: string | null;
  pre_visit_contact_id: string | null;
  contact_type_id: string | null;
  building_type_id: string | null;
  pl_support_id: string | null;
  visit_notes: string | null;
  facility_notes: string | null;
  user_notes: string | null;
  map_document_url: string | null;
  billing_unit_price: number | null;
  billing_method_id: string | null;
  capacity: number | null;
  current_residents: number | null;
  nurse_id: string | null;
  visit_count: number | null;
  prefer_mon: boolean;
  prefer_tue: boolean;
  prefer_wed: boolean;
  prefer_thu: boolean;
  prefer_fri: boolean;
  time_mon: string | null;
  time_tue: string | null;
  time_wed: string | null;
  time_thu: string | null;
  time_fri: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFacilityInput {
  facility_id: string;
  facility_number?: string | null;
  corporation_id?: string | null;
  name: string;
  name_kana?: string | null;
  postal_code?: string | null;
  address_prefecture?: string | null;
  address_city?: string | null;
  address_building?: string | null;
  latitude_longitude?: string | null;
  phone_number?: string | null;
  facility_status_id?: string | null;
  pre_visit_contact_id?: string | null;
  contact_type_id?: string | null;
  building_type_id?: string | null;
  pl_support_id?: string | null;
  visit_notes?: string | null;
  facility_notes?: string | null;
  user_notes?: string | null;
  map_document_url?: string | null;
  billing_unit_price?: number | null;
  billing_method_id?: string | null;
  capacity?: number | null;
  current_residents?: number | null;
  nurse_id?: string | null;
  visit_count?: number | null;
  prefer_mon?: boolean;
  prefer_tue?: boolean;
  prefer_wed?: boolean;
  prefer_thu?: boolean;
  prefer_fri?: boolean;
  time_mon?: string | null;
  time_tue?: string | null;
  time_wed?: string | null;
  time_thu?: string | null;
  time_fri?: string | null;
}

export type UpdateFacilityInput = Partial<CreateFacilityInput>;

export const getAllFacilities = async () => {
  const [rows] = await db.query<FacilityRow[]>("SELECT * FROM facilities");
  return rows;
};

export const getFacilityById = async (facility_id: string) => {
  const [rows] = await db.query<FacilityRow[]>(
    "SELECT * FROM facilities WHERE facility_id = ?",
    [facility_id]
  );
  return rows[0] ?? null;
};

export const createFacility = async (data: CreateFacilityInput) => {
  const {
    facility_id,
    facility_number,
    corporation_id,
    name,
    name_kana,
    postal_code,
    address_prefecture,
    address_city,
    address_building,
    latitude_longitude,
    phone_number,
    facility_status_id,
    pre_visit_contact_id,
    contact_type_id,
    building_type_id,
    pl_support_id,
    visit_notes,
    user_notes,
    facility_notes,
    map_document_url,
    billing_unit_price,
    billing_method_id,
    capacity,
    current_residents,
    nurse_id,
    visit_count,
    prefer_mon = false,
    prefer_tue = false,
    prefer_wed = false,
    prefer_thu = false,
    prefer_fri = false,
    time_mon,
    time_tue,
    time_wed,
    time_thu,
    time_fri,
  } = data;

  await db.query<ResultSetHeader>(
    `INSERT INTO facilities (
      facility_id, facility_number, corporation_id, name, name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, phone_number,
      facility_status_id, pre_visit_contact_id,
      contact_type_id, building_type_id, pl_support_id,
      visit_notes, facility_notes, user_notes, map_document_url,
      billing_unit_price, billing_method_id,
      capacity, current_residents,
      nurse_id, visit_count,
      prefer_mon, prefer_tue, prefer_wed, prefer_thu, prefer_fri,
      time_mon, time_tue, time_wed, time_thu, time_fri
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      facility_id,
      facility_number ?? null,
      corporation_id ?? null,
      name,
      name_kana ?? null,
      postal_code ?? null,
      address_prefecture ?? null,
      address_city ?? null,
      address_building ?? null,
      latitude_longitude ?? null,
      phone_number ?? null,
      facility_status_id ?? null,
      pre_visit_contact_id ?? null,
      contact_type_id ?? null,
      building_type_id ?? null,
      pl_support_id ?? null,
      visit_notes ?? null,
      facility_notes ?? null,
      user_notes ?? null,
      map_document_url ?? null,
      billing_unit_price ?? null,
      billing_method_id ?? null,
      capacity ?? null,
      current_residents ?? null,
      nurse_id ?? null,
      visit_count ?? null,
      prefer_mon,
      prefer_tue,
      prefer_wed,
      prefer_thu,
      prefer_fri,
      time_mon ?? null,
      time_tue ?? null,
      time_wed ?? null,
      time_thu ?? null,
      time_fri ?? null,
    ]
  );
  return getFacilityById(facility_id);
};

export const updateFacility = async (
  facility_id: string,
  data: UpdateFacilityInput
) => {
  const fields = Object.keys(data) as (keyof UpdateFacilityInput)[];

  if (!fields.length) {
    return getFacilityById(facility_id);
  }

  const setClause = fields.map((field) => `${field} = ?`).join(", ");
  const values = fields.map((field) => data[field]);

  await db.query(
    `UPDATE facilities SET ${setClause} WHERE facility_id = ?`,
    [...values, facility_id]
  );
  return getFacilityById(facility_id);
};

export const deleteFacility = async (facility_id: string) => {
  await db.query("DELETE FROM facilities WHERE facility_id = ?", [facility_id]);
};

