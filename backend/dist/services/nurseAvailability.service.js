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
exports.deleteNurseAvailability = exports.updateNurseAvailability = exports.createNurseAvailability = exports.getNurseAvailabilityByNurseAndMonth = exports.getNurseAvailabilityById = exports.getAllNurseAvailabilities = void 0;
const NurseAvailabilityModel = __importStar(require("../models/nurseAvailability.model"));
const cache_1 = require("../utils/cache");
const CACHE_KEY = "nurse_availability";
const getAllNurseAvailabilities = async (filters) => {
    const cacheKey = `${CACHE_KEY}:${JSON.stringify(filters ?? {})}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return NurseAvailabilityModel.getAllNurseAvailabilities(filters);
    });
};
exports.getAllNurseAvailabilities = getAllNurseAvailabilities;
const getNurseAvailabilityById = async (id) => {
    const cacheKey = `${CACHE_KEY}:${id}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return NurseAvailabilityModel.getNurseAvailabilityById(id);
    });
};
exports.getNurseAvailabilityById = getNurseAvailabilityById;
const getNurseAvailabilityByNurseAndMonth = async (nurse_id, year_month) => {
    console.log("Service: getNurseAvailabilityByNurseAndMonth", { nurse_id, year_month });
    // Don't use cache for this query to avoid stale null values
    // Directly call the model
    const result = await NurseAvailabilityModel.getNurseAvailabilityByNurseAndMonth(nurse_id, year_month);
    console.log("Service result:", result ? `Found data (id: ${result.id})` : "No data");
    return result;
};
exports.getNurseAvailabilityByNurseAndMonth = getNurseAvailabilityByNurseAndMonth;
const createNurseAvailability = async (data) => {
    const result = await NurseAvailabilityModel.createNurseAvailability(data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.createNurseAvailability = createNurseAvailability;
const updateNurseAvailability = async (id, data) => {
    const result = await NurseAvailabilityModel.updateNurseAvailability(id, data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.updateNurseAvailability = updateNurseAvailability;
const deleteNurseAvailability = async (id) => {
    await NurseAvailabilityModel.deleteNurseAvailability(id);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
};
exports.deleteNurseAvailability = deleteNurseAvailability;
