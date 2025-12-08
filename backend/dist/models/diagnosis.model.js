"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiagnosis = exports.updateDiagnosis = exports.createDiagnosis = exports.getDiagnosesByResident = exports.getDiagnosisById = exports.getAllDiagnoses = void 0;
const db_1 = require("../config/db");
const getAllDiagnoses = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM diagnoses ORDER BY diagnosis_date DESC, created_at DESC");
    return rows;
};
exports.getAllDiagnoses = getAllDiagnoses;
const getDiagnosisById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM diagnoses WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getDiagnosisById = getDiagnosisById;
const getDiagnosesByResident = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM diagnoses WHERE resident_id = ? ORDER BY diagnosis_date DESC, created_at DESC", [resident_id]);
    return rows;
};
exports.getDiagnosesByResident = getDiagnosesByResident;
const createDiagnosis = async (data) => {
    const { resident_id, diagnosis_code, diagnosis_name, diagnosis_date, severity, status, notes, diagnosed_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO diagnoses 
     (resident_id, diagnosis_code, diagnosis_name, diagnosis_date, severity, status, notes, diagnosed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        diagnosis_code ?? null,
        diagnosis_name,
        diagnosis_date ?? null,
        severity ?? null,
        status ?? "ACTIVE",
        notes ?? null,
        diagnosed_by ?? null,
    ]);
    return (0, exports.getDiagnosisById)(result.insertId);
};
exports.createDiagnosis = createDiagnosis;
const updateDiagnosis = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getDiagnosisById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE diagnoses SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getDiagnosisById)(id);
};
exports.updateDiagnosis = updateDiagnosis;
const deleteDiagnosis = async (id) => {
    await db_1.db.query("DELETE FROM diagnoses WHERE id = ?", [id]);
};
exports.deleteDiagnosis = deleteDiagnosis;
