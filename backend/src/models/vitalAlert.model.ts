import { db } from "../config/db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type VitalAlertType =
  | "SYSTOLIC_BP"
  | "DIASTOLIC_BP"
  | "PULSE"
  | "TEMPERATURE"
  | "SPO2";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface VitalAlertRow extends RowDataPacket {
  id: number;
  resident_id: string; // VARCHAR(50) - references residents.resident_id
  alert_type: VitalAlertType;
  min_value: number | null;
  max_value: number | null;
  severity: AlertSeverity;
  active: number;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface VitalAlertTriggerRow extends RowDataPacket {
  id: number;
  vital_record_id: number;
  vital_alert_id: number;
  measured_value: number;
  triggered_at: string;
  acknowledged: number;
  acknowledged_by: number | null;
  acknowledged_at: string | null;
  notes: string | null;
}

export interface CreateVitalAlertInput {
  resident_id: string; // VARCHAR(50)
  alert_type: VitalAlertType;
  min_value?: number | null;
  max_value?: number | null;
  severity?: AlertSeverity;
  active?: boolean;
  created_by?: number | null;
}

export type UpdateVitalAlertInput = Partial<CreateVitalAlertInput>;

export const getAllVitalAlerts = async () => {
  const [rows] = await db.query<VitalAlertRow[]>(
    "SELECT * FROM vital_alerts WHERE active = 1 ORDER BY created_at DESC"
  );
  return rows;
};

export const getVitalAlertById = async (id: number) => {
  const [rows] = await db.query<VitalAlertRow[]>(
    "SELECT * FROM vital_alerts WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

export const getVitalAlertsByResident = async (resident_id: string) => {
  const [rows] = await db.query<VitalAlertRow[]>(
    "SELECT * FROM vital_alerts WHERE resident_id = ? AND active = 1 ORDER BY alert_type",
    [resident_id]
  );
  return rows;
};

export const createVitalAlert = async (data: CreateVitalAlertInput) => {
  const {
    resident_id,
    alert_type,
    min_value,
    max_value,
    severity,
    active,
    created_by,
  } = data;
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO vital_alerts 
     (resident_id, alert_type, min_value, max_value, severity, active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      resident_id,
      alert_type,
      min_value ?? null,
      max_value ?? null,
      severity ?? "MEDIUM",
      active !== undefined ? (active ? 1 : 0) : 1,
      created_by ?? null,
    ]
  );
  return getVitalAlertById(result.insertId);
};

export const updateVitalAlert = async (
  id: number,
  data: UpdateVitalAlertInput
) => {
  const fields = Object.keys(data) as (keyof UpdateVitalAlertInput)[];

  if (!fields.length) {
    return getVitalAlertById(id);
  }

  const setClause = fields.map((key) => {
    if (key === "active" && data[key] !== undefined) {
      return "active = ?";
    }
    return `${key} = ?`;
  }).join(", ");
  const values = fields.map((key) => {
    if (key === "active" && data[key] !== undefined) {
      return data[key] ? 1 : 0;
    }
    return data[key];
  });

  await db.query(
    `UPDATE vital_alerts SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return getVitalAlertById(id);
};

export const deleteVitalAlert = async (id: number) => {
  await db.query("DELETE FROM vital_alerts WHERE id = ?", [id]);
};

// Vital Alert Triggers
export const getVitalAlertTriggers = async (
  resident_id?: string, // VARCHAR(50)
  acknowledged?: boolean
) => {
  let query = "SELECT vat.*, va.resident_id, va.alert_type FROM vital_alert_triggers vat";
  query += " JOIN vital_alerts va ON vat.vital_alert_id = va.id";
  const conditions: string[] = [];
  const params: any[] = [];

  if (resident_id) {
    conditions.push("va.resident_id = ?");
    params.push(resident_id);
  }
  if (acknowledged !== undefined) {
    conditions.push("vat.acknowledged = ?");
    params.push(acknowledged ? 1 : 0);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY vat.triggered_at DESC";

  const [rows] = await db.query<VitalAlertTriggerRow[]>(query, params);
  return rows;
};

export const createVitalAlertTrigger = async (
  vital_record_id: number,
  vital_alert_id: number,
  measured_value: number
) => {
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO vital_alert_triggers 
     (vital_record_id, vital_alert_id, measured_value)
     VALUES (?, ?, ?)`,
    [vital_record_id, vital_alert_id, measured_value]
  );
  const [rows] = await db.query<VitalAlertTriggerRow[]>(
    "SELECT * FROM vital_alert_triggers WHERE id = ?",
    [result.insertId]
  );
  return rows[0] ?? null;
};

export const acknowledgeVitalAlertTrigger = async (
  id: number,
  acknowledged_by: number,
  notes?: string | null
) => {
  await db.query(
    `UPDATE vital_alert_triggers 
     SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = NOW(), notes = ?
     WHERE id = ?`,
    [acknowledged_by, notes ?? null, id]
  );
  const [rows] = await db.query<VitalAlertTriggerRow[]>(
    "SELECT * FROM vital_alert_triggers WHERE id = ?",
    [id]
  );
  return rows[0] ?? null;
};

