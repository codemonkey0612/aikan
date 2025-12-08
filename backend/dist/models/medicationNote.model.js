"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMedicationNote = exports.updateMedicationNote = exports.createMedicationNote = exports.getActiveMedicationNotesByResident = exports.getMedicationNotesByResident = exports.getMedicationNoteById = exports.getAllMedicationNotes = void 0;
const db_1 = require("../config/db");
const getAllMedicationNotes = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM medication_notes ORDER BY start_date DESC, created_at DESC");
    return rows;
};
exports.getAllMedicationNotes = getAllMedicationNotes;
const getMedicationNoteById = async (id) => {
    const [rows] = await db_1.db.query("SELECT * FROM medication_notes WHERE id = ?", [id]);
    return rows[0] ?? null;
};
exports.getMedicationNoteById = getMedicationNoteById;
const getMedicationNotesByResident = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM medication_notes WHERE resident_id = ? ORDER BY start_date DESC, created_at DESC", [resident_id]);
    return rows;
};
exports.getMedicationNotesByResident = getMedicationNotesByResident;
const getActiveMedicationNotesByResident = async (resident_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM medication_notes WHERE resident_id = ? AND status = 'ACTIVE' ORDER BY start_date DESC", [resident_id]);
    return rows;
};
exports.getActiveMedicationNotesByResident = getActiveMedicationNotesByResident;
const createMedicationNote = async (data) => {
    const { resident_id, medication_name, dosage, frequency, route, start_date, end_date, prescribed_by, notes, status, created_by, } = data;
    const [result] = await db_1.db.query(`INSERT INTO medication_notes 
     (resident_id, medication_name, dosage, frequency, route, start_date, end_date, prescribed_by, notes, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        resident_id,
        medication_name,
        dosage ?? null,
        frequency ?? null,
        route ?? null,
        start_date ?? null,
        end_date ?? null,
        prescribed_by ?? null,
        notes ?? null,
        status ?? "ACTIVE",
        created_by ?? null,
    ]);
    return (0, exports.getMedicationNoteById)(result.insertId);
};
exports.createMedicationNote = createMedicationNote;
const updateMedicationNote = async (id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getMedicationNoteById)(id);
    }
    const setClause = fields.map((key) => `${key} = ?`).join(", ");
    const values = fields.map((key) => data[key]);
    await db_1.db.query(`UPDATE medication_notes SET ${setClause} WHERE id = ?`, [...values, id]);
    return (0, exports.getMedicationNoteById)(id);
};
exports.updateMedicationNote = updateMedicationNote;
const deleteMedicationNote = async (id) => {
    await db_1.db.query("DELETE FROM medication_notes WHERE id = ?", [id]);
};
exports.deleteMedicationNote = deleteMedicationNote;
