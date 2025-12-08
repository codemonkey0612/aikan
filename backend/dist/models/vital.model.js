"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVital = exports.updateVital = exports.createVital = exports.getVitalById = exports.getVitalsPaginated = exports.getAllVitals = void 0;
const db_1 = require("../config/db");
const getAllVitals = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM vital_records");
    return rows;
};
exports.getAllVitals = getAllVitals;
/**
 * ページネーション対応でバイタルを取得
 */
const getVitalsPaginated = async (page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc", filters) => {
    const offset = (page - 1) * limit;
    const validSortColumns = ["id", "resident_id", "measured_at", "created_at"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const order = sortOrder.toUpperCase();
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.resident_id) {
        whereClause += " AND resident_id = ?";
        queryParams.push(filters.resident_id);
    }
    if (filters?.measured_from) {
        whereClause += " AND measured_at >= ?";
        queryParams.push(filters.measured_from);
    }
    if (filters?.measured_to) {
        whereClause += " AND measured_at <= ?";
        queryParams.push(filters.measured_to);
    }
    if (filters?.created_by) {
        whereClause += " AND created_by = ?";
        queryParams.push(filters.created_by);
    }
    // データ取得
    const [rows] = await db_1.db.query(`SELECT * FROM vital_records WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`, [...queryParams, limit, offset]);
    // 総件数取得
    const [countRows] = await db_1.db.query(`SELECT COUNT(*) as count FROM vital_records WHERE ${whereClause}`, queryParams);
    const total = countRows[0]?.count ?? 0;
    return { data: rows, total };
};
exports.getVitalsPaginated = getVitalsPaginated;
const getVitalById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM vital_records WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getVitalById = getVitalById;
const createVital = async (data) => {
    const { resident_id, measured_at, systolic_bp, diastolic_bp, pulse, temperature, spo2, note, created_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO vital_records
    (resident_id, measured_at, systolic_bp, diastolic_bp, pulse, temperature, spo2, note, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        measured_at,
        systolic_bp,
        diastolic_bp,
        pulse,
        temperature,
        spo2,
        note,
        created_by,
    ]);
    return (0, exports.getVitalById)(result.insertId);
};
exports.createVital = createVital;
const updateVital = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getVitalById)(id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE vital_records SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getVitalById)(id);
};
exports.updateVital = updateVital;
const deleteVital = async (id) => {
    await db_1.db.query("DELETE FROM vital_records WHERE id = ?", [id]);
};
exports.deleteVital = deleteVital;
