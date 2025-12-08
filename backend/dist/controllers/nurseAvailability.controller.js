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
const NurseAvailabilityService = __importStar(require("../services/nurseAvailability.service"));
const getAllNurseAvailabilities = async (req, res) => {
    try {
        const filters = {
            nurse_id: req.query.nurse_id,
            year_month: req.query.year_month,
            status: req.query.status,
        };
        const availabilities = await NurseAvailabilityService.getAllNurseAvailabilities(filters);
        res.json(availabilities);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllNurseAvailabilities = getAllNurseAvailabilities;
const getNurseAvailabilityById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const availability = await NurseAvailabilityService.getNurseAvailabilityById(id);
        if (!availability) {
            return res.status(404).json({ error: "Availability not found" });
        }
        res.json(availability);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getNurseAvailabilityById = getNurseAvailabilityById;
const getNurseAvailabilityByNurseAndMonth = async (req, res) => {
    try {
        const { nurse_id, year_month } = req.params;
        console.log("Controller: getNurseAvailabilityByNurseAndMonth", { nurse_id, year_month });
        const availability = await NurseAvailabilityService.getNurseAvailabilityByNurseAndMonth(nurse_id, year_month);
        console.log("Controller: result", availability ? `Found (id: ${availability.id})` : "null");
        // Return null as JSON null, not undefined
        if (!availability) {
            return res.json(null);
        }
        res.json(availability);
    }
    catch (error) {
        console.error("Error fetching nurse availability:", error);
        res.status(500).json({ error: error.message });
    }
};
exports.getNurseAvailabilityByNurseAndMonth = getNurseAvailabilityByNurseAndMonth;
const createNurseAvailability = async (req, res) => {
    try {
        const availability = await NurseAvailabilityService.createNurseAvailability(req.body);
        res.status(201).json(availability);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createNurseAvailability = createNurseAvailability;
const updateNurseAvailability = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const availability = await NurseAvailabilityService.updateNurseAvailability(id, req.body);
        res.json(availability);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateNurseAvailability = updateNurseAvailability;
const deleteNurseAvailability = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await NurseAvailabilityService.deleteNurseAvailability(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteNurseAvailability = deleteNurseAvailability;
