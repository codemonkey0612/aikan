"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpiredPins = exports.markPinAsUsed = exports.createPinVerification = exports.getActivePinByUser = exports.getPinVerificationByPin = exports.getPinVerificationById = void 0;
const db_1 = require("../config/db");
const getPinVerificationById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM pin_verifications WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getPinVerificationById = getPinVerificationById;
const getPinVerificationByPin = async (pin) => {
    const [rows] = await db_1.db.query("SELECT * FROM pin_verifications WHERE pin = ? AND used = 0 AND expires_at > NOW()", [pin]);
    return rows[0] ?? null;
};
exports.getPinVerificationByPin = getPinVerificationByPin;
const getActivePinByUser = async (user_id, purpose) => {
    const [rows] = await db_1.db.query("SELECT * FROM pin_verifications WHERE user_id = ? AND purpose = ? AND used = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1", [user_id, purpose]);
    return rows[0] ?? null;
};
exports.getActivePinByUser = getActivePinByUser;
const createPinVerification = async (data) => {
    const { user_id, pin, purpose, attendance_id, expires_at } = data;
    const [result] = await db_1.db.query(`INSERT INTO pin_verifications (user_id, pin, purpose, attendance_id, expires_at)
     VALUES (?, ?, ?, ?, ?)`, [user_id, pin, purpose, attendance_id ?? null, expires_at]);
    return (0, exports.getPinVerificationById)(result.insertId);
};
exports.createPinVerification = createPinVerification;
const markPinAsUsed = async (pin) => {
    await db_1.db.query("UPDATE pin_verifications SET used = 1 WHERE pin = ?", [pin]);
};
exports.markPinAsUsed = markPinAsUsed;
const deleteExpiredPins = async () => {
    await db_1.db.query("DELETE FROM pin_verifications WHERE expires_at < NOW() AND used = 1");
};
exports.deleteExpiredPins = deleteExpiredPins;
