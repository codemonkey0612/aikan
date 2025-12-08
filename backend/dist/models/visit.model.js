"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteVisit = exports.updateVisit = exports.createVisit = exports.getVisitById = exports.getVisitsPaginated = exports.getAllVisits = void 0;
const db_1 = require("../config/db");
const getAllVisits = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM visits");
    return rows;
};
exports.getAllVisits = getAllVisits;
/**
 * ページネーション対応で訪問を取得
 */
const getVisitsPaginated = async (page = 1, limit = 20, sortBy = "visited_at", sortOrder = "desc", filters) => {
    const offset = (page - 1) * limit;
    const validSortColumns = ["id", "shift_id", "resident_id", "visited_at"];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "visited_at";
    const order = sortOrder.toUpperCase();
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.shift_id) {
        whereClause += " AND shift_id = ?";
        queryParams.push(filters.shift_id);
    }
    if (filters?.resident_id) {
        whereClause += " AND resident_id = ?";
        queryParams.push(filters.resident_id);
    }
    if (filters?.visited_from) {
        whereClause += " AND visited_at >= ?";
        queryParams.push(filters.visited_from);
    }
    if (filters?.visited_to) {
        whereClause += " AND visited_at <= ?";
        queryParams.push(filters.visited_to);
    }
    // データ取得
    const [rows] = await db_1.db.query(`SELECT * FROM visits WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`, [...queryParams, limit, offset]);
    // 総件数取得
    const [countRows] = await db_1.db.query(`SELECT COUNT(*) as count FROM visits WHERE ${whereClause}`, queryParams);
    const total = countRows[0]?.count ?? 0;
    return { data: rows, total };
};
exports.getVisitsPaginated = getVisitsPaginated;
const getVisitById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM visits WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getVisitById = getVisitById;
const createVisit = async (data) => {
    const { shift_id, resident_id, visited_at, note } = data;
    const [result] = await db_1.db.query(`INSERT INTO visits (shift_id, resident_id, visited_at, note)
     VALUES (?, ?, ?, ?)`, [shift_id, resident_id, visited_at, note]);
    return (0, exports.getVisitById)(result.insertId);
};
exports.createVisit = createVisit;
const updateVisit = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getVisitById)(id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE visits SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getVisitById)(id);
};
exports.updateVisit = updateVisit;
const deleteVisit = async (id) => {
    await db_1.db.query("DELETE FROM visits WHERE id = ?", [id]);
};
exports.deleteVisit = deleteVisit;
