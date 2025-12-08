"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShiftTemplate = exports.updateShiftTemplate = exports.createShiftTemplate = exports.getShiftTemplatesByFacility = exports.getShiftTemplateById = exports.getAllShiftTemplates = void 0;
const db_1 = require("../config/db");
const getAllShiftTemplates = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_templates WHERE active = 1 ORDER BY name");
    return rows;
};
exports.getAllShiftTemplates = getAllShiftTemplates;
const getShiftTemplateById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_templates WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getShiftTemplateById = getShiftTemplateById;
const getShiftTemplatesByFacility = async (facility_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_templates WHERE facility_id = ? AND active = 1 ORDER BY name", [facility_id]);
    return rows;
};
exports.getShiftTemplatesByFacility = getShiftTemplatesByFacility;
const createShiftTemplate = async (data) => {
    const { name, facility_id, shift_type, start_time, end_time, day_of_week, is_recurring, active, } = data;
    const [result] = await db_1.db.query(`INSERT INTO shift_templates (name, facility_id, shift_type, start_time, end_time, day_of_week, is_recurring, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        name,
        facility_id ?? null,
        shift_type ?? null,
        start_time ?? null,
        end_time ?? null,
        day_of_week ?? null,
        is_recurring ?? 0,
        active ?? 1,
    ]);
    return (0, exports.getShiftTemplateById)(result.insertId);
};
exports.createShiftTemplate = createShiftTemplate;
const updateShiftTemplate = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getShiftTemplateById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE shift_templates SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getShiftTemplateById)(id);
};
exports.updateShiftTemplate = updateShiftTemplate;
const deleteShiftTemplate = async (id) => {
    await db_1.db.query("DELETE FROM shift_templates WHERE id = ?", [id]);
};
exports.deleteShiftTemplate = deleteShiftTemplate;
