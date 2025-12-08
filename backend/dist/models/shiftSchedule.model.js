"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShiftSchedule = exports.updateShiftSchedule = exports.createShiftSchedule = exports.getLatestShiftScheduleByNurse = exports.getShiftScheduleByNurseAndMonth = exports.getShiftScheduleById = exports.getAllShiftSchedules = void 0;
const db_1 = require("../config/db");
const getAllShiftSchedules = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_schedules");
    return rows;
};
exports.getAllShiftSchedules = getAllShiftSchedules;
const getShiftScheduleById = async (shift_schedule_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_schedules WHERE shift_schedule_id = ?", [shift_schedule_id]);
    return rows[0] ?? null;
};
exports.getShiftScheduleById = getShiftScheduleById;
const getShiftScheduleByNurseAndMonth = async (nurse_id, // VARCHAR(100)
year_month // CHAR(7)
) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_schedules WHERE nurse_id = ? AND year_month = ?", [nurse_id, year_month]);
    return rows[0] ?? null;
};
exports.getShiftScheduleByNurseAndMonth = getShiftScheduleByNurseAndMonth;
const getLatestShiftScheduleByNurse = async (nurse_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_schedules WHERE nurse_id = ? AND is_latest = TRUE ORDER BY year_month DESC LIMIT 1", [nurse_id]);
    return rows[0] ?? null;
};
exports.getLatestShiftScheduleByNurse = getLatestShiftScheduleByNurse;
const createShiftSchedule = async (data) => {
    const { year_month, nurse_id, shift_list, is_latest = false } = data;
    // Convert shift_list to JSON string if it's an object
    const shiftListJson = typeof shift_list === "string" ? shift_list : JSON.stringify(shift_list);
    const [result] = await db_1.db.query(`INSERT INTO shift_schedules (year_month, nurse_id, shift_list, is_latest)
     VALUES (?, ?, ?, ?)`, [year_month, nurse_id, shiftListJson, is_latest]);
    return (0, exports.getShiftScheduleById)(result.insertId);
};
exports.createShiftSchedule = createShiftSchedule;
const updateShiftSchedule = async (shift_schedule_id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getShiftScheduleById)(shift_schedule_id);
    }
    // Handle shift_list conversion if present
    const processedData = { ...data };
    if (processedData.shift_list && typeof processedData.shift_list === "object") {
        processedData.shift_list = JSON.stringify(processedData.shift_list);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => processedData[field]);
    await db_1.db.query(`UPDATE shift_schedules SET ${setClause} WHERE shift_schedule_id = ?`, [...values, shift_schedule_id]);
    return (0, exports.getShiftScheduleById)(shift_schedule_id);
};
exports.updateShiftSchedule = updateShiftSchedule;
const deleteShiftSchedule = async (shift_schedule_id) => {
    await db_1.db.query("DELETE FROM shift_schedules WHERE shift_schedule_id = ?", [shift_schedule_id]);
};
exports.deleteShiftSchedule = deleteShiftSchedule;
