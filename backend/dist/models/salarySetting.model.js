"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalarySetting = exports.updateSalarySetting = exports.createSalarySetting = exports.getSalarySettingByKey = exports.getAllSalarySettings = void 0;
const db_1 = require("../config/db");
const getAllSalarySettings = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM salary_settings ORDER BY setting_key");
    return rows;
};
exports.getAllSalarySettings = getAllSalarySettings;
const getSalarySettingByKey = async (setting_key) => {
    const [rows] = await db_1.db.query("SELECT * FROM salary_settings WHERE setting_key = ?", [setting_key]);
    return rows[0] ?? null;
};
exports.getSalarySettingByKey = getSalarySettingByKey;
const createSalarySetting = async (data) => {
    const { setting_key, setting_value, description, updated_by } = data;
    const [result] = await db_1.db.query(`INSERT INTO salary_settings (setting_key, setting_value, description, updated_by)
     VALUES (?, ?, ?, ?)`, [setting_key, setting_value, description ?? null, updated_by ?? null]);
    return (0, exports.getSalarySettingByKey)(setting_key);
};
exports.createSalarySetting = createSalarySetting;
const updateSalarySetting = async (setting_key, data) => {
    const fields = [];
    const values = [];
    if (data.setting_value !== undefined) {
        fields.push("setting_value = ?");
        values.push(data.setting_value);
    }
    if (data.description !== undefined) {
        fields.push("description = ?");
        values.push(data.description);
    }
    if (data.updated_by !== undefined) {
        fields.push("updated_by = ?");
        values.push(data.updated_by);
    }
    if (fields.length === 0) {
        return (0, exports.getSalarySettingByKey)(setting_key);
    }
    values.push(setting_key);
    await db_1.db.query(`UPDATE salary_settings SET ${fields.join(", ")} WHERE setting_key = ?`, values);
    return (0, exports.getSalarySettingByKey)(setting_key);
};
exports.updateSalarySetting = updateSalarySetting;
const deleteSalarySetting = async (setting_key) => {
    await db_1.db.query("DELETE FROM salary_settings WHERE setting_key = ?", [
        setting_key,
    ]);
};
exports.deleteSalarySetting = deleteSalarySetting;
