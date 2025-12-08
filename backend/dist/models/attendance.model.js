"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttendance = exports.updateAttendance = exports.createAttendance = exports.getAttendanceByShiftAndUser = exports.getAttendanceByUserId = exports.getAttendanceByShiftId = exports.getAttendanceById = void 0;
const db_1 = require("../config/db");
const getAttendanceById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM attendance WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getAttendanceById = getAttendanceById;
const getAttendanceByShiftId = async (shift_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM attendance WHERE shift_id = ? ORDER BY created_at DESC", [shift_id]);
    return rows;
};
exports.getAttendanceByShiftId = getAttendanceByShiftId;
const getAttendanceByUserId = async (user_id, limit = 50) => {
    const [rows] = await db_1.db.query("SELECT * FROM attendance WHERE user_id = ? ORDER BY created_at DESC LIMIT ?", [user_id, limit]);
    return rows;
};
exports.getAttendanceByUserId = getAttendanceByUserId;
const getAttendanceByShiftAndUser = async (shift_id, user_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM attendance WHERE shift_id = ? AND user_id = ?", [shift_id, user_id]);
    return rows[0] ?? null;
};
exports.getAttendanceByShiftAndUser = getAttendanceByShiftAndUser;
const createAttendance = async (data) => {
    const { shift_id, user_id, check_in_at, check_in_lat, check_in_lng, check_in_status, check_in_pin, } = data;
    const [result] = await db_1.db.query(`INSERT INTO attendance 
     (shift_id, user_id, check_in_at, check_in_lat, check_in_lng, check_in_status, check_in_pin)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        shift_id,
        user_id,
        check_in_at ?? new Date().toISOString(),
        check_in_lat ?? null,
        check_in_lng ?? null,
        check_in_status ?? "PENDING",
        check_in_pin ?? null,
    ]);
    return (0, exports.getAttendanceById)(result.insertId);
};
exports.createAttendance = createAttendance;
const updateAttendance = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getAttendanceById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE attendance SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getAttendanceById)(id);
};
exports.updateAttendance = updateAttendance;
const deleteAttendance = async (id) => {
    await db_1.db.query("DELETE FROM attendance WHERE id = ?", [id]);
};
exports.deleteAttendance = deleteAttendance;
