"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAlcoholCheck = exports.updateAlcoholCheck = exports.createAlcoholCheck = exports.getAlcoholChecksByUser = exports.getAlcoholCheckById = exports.getAllAlcoholChecks = void 0;
const db_1 = require("../config/db");
const getAllAlcoholChecks = async () => {
    const [rows] = await db_1.db.query(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    ORDER BY ac.checked_at DESC
  `);
    return rows;
};
exports.getAllAlcoholChecks = getAllAlcoholChecks;
const getAlcoholCheckById = async (id) => {
    const [rows] = await db_1.db.query(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    WHERE ac.id = ?
  `, [id]);
    return rows[0] ?? null;
};
exports.getAlcoholCheckById = getAlcoholCheckById;
const getAlcoholChecksByUser = async (user_id) => {
    const [rows] = await db_1.db.query(`
    SELECT ac.*, 
           u.first_name as user_first_name, 
           u.last_name as user_last_name,
           u.email as user_email,
           r.first_name as resident_first_name,
           r.last_name as resident_last_name,
           cb.first_name as checked_by_first_name,
           cb.last_name as checked_by_last_name
    FROM alcohol_checks ac
    LEFT JOIN users u ON ac.user_id = u.id
    LEFT JOIN residents r ON ac.resident_id = r.resident_id
    LEFT JOIN users cb ON ac.checked_by = cb.id
    WHERE ac.user_id = ?
    ORDER BY ac.checked_at DESC
  `, [user_id]);
    return rows;
};
exports.getAlcoholChecksByUser = getAlcoholChecksByUser;
const createAlcoholCheck = async (data) => {
    const { user_id, resident_id, breath_alcohol_concentration, checked_at, device_image_path, notes, checked_by, } = data;
    const [result] = await db_1.db.query(`
    INSERT INTO alcohol_checks (
      user_id, resident_id, breath_alcohol_concentration, 
      checked_at, device_image_path, notes, checked_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
        user_id,
        resident_id || null,
        breath_alcohol_concentration,
        checked_at,
        device_image_path || null,
        notes || null,
        checked_by || null,
    ]);
    return (0, exports.getAlcoholCheckById)(result.insertId);
};
exports.createAlcoholCheck = createAlcoholCheck;
const updateAlcoholCheck = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getAlcoholCheckById)(id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE alcohol_checks SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getAlcoholCheckById)(id);
};
exports.updateAlcoholCheck = updateAlcoholCheck;
const deleteAlcoholCheck = async (id) => {
    await db_1.db.query("DELETE FROM alcohol_checks WHERE id = ?", [id]);
};
exports.deleteAlcoholCheck = deleteAlcoholCheck;
