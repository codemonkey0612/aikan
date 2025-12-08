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
exports.deleteSalarySetting = exports.updateSalarySetting = exports.createSalarySetting = exports.getSalarySettingByKey = exports.getAllSalarySettings = void 0;
const SalarySettingService = __importStar(require("../services/salarySetting.service"));
const getAllSalarySettings = async (req, res) => {
    try {
        const settings = await SalarySettingService.getAllSalarySettings();
        res.json({ data: settings });
    }
    catch (error) {
        console.error("Error in getAllSalarySettings:", error);
        res.status(500).json({ error: error.message || "Failed to fetch salary settings" });
    }
};
exports.getAllSalarySettings = getAllSalarySettings;
const getSalarySettingByKey = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await SalarySettingService.getSalarySettingByKey(key);
        if (!setting) {
            return res.status(404).json({ error: "Setting not found" });
        }
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSalarySettingByKey = getSalarySettingByKey;
const createSalarySetting = async (req, res) => {
    try {
        const setting = await SalarySettingService.createSalarySetting(req.body);
        res.status(201).json(setting);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createSalarySetting = createSalarySetting;
const updateSalarySetting = async (req, res) => {
    try {
        const { key } = req.params;
        const setting = await SalarySettingService.updateSalarySetting(key, req.body);
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateSalarySetting = updateSalarySetting;
const deleteSalarySetting = async (req, res) => {
    try {
        const { key } = req.params;
        await SalarySettingService.deleteSalarySetting(key);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteSalarySetting = deleteSalarySetting;
