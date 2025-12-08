"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserByEmail = exports.getUserById = exports.getUsersPaginated = exports.getAllUsers = void 0;
const db_1 = require("../config/db");
const getAllUsers = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM users");
    return rows;
};
exports.getAllUsers = getAllUsers;
/**
 * ページネーション対応でユーザーを取得
 */
const getUsersPaginated = async (page = 1, limit = 20, sortBy = "created_at", sortOrder = "desc", filters) => {
    const offset = (page - 1) * limit;
    const validSortColumns = [
        "id",
        "email",
        "last_name",
        "first_name",
        "role",
        "created_at",
    ];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : "created_at";
    const order = sortOrder.toUpperCase();
    let whereClause = "1=1";
    const queryParams = [];
    if (filters?.role) {
        whereClause += " AND role = ?";
        queryParams.push(filters.role);
    }
    if (filters?.search) {
        whereClause += " AND (email LIKE ? OR last_name LIKE ? OR first_name LIKE ? OR CONCAT(last_name, ' ', first_name) LIKE ?)";
        const searchPattern = `%${filters.search}%`;
        queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }
    // データ取得
    const [rows] = await db_1.db.query(`SELECT * FROM users WHERE ${whereClause} ORDER BY ${sortColumn} ${order} LIMIT ? OFFSET ?`, [...queryParams, limit, offset]);
    // 総件数取得
    const [countRows] = await db_1.db.query(`SELECT COUNT(*) as count FROM users WHERE ${whereClause}`, queryParams);
    const total = countRows[0]?.count ?? 0;
    return { data: rows, total };
};
exports.getUsersPaginated = getUsersPaginated;
const getUserById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getUserById = getUserById;
const getUserByEmail = async (email) => {
    const [rows] = await db_1.db.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] ?? null;
};
exports.getUserByEmail = getUserByEmail;
const createUser = async (data) => {
    const { role = "nurse", nurse_id, last_name, first_name, last_name_kana, first_name_kana, postal_code, address_prefecture, address_city, address_building, latitude_longitude, email, password, phone_number, user_photo_url, notes, position, alcohol_check = false, } = data;
    const [result] = await db_1.db.query(`INSERT INTO users (
      role, nurse_id, last_name, first_name, last_name_kana, first_name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, email, password, phone_number,
      user_photo_url, notes, position, alcohol_check
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        role,
        nurse_id ?? null,
        last_name,
        first_name,
        last_name_kana ?? null,
        first_name_kana ?? null,
        postal_code ?? null,
        address_prefecture ?? null,
        address_city ?? null,
        address_building ?? null,
        latitude_longitude ?? null,
        email,
        password,
        phone_number ?? null,
        user_photo_url ?? null,
        notes ?? null,
        position ?? null,
        alcohol_check,
    ]);
    return (0, exports.getUserById)(result.insertId);
};
exports.createUser = createUser;
const updateUser = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getUserById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getUserById)(id);
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    await db_1.db.query("DELETE FROM users WHERE id = ?", [id]);
};
exports.deleteUser = deleteUser;
