"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFacilityShiftRequest = exports.updateFacilityShiftRequest = exports.createFacilityShiftRequest = exports.getFacilityShiftRequestByFacilityAndMonth = exports.getFacilityShiftRequestById = exports.getAllFacilityShiftRequests = void 0;
const db_1 = require("../config/db");
const getAllFacilityShiftRequests = async (filters) => {
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.facility_id) {
        whereClause += " AND `facility_id` = ?";
        queryParams.push(filters.facility_id);
    }
    if (filters?.year_month) {
        whereClause += " AND `year_month` = ?";
        queryParams.push(filters.year_month);
    }
    if (filters?.status) {
        whereClause += " AND `status` = ?";
        queryParams.push(filters.status);
    }
    const [rows] = await db_1.db.query(`SELECT * FROM \`facility_shift_requests\` WHERE ${whereClause} ORDER BY \`year_month\` DESC, \`created_at\` DESC`, queryParams);
    return rows.map((row) => {
        let requestData = null;
        if (row.request_data) {
            try {
                // Handle both JSON type (already parsed) and TEXT type (needs parsing)
                requestData = typeof row.request_data === 'string'
                    ? JSON.parse(row.request_data)
                    : row.request_data;
            }
            catch (e) {
                requestData = null;
            }
        }
        return {
            ...row,
            request_data: requestData,
        };
    });
};
exports.getAllFacilityShiftRequests = getAllFacilityShiftRequests;
const getFacilityShiftRequestById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM `facility_shift_requests` WHERE `id` = ?", [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    let requestData = null;
    if (row.request_data) {
        try {
            requestData = typeof row.request_data === 'string'
                ? JSON.parse(row.request_data)
                : row.request_data;
        }
        catch (e) {
            requestData = null;
        }
    }
    return {
        ...row,
        request_data: requestData,
    };
};
exports.getFacilityShiftRequestById = getFacilityShiftRequestById;
const getFacilityShiftRequestByFacilityAndMonth = async (facility_id, year_month) => {
    const [rows] = await db_1.db.query("SELECT * FROM `facility_shift_requests` WHERE `facility_id` = ? AND `year_month` = ?", [facility_id, year_month]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    let requestData = null;
    if (row.request_data) {
        try {
            requestData = typeof row.request_data === 'string'
                ? JSON.parse(row.request_data)
                : row.request_data;
        }
        catch (e) {
            requestData = null;
        }
    }
    return {
        ...row,
        request_data: requestData,
    };
};
exports.getFacilityShiftRequestByFacilityAndMonth = getFacilityShiftRequestByFacilityAndMonth;
const createFacilityShiftRequest = async (data) => {
    const { facility_id, year_month, request_data, status = "draft" } = data;
    const submitted_at = status === "submitted" ? new Date() : null;
    const [result] = await db_1.db.query(`INSERT INTO \`facility_shift_requests\` (
      \`facility_id\`, \`year_month\`, \`request_data\`, \`status\`, \`submitted_at\`
    ) VALUES (?, ?, ?, ?, ?)`, [facility_id, year_month, JSON.stringify(request_data), status, submitted_at]);
    return (0, exports.getFacilityShiftRequestById)(result.insertId);
};
exports.createFacilityShiftRequest = createFacilityShiftRequest;
const updateFacilityShiftRequest = async (id, data) => {
    const fields = [];
    const values = [];
    if (data.request_data !== undefined) {
        fields.push("`request_data` = ?");
        values.push(JSON.stringify(data.request_data));
    }
    if (data.status !== undefined) {
        fields.push("`status` = ?");
        values.push(data.status);
        if (data.status === "submitted") {
            fields.push("`submitted_at` = ?");
            values.push(new Date());
        }
    }
    if (fields.length === 0) {
        return (0, exports.getFacilityShiftRequestById)(id);
    }
    values.push(id);
    await db_1.db.query(`UPDATE \`facility_shift_requests\` SET ${fields.join(", ")} WHERE \`id\` = ?`, values);
    return (0, exports.getFacilityShiftRequestById)(id);
};
exports.updateFacilityShiftRequest = updateFacilityShiftRequest;
const deleteFacilityShiftRequest = async (id) => {
    await db_1.db.query("DELETE FROM `facility_shift_requests` WHERE `id` = ?", [id]);
};
exports.deleteFacilityShiftRequest = deleteFacilityShiftRequest;
