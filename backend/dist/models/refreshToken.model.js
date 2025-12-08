"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRefreshToken = exports.deleteExpiredRefreshTokens = exports.revokeAllRefreshTokensByUserId = exports.revokeRefreshToken = exports.getRefreshTokensByUserId = exports.getRefreshTokenByToken = exports.getRefreshTokenById = exports.createRefreshToken = void 0;
const db_1 = require("../config/db");
/**
 * リフレッシュトークンを作成
 */
const createRefreshToken = async (data) => {
    const { user_id, token, expires_at } = data;
    const [result] = await db_1.db.query(`INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES (?, ?, ?)`, [user_id, token, expires_at]);
    return (0, exports.getRefreshTokenById)(result.insertId);
};
exports.createRefreshToken = createRefreshToken;
/**
 * リフレッシュトークンをIDで取得
 */
const getRefreshTokenById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM refresh_tokens WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getRefreshTokenById = getRefreshTokenById;
/**
 * リフレッシュトークンをトークン文字列で取得
 */
const getRefreshTokenByToken = async (token) => {
    const [rows] = await db_1.db.query("SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0", [token]);
    return rows[0] ?? null;
};
exports.getRefreshTokenByToken = getRefreshTokenByToken;
/**
 * ユーザーのすべてのリフレッシュトークンを取得
 */
const getRefreshTokensByUserId = async (user_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM refresh_tokens WHERE user_id = ? AND revoked = 0", [user_id]);
    return rows;
};
exports.getRefreshTokensByUserId = getRefreshTokensByUserId;
/**
 * リフレッシュトークンを無効化（ログアウト時など）
 */
const revokeRefreshToken = async (token) => {
    await db_1.db.query("UPDATE refresh_tokens SET revoked = 1 WHERE token = ?", [token]);
};
exports.revokeRefreshToken = revokeRefreshToken;
/**
 * ユーザーのすべてのリフレッシュトークンを無効化
 */
const revokeAllRefreshTokensByUserId = async (user_id) => {
    await db_1.db.query("UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?", [user_id]);
};
exports.revokeAllRefreshTokensByUserId = revokeAllRefreshTokensByUserId;
/**
 * 期限切れのリフレッシュトークンを削除（クリーンアップ）
 */
const deleteExpiredRefreshTokens = async () => {
    await db_1.db.query("DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = 1");
};
exports.deleteExpiredRefreshTokens = deleteExpiredRefreshTokens;
/**
 * リフレッシュトークンを削除（トークンローテーション時）
 */
const deleteRefreshToken = async (token) => {
    await db_1.db.query("DELETE FROM refresh_tokens WHERE token = ?", [token]);
};
exports.deleteRefreshToken = deleteRefreshToken;
