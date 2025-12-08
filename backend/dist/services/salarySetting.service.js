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
const SalarySettingModel = __importStar(require("../models/salarySetting.model"));
const cache_1 = require("../utils/cache");
const CACHE_KEY = "salary_settings";
const getAllSalarySettings = async () => {
    return (0, cache_1.getOrSetCache)(CACHE_KEY, async () => {
        return SalarySettingModel.getAllSalarySettings();
    });
};
exports.getAllSalarySettings = getAllSalarySettings;
const getSalarySettingByKey = async (setting_key) => {
    const cacheKey = `${CACHE_KEY}:${setting_key}`;
    return (0, cache_1.getOrSetCache)(cacheKey, async () => {
        return SalarySettingModel.getSalarySettingByKey(setting_key);
    });
};
exports.getSalarySettingByKey = getSalarySettingByKey;
const createSalarySetting = async (data) => {
    const result = await SalarySettingModel.createSalarySetting(data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.createSalarySetting = createSalarySetting;
const updateSalarySetting = async (setting_key, data) => {
    const result = await SalarySettingModel.updateSalarySetting(setting_key, data);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
    return result;
};
exports.updateSalarySetting = updateSalarySetting;
const deleteSalarySetting = async (setting_key) => {
    await SalarySettingModel.deleteSalarySetting(setting_key);
    await (0, cache_1.invalidateCache)(CACHE_KEY);
};
exports.deleteSalarySetting = deleteSalarySetting;
