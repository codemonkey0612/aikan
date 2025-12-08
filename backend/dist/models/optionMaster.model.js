"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOptionMaster = exports.updateOptionMaster = exports.createOptionMaster = exports.getOptionMasterById = exports.getOptionMasterByCategory = exports.getAllOptionMasters = void 0;
const db_1 = require("../config/db");
const getAllOptionMasters = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM option_master WHERE active = 1 ORDER BY category, display_order, code");
    return rows;
};
exports.getAllOptionMasters = getAllOptionMasters;
const getOptionMasterByCategory = async (category) => {
    const [rows] = await db_1.db.query("SELECT * FROM option_master WHERE category = ? AND active = 1 ORDER BY display_order, code", [category]);
    return rows;
};
exports.getOptionMasterByCategory = getOptionMasterByCategory;
const getOptionMasterById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM option_master WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getOptionMasterById = getOptionMasterById;
const createOptionMaster = async (data) => {
    const { category, code, label, value, display_order, active } = data;
    const [result] = await db_1.db.query(`INSERT INTO option_master (category, code, label, value, display_order, active)
     VALUES (?, ?, ?, ?, ?, ?)`, [category, code, label, value ?? null, display_order ?? 0, active ?? 1]);
    return (0, exports.getOptionMasterById)(result.insertId);
};
exports.createOptionMaster = createOptionMaster;
const updateOptionMaster = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getOptionMasterById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE option_master SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getOptionMasterById)(id);
};
exports.updateOptionMaster = updateOptionMaster;
const deleteOptionMaster = async (id) => {
    await db_1.db.query("DELETE FROM option_master WHERE id = ?", [id]);
};
exports.deleteOptionMaster = deleteOptionMaster;
