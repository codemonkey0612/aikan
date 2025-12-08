"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeVitalAlertTrigger = exports.createVitalAlertTrigger = exports.getVitalAlertTriggers = exports.deleteVitalAlert = exports.updateVitalAlert = exports.createVitalAlert = exports.getVitalAlertsByResident = exports.getVitalAlertById = exports.getAllVitalAlerts = void 0;
const db_1 = require("../config/db");
const getAllVitalAlerts = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM vital_alerts WHERE active = 1 ORDER BY created_at DESC");
    return rows;
};
exports.getAllVitalAlerts = getAllVitalAlerts;
const getVitalAlertById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM vital_alerts WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getVitalAlertById = getVitalAlertById;
const getVitalAlertsByResident = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM vital_alerts WHERE resident_id = ? AND active = 1 ORDER BY alert_type", [resident_id]);
    return rows;
};
exports.getVitalAlertsByResident = getVitalAlertsByResident;
const createVitalAlert = async (data) => {
    const { resident_id, alert_type, min_value, max_value, severity, active, created_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO vital_alerts 
     (resident_id, alert_type, min_value, max_value, severity, active, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        alert_type,
        min_value ?? null,
        max_value ?? null,
        severity ?? "MEDIUM",
        active !== undefined ? (active ? 1 : 0) : 1,
        created_by ?? null,
    ]);
    return (0, exports.getVitalAlertById)(result.insertId);
};
exports.createVitalAlert = createVitalAlert;
const updateVitalAlert = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getVitalAlertById)(id);
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
    await db_1.db.query(`UPDATE vital_alerts SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getVitalAlertById)(id);
};
exports.updateVitalAlert = updateVitalAlert;
const deleteVitalAlert = async (id) => {
    await db_1.db.query("DELETE FROM vital_alerts WHERE id = ?", [id]);
};
exports.deleteVitalAlert = deleteVitalAlert;
// Vital Alert Triggers
const getVitalAlertTriggers = async (resident_id, // VARCHAR(50)
acknowledged) => {
    let query = "SELECT vat.*, va.resident_id, va.alert_type FROM vital_alert_triggers vat";
    query += " JOIN vital_alerts va ON vat.vital_alert_id = va.id";
    const conditions = [];
    const params = [];
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
    const [rows] = await db_1.db.query(query, params);
    return rows;
};
exports.getVitalAlertTriggers = getVitalAlertTriggers;
const createVitalAlertTrigger = async (vital_record_id, vital_alert_id, measured_value) => {
    const [result] = await db_1.db.query(`INSERT INTO vital_alert_triggers 
     (vital_record_id, vital_alert_id, measured_value)
     VALUES (?, ?, ?)`, [vital_record_id, vital_alert_id, measured_value]);
    const [rows] = await db_1.db.query("SELECT * FROM vital_alert_triggers WHERE id = ?", [result.insertId]);
    return rows[0] ?? null;
};
exports.createVitalAlertTrigger = createVitalAlertTrigger;
const acknowledgeVitalAlertTrigger = async (id, acknowledged_by, notes) => {
    await db_1.db.query(`UPDATE vital_alert_triggers 
     SET acknowledged = 1, acknowledged_by = ?, acknowledged_at = NOW(), notes = ?
     WHERE id = ?`, [acknowledged_by, notes ?? null, id]);
    const [rows] = await db_1.db.query("SELECT * FROM vital_alert_triggers WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.acknowledgeVitalAlertTrigger = acknowledgeVitalAlertTrigger;
