"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteResident = exports.updateResident = exports.createResident = exports.getResidentById = exports.getAllResidents = void 0;
const db_1 = require("../config/db");
const getAllResidents = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM residents");
    return rows;
};
exports.getAllResidents = getAllResidents;
const getResidentById = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM residents WHERE resident_id = ?", [resident_id]);
    return rows[0] ?? null;
};
exports.getResidentById = getResidentById;
const createResident = async (data) => {
    const { resident_id, user_id, status_id, facility_id, last_name, first_name, last_name_kana, first_name_kana, phone_number, admission_date, effective_date, discharge_date, is_excluded = false, notes, } = data;
    await db_1.db.query(`INSERT INTO residents (
      resident_id, user_id, status_id, facility_id, last_name, first_name,
      last_name_kana, first_name_kana, phone_number,
      admission_date, effective_date, discharge_date,
      is_excluded, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        user_id ?? null,
        status_id ?? null,
        facility_id ?? null,
        last_name,
        first_name,
        last_name_kana ?? null,
        first_name_kana ?? null,
        phone_number ?? null,
        admission_date ?? null,
        effective_date ?? null,
        discharge_date ?? null,
        is_excluded,
        notes ?? null,
    ]);
    return (0, exports.getResidentById)(resident_id);
};
exports.createResident = createResident;
const updateResident = async (resident_id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getResidentById)(resident_id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE residents SET ${setClause} WHERE resident_id = ?`, [...values, resident_id]);
    return (0, exports.getResidentById)(resident_id);
};
exports.updateResident = updateResident;
const deleteResident = async (resident_id) => {
    await db_1.db.query("DELETE FROM residents WHERE resident_id = ?", [resident_id]);
};
exports.deleteResident = deleteResident;
