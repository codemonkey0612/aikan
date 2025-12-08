"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSalaryRule = exports.updateSalaryRule = exports.createSalaryRule = exports.getSalaryRulesByType = exports.getSalaryRuleById = exports.getAllSalaryRules = void 0;
const db_1 = require("../config/db");
const getAllSalaryRules = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM salary_rules WHERE active = 1 ORDER BY priority DESC, rule_type, name");
    return rows;
};
exports.getAllSalaryRules = getAllSalaryRules;
const getSalaryRuleById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM salary_rules WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getSalaryRuleById = getSalaryRuleById;
const getSalaryRulesByType = async (rule_type) => {
    const [rows] = await db_1.db.query("SELECT * FROM salary_rules WHERE rule_type = ? AND active = 1 ORDER BY priority DESC", [rule_type]);
    return rows;
};
exports.getSalaryRulesByType = getSalaryRulesByType;
const createSalaryRule = async (data) => {
    const { name, rule_type, condition_json, calculation_formula, priority, active, } = data;
    const [result] = await db_1.db.query(`INSERT INTO salary_rules (name, rule_type, condition_json, calculation_formula, priority, active)
     VALUES (?, ?, ?, ?, ?, ?)`, [
        name,
        rule_type,
        condition_json ?? null,
        calculation_formula ?? null,
        priority ?? 0,
        active ?? 1,
    ]);
    return (0, exports.getSalaryRuleById)(result.insertId);
};
exports.createSalaryRule = createSalaryRule;
const updateSalaryRule = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getSalaryRuleById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE salary_rules SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getSalaryRuleById)(id);
};
exports.updateSalaryRule = updateSalaryRule;
const deleteSalaryRule = async (id) => {
    await db_1.db.query("DELETE FROM salary_rules WHERE id = ?", [id]);
};
exports.deleteSalaryRule = deleteSalaryRule;
