"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCorporation = exports.updateCorporation = exports.createCorporation = exports.getCorporationByNumber = exports.getCorporationById = exports.getAllCorporations = void 0;
const db_1 = require("../config/db");
const getAllCorporations = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM corporations");
    return rows;
};
exports.getAllCorporations = getAllCorporations;
const getCorporationById = async (corporation_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM corporations WHERE corporation_id = ?", [corporation_id]);
    return rows[0] ?? null;
};
exports.getCorporationById = getCorporationById;
const getCorporationByNumber = async (corporation_number) => {
    const [rows] = await db_1.db.query("SELECT * FROM corporations WHERE corporation_number = ?", [corporation_number]);
    return rows[0] ?? null;
};
exports.getCorporationByNumber = getCorporationByNumber;
const createCorporation = async (data) => {
    const { corporation_id, corporation_number, name, name_kana, postal_code, address_prefecture, address_city, address_building, latitude_longitude, phone_number, contact_email, billing_unit_price, billing_method_id, photo_url, notes, } = data;
    await db_1.db.query(`INSERT INTO corporations (
      corporation_id, corporation_number, name, name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, phone_number, contact_email,
      billing_unit_price, billing_method_id, photo_url, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        corporation_id,
        corporation_number ?? null,
        name,
        name_kana ?? null,
        postal_code ?? null,
        address_prefecture ?? null,
        address_city ?? null,
        address_building ?? null,
        latitude_longitude ?? null,
        phone_number ?? null,
        contact_email ?? null,
        billing_unit_price ?? null,
        billing_method_id ?? null,
        photo_url ?? null,
        notes ?? null,
    ]);
    return (0, exports.getCorporationById)(corporation_id);
};
exports.createCorporation = createCorporation;
const updateCorporation = async (corporation_id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getCorporationById)(corporation_id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE corporations SET ${setClause} WHERE corporation_id = ?`, [...values, corporation_id]);
    return (0, exports.getCorporationById)(corporation_id);
};
exports.updateCorporation = updateCorporation;
const deleteCorporation = async (corporation_id) => {
    await db_1.db.query("DELETE FROM corporations WHERE corporation_id = ?", [corporation_id]);
};
exports.deleteCorporation = deleteCorporation;
