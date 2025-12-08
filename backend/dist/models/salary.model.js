"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalary = exports.updateSalary = exports.createSalary = exports.getSalaryByNurseAndMonth = exports.getSalaryById = exports.getAllSalaries = void 0;
const db_1 = require("../config/db");
const getAllSalaries = async (filters) => {
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.user_id) {
        whereClause += " AND `user_id` = ?";
        queryParams.push(filters.user_id);
    }
    if (filters?.nurse_id) {
        whereClause += " AND `nurse_id` = ?";
        queryParams.push(filters.nurse_id);
    }
    if (filters?.year_month) {
        whereClause += " AND `year_month` = ?";
        queryParams.push(filters.year_month);
    }
    const [rows] = await db_1.db.query(`SELECT * FROM \`nurse_salaries\` WHERE ${whereClause} ORDER BY \`year_month\` DESC, \`created_at\` DESC`, queryParams);
    return rows.map((row) => {
        let calculationDetails = null;
        if (row.calculation_details) {
            try {
                // Handle both JSON type (already parsed) and TEXT type (needs parsing)
                calculationDetails = typeof row.calculation_details === 'string'
                    ? JSON.parse(row.calculation_details)
                    : row.calculation_details;
            }
            catch (e) {
                calculationDetails = null;
            }
        }
        return {
            ...row,
            calculation_details: calculationDetails,
        };
    });
};
exports.getAllSalaries = getAllSalaries;
const getSalaryById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM `nurse_salaries` WHERE `id` = ?", [id]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    let calculationDetails = null;
    if (row.calculation_details) {
        try {
            calculationDetails = typeof row.calculation_details === 'string'
                ? JSON.parse(row.calculation_details)
                : row.calculation_details;
        }
        catch (e) {
            calculationDetails = null;
        }
    }
    return {
        ...row,
        calculation_details: calculationDetails,
    };
};
exports.getSalaryById = getSalaryById;
const getSalaryByNurseAndMonth = async (nurse_id, year_month) => {
    const [rows] = await db_1.db.query("SELECT * FROM `nurse_salaries` WHERE `nurse_id` = ? AND `year_month` = ?", [nurse_id, year_month]);
    if (rows.length === 0)
        return null;
    const row = rows[0];
    let calculationDetails = null;
    if (row.calculation_details) {
        try {
            calculationDetails = typeof row.calculation_details === 'string'
                ? JSON.parse(row.calculation_details)
                : row.calculation_details;
        }
        catch (e) {
            calculationDetails = null;
        }
    }
    return {
        ...row,
        calculation_details: calculationDetails,
    };
};
exports.getSalaryByNurseAndMonth = getSalaryByNurseAndMonth;
const createSalary = async (data) => {
    const { user_id, nurse_id, year_month, total_amount, distance_pay, time_pay, vital_pay, total_distance_km, total_minutes, total_vital_count, calculation_details, } = data;
    const [result] = await db_1.db.query(`INSERT INTO \`nurse_salaries\` (
      \`user_id\`, \`nurse_id\`, \`year_month\`, \`total_amount\`,
      \`distance_pay\`, \`time_pay\`, \`vital_pay\`,
      \`total_distance_km\`, \`total_minutes\`, \`total_vital_count\`,
      \`calculation_details\`, \`calculated_at\`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`, [
        user_id,
        nurse_id ?? null,
        year_month,
        total_amount,
        distance_pay,
        time_pay,
        vital_pay,
        total_distance_km,
        total_minutes,
        total_vital_count,
        calculation_details ? JSON.stringify(calculation_details) : null,
    ]);
    return (0, exports.getSalaryById)(result.insertId);
};
exports.createSalary = createSalary;
const updateSalary = async (id, data) => {
    const fields = [];
    const values = [];
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
            if (key === "calculation_details") {
                fields.push("`calculation_details` = ?");
                values.push(JSON.stringify(value));
            }
            else {
                fields.push(`\`${key}\` = ?`);
                values.push(value);
            }
        }
    });
    if (fields.length === 0) {
        return (0, exports.getSalaryById)(id);
    }
    values.push(id);
    await db_1.db.query(`UPDATE \`nurse_salaries\` SET ${fields.join(", ")} WHERE \`id\` = ?`, values);
    return (0, exports.getSalaryById)(id);
};
exports.updateSalary = updateSalary;
const deleteSalary = async (id) => {
    await db_1.db.query("DELETE FROM `nurse_salaries` WHERE `id` = ?", [id]);
};
exports.deleteSalary = deleteSalary;
