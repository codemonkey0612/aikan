"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFacility = exports.updateFacility = exports.createFacility = exports.getFacilityById = exports.getAllFacilities = void 0;
const FacilityModel = __importStar(require("../models/facility.model"));
const cache_1 = require("../utils/cache");
// 施設一覧のTTL: 1時間
const FACILITIES_TTL = 3600;
// 個別施設のTTL: 30分
const FACILITY_TTL = 1800;
const getAllFacilities = () => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.FACILITIES, () => FacilityModel.getAllFacilities(), FACILITIES_TTL);
exports.getAllFacilities = getAllFacilities;
const getFacilityById = (facility_id) => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.FACILITY(facility_id), () => FacilityModel.getFacilityById(facility_id), FACILITY_TTL);
exports.getFacilityById = getFacilityById;
const createFacility = async (data) => {
    const facility = await FacilityModel.createFacility(data);
    // 施設一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.FACILITIES);
    return facility;
};
exports.createFacility = createFacility;
const updateFacility = async (facility_id, data) => {
    const facility = await FacilityModel.updateFacility(facility_id, data);
    // 該当施設と施設一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.FACILITY(facility_id));
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.FACILITIES);
    return facility;
};
exports.updateFacility = updateFacility;
const deleteFacility = async (facility_id) => {
    await FacilityModel.deleteFacility(facility_id);
    // 該当施設と施設一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.FACILITY(facility_id));
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.FACILITIES);
};
exports.deleteFacility = deleteFacility;
