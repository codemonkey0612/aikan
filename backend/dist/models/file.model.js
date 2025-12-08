"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.updateFile = exports.createFile = exports.getFilesByCategory = exports.getFilesByEntity = exports.getFileById = exports.getAllFiles = void 0;
const db_1 = require("../config/db");
const getAllFiles = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM files ORDER BY created_at DESC");
    return rows;
};
exports.getAllFiles = getAllFiles;
const getFileById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM files WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getFileById = getFileById;
const getFilesByEntity = async (entity_type, entity_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM files WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC", [entity_type, entity_id]);
    return rows;
};
exports.getFilesByEntity = getFilesByEntity;
const getFilesByCategory = async (category) => {
    const [rows] = await db_1.db.query("SELECT * FROM files WHERE category = ? ORDER BY created_at DESC", [category]);
    return rows;
};
exports.getFilesByCategory = getFilesByCategory;
const createFile = async (data) => {
    const { file_name, original_name, file_path, file_type, file_size, mime_type, category, entity_type, entity_id, uploaded_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO files 
     (file_name, original_name, file_path, file_type, file_size, mime_type, category, entity_type, entity_id, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        file_name,
        original_name,
        file_path,
        file_type,
        file_size,
        mime_type ?? null,
        category,
        entity_type,
        entity_id,
        uploaded_by ?? null,
    ]);
    return (0, exports.getFileById)(result.insertId);
};
exports.createFile = createFile;
const updateFile = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getFileById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE files SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getFileById)(id);
};
exports.updateFile = updateFile;
const deleteFile = async (id) => {
    await db_1.db.query("DELETE FROM files WHERE id = ?", [id]);
};
exports.deleteFile = deleteFile;
