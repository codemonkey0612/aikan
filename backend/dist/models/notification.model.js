"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.updateNotification = exports.createNotification = exports.getNotificationById = exports.getAllNotifications = void 0;
const db_1 = require("../config/db");
const getAllNotifications = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM notifications");
    return rows;
};
exports.getAllNotifications = getAllNotifications;
const getNotificationById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM notifications WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getNotificationById = getNotificationById;
const createNotification = async (data) => {
    const { title, body, target_role, publish_from, publish_to, created_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO notifications
    (title, body, target_role, publish_from, publish_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?)`, [title, body, target_role, publish_from, publish_to, created_by]);
    return (0, exports.getNotificationById)(result.insertId);
};
exports.createNotification = createNotification;
const updateNotification = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getNotificationById)(id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE notifications SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getNotificationById)(id);
};
exports.updateNotification = updateNotification;
const deleteNotification = async (id) => {
    await db_1.db.query("DELETE FROM notifications WHERE id = ?", [id]);
};
exports.deleteNotification = deleteNotification;
