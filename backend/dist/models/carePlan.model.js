"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCarePlanItem = exports.updateCarePlanItem = exports.createCarePlanItem = exports.getCarePlanItemById = exports.getCarePlanItems = exports.deleteCarePlan = exports.updateCarePlan = exports.createCarePlan = exports.getCarePlansByResident = exports.getCarePlanById = exports.getAllCarePlans = void 0;
const db_1 = require("../config/db");
const getAllCarePlans = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM care_plans ORDER BY start_date DESC, created_at DESC");
    return rows;
};
exports.getAllCarePlans = getAllCarePlans;
const getCarePlanById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM care_plans WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getCarePlanById = getCarePlanById;
const getCarePlansByResident = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM care_plans WHERE resident_id = ? ORDER BY start_date DESC, created_at DESC", [resident_id]);
    return rows;
};
exports.getCarePlansByResident = getCarePlansByResident;
const createCarePlan = async (data) => {
    const { resident_id, title, description, start_date, end_date, status, priority, created_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO care_plans 
     (resident_id, title, description, start_date, end_date, status, priority, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        title,
        description ?? null,
        start_date,
        end_date ?? null,
        status ?? "ACTIVE",
        priority ?? "MEDIUM",
        created_by ?? null,
    ]);
    return (0, exports.getCarePlanById)(result.insertId);
};
exports.createCarePlan = createCarePlan;
const updateCarePlan = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getCarePlanById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE care_plans SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getCarePlanById)(id);
};
exports.updateCarePlan = updateCarePlan;
const deleteCarePlan = async (id) => {
    await db_1.db.query("DELETE FROM care_plans WHERE id = ?", [id]);
};
exports.deleteCarePlan = deleteCarePlan;
// Care Plan Items
const getCarePlanItems = async (care_plan_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM care_plan_items WHERE care_plan_id = ? ORDER BY due_date ASC, created_at ASC", [care_plan_id]);
    return rows;
};
exports.getCarePlanItems = getCarePlanItems;
const getCarePlanItemById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM care_plan_items WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getCarePlanItemById = getCarePlanItemById;
const createCarePlanItem = async (data) => {
    const { care_plan_id, task_description, frequency, assigned_to, due_date } = data;
    const [result] = await db_1.db.query(`INSERT INTO care_plan_items 
     (care_plan_id, task_description, frequency, assigned_to, due_date)
     VALUES (?, ?, ?, ?, ?)`, [
        care_plan_id,
        task_description,
        frequency ?? null,
        assigned_to ?? null,
        due_date ?? null,
    ]);
    return (0, exports.getCarePlanItemById)(result.insertId);
};
exports.createCarePlanItem = createCarePlanItem;
const updateCarePlanItem = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getCarePlanItemById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => {
        if (key === "completed" && data[key] !== undefined) {
            return data[key] ? 1 : 0;
        }
        return data[key];
    });
    // completedがtrueの場合、completed_atを設定
    if (data.completed) {
        const completedAtIndex = fields.indexOf("completed_at");
        if (completedAtIndex === -1) {
            fields.push("completed_at");
            values.push(new Date().toISOString());
        }
    }
    else if (data.completed === false) {
        // completedがfalseの場合、completed_atをクリア
        const completedAtIndex = fields.indexOf("completed_at");
        if (completedAtIndex === -1) {
            fields.push("completed_at");
            values.push(null);
        }
    }
    await db_1.db.query(`UPDATE care_plan_items SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getCarePlanItemById)(id);
};
exports.updateCarePlanItem = updateCarePlanItem;
const deleteCarePlanItem = async (id) => {
    await db_1.db.query("DELETE FROM care_plan_items WHERE id = ?", [id]);
};
exports.deleteCarePlanItem = deleteCarePlanItem;
