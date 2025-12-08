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
exports.deleteResident = exports.updateResident = exports.createResident = exports.getResidentById = exports.getAllResidents = void 0;
const ResidentService = __importStar(require("../services/resident.service"));
const getAllResidents = async (req, res) => {
    const residents = await ResidentService.getAllResidents();
    res.json(residents);
};
exports.getAllResidents = getAllResidents;
const getResidentById = async (req, res) => {
    const resident = await ResidentService.getResidentById(req.params.id // VARCHAR(50) - no conversion needed
    );
    res.json(resident);
};
exports.getResidentById = getResidentById;
const createResident = async (req, res) => {
    const created = await ResidentService.createResident(req.body);
    res.status(201).json(created);
};
exports.createResident = createResident;
const updateResident = async (req, res) => {
    const updated = await ResidentService.updateResident(req.params.id, // VARCHAR(50) - no conversion needed
    req.body);
    res.json(updated);
};
exports.updateResident = updateResident;
const deleteResident = async (req, res) => {
    await ResidentService.deleteResident(req.params.id); // VARCHAR(50) - no conversion needed
    res.json({ message: "Deleted" });
};
exports.deleteResident = deleteResident;
