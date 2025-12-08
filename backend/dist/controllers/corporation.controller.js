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
exports.deleteCorporation = exports.updateCorporation = exports.createCorporation = exports.getCorporationById = exports.getAllCorporations = void 0;
const CorporationService = __importStar(require("../services/corporation.service"));
const getAllCorporations = async (req, res) => {
    const corporations = await CorporationService.getAllCorporations();
    res.json(corporations);
};
exports.getAllCorporations = getAllCorporations;
const getCorporationById = async (req, res) => {
    const corporation = await CorporationService.getCorporationById(req.params.id // VARCHAR(20) - no conversion needed
    );
    res.json(corporation);
};
exports.getCorporationById = getCorporationById;
const createCorporation = async (req, res) => {
    const created = await CorporationService.createCorporation(req.body);
    res.status(201).json(created);
};
exports.createCorporation = createCorporation;
const updateCorporation = async (req, res) => {
    const updated = await CorporationService.updateCorporation(req.params.id, // VARCHAR(20) - no conversion needed
    req.body);
    res.json(updated);
};
exports.updateCorporation = updateCorporation;
const deleteCorporation = async (req, res) => {
    await CorporationService.deleteCorporation(req.params.id); // VARCHAR(20) - no conversion needed
    res.json({ message: "Deleted" });
};
exports.deleteCorporation = deleteCorporation;
