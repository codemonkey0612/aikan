"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFacility = exports.updateFacility = exports.createFacility = exports.getFacilityById = exports.getAllFacilities = void 0;
const db_1 = require("../config/db");
const getAllFacilities = async () => {
    const [rows] = await db_1.db.query("SELECT * FROM facilities");
    return rows;
};
exports.getAllFacilities = getAllFacilities;
const getFacilityById = async (facility_id) => {
    const [rows] = await db_1.db.query("SELECT * FROM facilities WHERE facility_id = ?", [facility_id]);
    return rows[0] ?? null;
};
exports.getFacilityById = getFacilityById;
const createFacility = async (data) => {
    const { facility_id, facility_number, corporation_id, name, name_kana, postal_code, address_prefecture, address_city, address_building, latitude_longitude, phone_number, facility_status_id, pre_visit_contact_id, contact_type_id, building_type_id, pl_support_id, visit_notes, user_notes, facility_notes, map_document_url, billing_unit_price, billing_method_id, capacity, current_residents, nurse_id, visit_count, prefer_mon = false, prefer_tue = false, prefer_wed = false, prefer_thu = false, prefer_fri = false, time_mon, time_tue, time_wed, time_thu, time_fri, } = data;
    await db_1.db.query(`INSERT INTO facilities (
      facility_id, facility_number, corporation_id, name, name_kana,
      postal_code, address_prefecture, address_city, address_building,
      latitude_longitude, phone_number,
      facility_status_id, pre_visit_contact_id,
      contact_type_id, building_type_id, pl_support_id,
      visit_notes, facility_notes, user_notes, map_document_url,
      billing_unit_price, billing_method_id,
      capacity, current_residents,
      nurse_id, visit_count,
      prefer_mon, prefer_tue, prefer_wed, prefer_thu, prefer_fri,
      time_mon, time_tue, time_wed, time_thu, time_fri
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        facility_id,
        facility_number ?? null,
        corporation_id ?? null,
        name,
        name_kana ?? null,
        postal_code ?? null,
        address_prefecture ?? null,
        address_city ?? null,
        address_building ?? null,
        latitude_longitude ?? null,
        phone_number ?? null,
        facility_status_id ?? null,
        pre_visit_contact_id ?? null,
        contact_type_id ?? null,
        building_type_id ?? null,
        pl_support_id ?? null,
        visit_notes ?? null,
        facility_notes ?? null,
        user_notes ?? null,
        map_document_url ?? null,
        billing_unit_price ?? null,
        billing_method_id ?? null,
        capacity ?? null,
        current_residents ?? null,
        nurse_id ?? null,
        visit_count ?? null,
        prefer_mon,
        prefer_tue,
        prefer_wed,
        prefer_thu,
        prefer_fri,
        time_mon ?? null,
        time_tue ?? null,
        time_wed ?? null,
        time_thu ?? null,
        time_fri ?? null,
    ]);
    return (0, exports.getFacilityById)(facility_id);
};
exports.createFacility = createFacility;
const updateFacility = async (facility_id, data) => {
    const fields = Object.keys(data);
    if (!fields.length) {
        return (0, exports.getFacilityById)(facility_id);
    }
    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const values = fields.map((field) => data[field]);
    await db_1.db.query(`UPDATE facilities SET ${setClause} WHERE facility_id = ?`, [...values, facility_id]);
    return (0, exports.getFacilityById)(facility_id);
};
exports.updateFacility = updateFacility;
const deleteFacility = async (facility_id) => {
    await db_1.db.query("DELETE FROM facilities WHERE facility_id = ?", [facility_id]);
};
exports.deleteFacility = deleteFacility;
