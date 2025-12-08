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
const FacilityService = __importStar(require("../services/facility.service"));
const getAllFacilities = async (req, res) => {
    const facilities = await FacilityService.getAllFacilities();
    res.json(facilities);
};
exports.getAllFacilities = getAllFacilities;
const getFacilityById = async (req, res) => {
    const facility = await FacilityService.getFacilityById(req.params.id // VARCHAR(50) - no conversion needed
    );
    res.json(facility);
};
exports.getFacilityById = getFacilityById;
const createFacility = async (req, res) => {
    const created = await FacilityService.createFacility(req.body);
    res.status(201).json(created);
};
exports.createFacility = createFacility;
const updateFacility = async (req, res) => {
    const updated = await FacilityService.updateFacility(req.params.id, // VARCHAR(50) - no conversion needed
    req.body);
    res.json(updated);
};
exports.updateFacility = updateFacility;
const deleteFacility = async (req, res) => {
    await FacilityService.deleteFacility(req.params.id); // VARCHAR(50) - no conversion needed
    res.json({ message: "Deleted" });
};
exports.deleteFacility = deleteFacility;
