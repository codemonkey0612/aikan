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
const FacilityShiftRequestService = __importStar(require("../services/facilityShiftRequest.service"));
const getAllFacilityShiftRequests = async (req, res) => {
    try {
        const filters = {
            facility_id: req.query.facility_id,
            year_month: req.query.year_month,
            status: req.query.status,
        };
        const requests = await FacilityShiftRequestService.getAllFacilityShiftRequests(filters);
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllFacilityShiftRequests = getAllFacilityShiftRequests;
const getFacilityShiftRequestById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const request = await FacilityShiftRequestService.getFacilityShiftRequestById(id);
        if (!request) {
            return res.status(404).json({ error: "Request not found" });
        }
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFacilityShiftRequestById = getFacilityShiftRequestById;
const getFacilityShiftRequestByFacilityAndMonth = async (req, res) => {
    try {
        const { facility_id, year_month } = req.params;
        const request = await FacilityShiftRequestService.getFacilityShiftRequestByFacilityAndMonth(facility_id, year_month);
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getFacilityShiftRequestByFacilityAndMonth = getFacilityShiftRequestByFacilityAndMonth;
const createFacilityShiftRequest = async (req, res) => {
    try {
        const request = await FacilityShiftRequestService.createFacilityShiftRequest(req.body);
        res.status(201).json(request);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createFacilityShiftRequest = createFacilityShiftRequest;
const updateFacilityShiftRequest = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const request = await FacilityShiftRequestService.updateFacilityShiftRequest(id, req.body);
        res.json(request);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateFacilityShiftRequest = updateFacilityShiftRequest;
const deleteFacilityShiftRequest = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await FacilityShiftRequestService.deleteFacilityShiftRequest(id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteFacilityShiftRequest = deleteFacilityShiftRequest;
