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
exports.deleteFacilityShiftRequest = exports.updateFacilityShiftRequest = exports.createFacilityShiftRequest = exports.getFacilityShiftRequestByFacilityAndMonth = exports.getFacilityShiftRequestById = exports.getAllFacilityShiftRequests = void 0;
const FacilityShiftRequestModel = __importStar(require("../models/facilityShiftRequest.model"));
const cache_1 = require("../utils/cache");
const CACHE_KEY = "facility_shift_requests";
const getAllFacilityShiftRequests = async (filters) => {
    const cacheKey = `${CACHE_KEY}:${JSON.stringify(filters ?? {})}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return FacilityShiftRequestModel.getAllFacilityShiftRequests(filters);
    });
};
exports.getAllFacilityShiftRequests = getAllFacilityShiftRequests;
const getFacilityShiftRequestById = async (id) => {
    const cacheKey = `${CACHE_KEY}:${id}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return FacilityShiftRequestModel.getFacilityShiftRequestById(id);
    });
};
exports.getFacilityShiftRequestById = getFacilityShiftRequestById;
const getFacilityShiftRequestByFacilityAndMonth = async (facility_id, year_month) => {
    const cacheKey = `${CACHE_KEY}:${facility_id}:${year_month}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return FacilityShiftRequestModel.getFacilityShiftRequestByFacilityAndMonth(facility_id, year_month);
    });
};
exports.getFacilityShiftRequestByFacilityAndMonth = getFacilityShiftRequestByFacilityAndMonth;
const createFacilityShiftRequest = async (data) => {
    const result = await FacilityShiftRequestModel.createFacilityShiftRequest(data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.createFacilityShiftRequest = createFacilityShiftRequest;
const updateFacilityShiftRequest = async (id, data) => {
    const result = await FacilityShiftRequestModel.updateFacilityShiftRequest(id, data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.updateFacilityShiftRequest = updateFacilityShiftRequest;
const deleteFacilityShiftRequest = async (id) => {
    await FacilityShiftRequestModel.deleteFacilityShiftRequest(id);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
};
exports.deleteFacilityShiftRequest = deleteFacilityShiftRequest;
