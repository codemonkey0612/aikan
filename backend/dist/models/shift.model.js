"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShift = exports.updateShift = exports.createShift = exports.getShiftById = exports.getShiftsPaginated = exports.getAllShifts = void 0;
const db_1 = require("../config/db");
const getAllShifts = async () => {
    const [rows] = await db_1.db.query(`SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))`);
    return rows;
};
exports.getAllShifts = getAllShifts;
/**
 * ページネーション対応でシフトを取得
 */
const getShiftsPaginated = async (page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc", filters) => {
    const offset = (page - 1) * limit;
    const validSortColumns = [
        "id",
        "nurse_id",
        "facility_id",
        "start_datetime",
        "created_at",
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const order = sortOrder.toUpperCase();
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.nurse_id) {
        // Normalize nurse_id for comparison (handle whitespace and newlines)
        // Use CAST to ensure string comparison, match the pattern used in JOIN clause
        whereClause += " AND TRIM(REPLACE(REPLACE(CAST(s.nurse_id AS CHAR), '\r', ''), '\n', '')) = ?";
        const normalizedNurseId = String(filters.nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
        queryParams.push(normalizedNurseId);
    }
    if (filters?.facility_id) {
        whereClause += " AND facility_id = ?";
        queryParams.push(filters.facility_id);
    }
    if (filters?.shift_period) {
        whereClause += " AND shift_period = ?";
        queryParams.push(filters.shift_period);
    }
    // Handle date filtering - use DATE() function for simple date comparison
    if (filters?.date_from && filters?.date_to) {
        const dateFromOnly = filters.date_from.split(' ')[0];
        const dateToOnly = filters.date_to.split(' ')[0];
        // If both dates are the same, use DATE() function for exact match
        if (dateFromOnly === dateToOnly) {
            whereClause += " AND DATE(s.start_datetime) = ?";
            queryParams.push(dateFromOnly);
        }
        else {
            // Date range
            whereClause += " AND DATE(s.start_datetime) >= ? AND DATE(s.start_datetime) <= ?";
            queryParams.push(dateFromOnly);
            queryParams.push(dateToOnly);
        }
    }
    else if (filters?.date_from) {
        whereClause += " AND DATE(s.start_datetime) >= ?";
        queryParams.push(filters.date_from.split(' ')[0]);
    }
    else if (filters?.date_to) {
        whereClause += " AND DATE(s.start_datetime) <= ?";
        queryParams.push(filters.date_to.split(' ')[0]);
    }
    // データ取得
    // facilitiesテーブルとJOINしてfacility_nameを取得
    // TRIMとREPLACEで改行文字を除去してから比較
    const [rows] = await db_1.db.query(`SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))
    WHERE ${whereClause} 
    ORDER BY ${sortColumn} ${order} 
    LIMIT ? OFFSET ?`, [...queryParams, limit, offset]);
    // 総件数取得
    // Replace s. prefix in whereClause for count query (since it doesn't use alias)
    // Also replace DATE(s.start_datetime) with DATE(start_datetime) for count query
    const countWhereClause = whereClause.replace(/s\./g, '');
    const [countRows] = await db_1.db.query(`SELECT COUNT(*) as count FROM shifts WHERE ${countWhereClause}`, queryParams);
    const total = countRows[0]?.count ?? 0;
    return { data: rows, total };
};
exports.getShiftsPaginated = getShiftsPaginated;
const getShiftById = async (id) => {
    const [rows] = await db_1.db.query(`SELECT 
      s.id, 
      s.shift_period, 
      s.route_no, 
      CAST(s.facility_id AS CHAR) as facility_id, 
      COALESCE(f.name, s.facility_name) as facility_name, 
      s.facility_address, 
      s.resident_count, 
      s.capacity, 
      s.required_time, 
      s.start_datetime, 
      s.end_datetime, 
      CAST(s.nurse_id AS CHAR) as nurse_id, 
      s.distance_km, 
      s.created_at, 
      s.updated_at 
    FROM shifts s
    LEFT JOIN facilities f ON TRIM(REPLACE(REPLACE(CAST(s.facility_id AS CHAR), '\r', ''), '\n', '')) = TRIM(REPLACE(REPLACE(CAST(f.facility_id AS CHAR), '\r', ''), '\n', ''))
    WHERE s.id = ?`, [id]);
    return rows[0] ?? null;
};
exports.getShiftById = getShiftById;
// Helper function to convert ISO datetime string to MySQL DATETIME format
const formatDateTimeForMySQL = (datetime) => {
    if (!datetime)
        return null;
    try {
        // If it's already in MySQL format (YYYY-MM-DD HH:MM:SS), return as is
        if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(datetime)) {
            return datetime;
        }
        // Convert ISO string to MySQL DATETIME format
        const date = new Date(datetime);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid datetime: ${datetime}`);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    catch (error) {
        throw new Error(`Failed to format datetime: ${datetime}`);
    }
};
const createShift = async (data) => {
    const { shift_period, route_no, facility_id, facility_name, facility_address, resident_count, capacity, required_time, start_datetime, end_datetime, nurse_id, } = data;
    // Validate and format datetime
    if (!start_datetime) {
        throw new Error("start_datetime is required");
    }
    const formattedStartDatetime = formatDateTimeForMySQL(start_datetime);
    const formattedEndDatetime = formatDateTimeForMySQL(end_datetime);
    const [result] = await db_1.db.query(`INSERT INTO shifts (
      shift_period, route_no, facility_id,
      facility_name, facility_address, resident_count, capacity,
      required_time, start_datetime, end_datetime, nurse_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        shift_period ?? null,
        route_no ?? null,
        facility_id ?? null,
        facility_name ?? null,
        facility_address ?? null,
        resident_count ?? null,
        capacity ?? null,
        required_time ?? null,
        formattedStartDatetime,
        formattedEndDatetime,
        nurse_id ?? null,
    ]);
    return (0, exports.getShiftById)(result.insertId);
};
exports.createShift = createShift;
const updateShift = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getShiftById)(id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE shifts SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getShiftById)(id);
};
exports.updateShift = updateShift;
const deleteShift = async (id) => {
    await db_1.db.query("DELETE FROM shifts WHERE id = ?", [id]);
};
exports.deleteShift = deleteShift;
