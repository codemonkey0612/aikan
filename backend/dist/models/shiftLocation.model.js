"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteShiftLocation = exports.updateShiftLocation = exports.createShiftLocation = exports.getShiftLocationsByNurse = exports.getShiftLocationsByFacility = exports.getShiftLocationById = exports.getAllShiftLocations = void 0;
const db_1 = require("../config/db");
const getAllShiftLocations = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_locations");
    return rows;
};
exports.getAllShiftLocations = getAllShiftLocations;
const getShiftLocationById = async (shift_location_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_locations WHERE shift_location_id = ?", [shift_location_id]);
    return rows[0] ?? null;
};
exports.getShiftLocationById = getShiftLocationById;
const getShiftLocationsByFacility = async (facility_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_locations WHERE facility_id = ? ORDER BY date_time DESC", [facility_id]);
    return rows;
};
exports.getShiftLocationsByFacility = getShiftLocationsByFacility;
const getShiftLocationsByNurse = async (nurse_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM shift_locations WHERE nurse_id = ? ORDER BY date_time DESC", [nurse_id]);
    return rows;
};
exports.getShiftLocationsByNurse = getShiftLocationsByNurse;
const createShiftLocation = async (data) => {
    const { facility_id, nurse_id, date_time, latitude_longitude_from, distance_m, duration_sec, shift_period, } = data;
    const [result] = await db_1.db.query(`INSERT INTO shift_locations (
      facility_id, nurse_id, date_time,
      latitude_longitude_from, distance_m, duration_sec, shift_period
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
        facility_id ?? null,
        nurse_id ?? null,
        date_time ?? null,
        latitude_longitude_from ?? null,
        distance_m ?? null,
        duration_sec ?? null,
        shift_period ?? null,
    ]);
    return (0, exports.getShiftLocationById)(result.insertId);
};
exports.createShiftLocation = createShiftLocation;
const updateShiftLocation = async (shift_location_id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getShiftLocationById)(shift_location_id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE shift_locations SET ${setClause} WHERE shift_location_id = ?`, [...values, shift_location_id]);
    return (0, exports.getShiftLocationById)(shift_location_id);
};
exports.updateShiftLocation = updateShiftLocation;
const deleteShiftLocation = async (shift_location_id) => {
    await db_1.db.query("DELETE FROM shift_locations WHERE shift_location_id = ?", [shift_location_id]);
};
exports.deleteShiftLocation = deleteShiftLocation;
