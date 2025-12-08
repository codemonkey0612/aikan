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
exports.deleteShiftTemplate = exports.updateShiftTemplate = exports.createShiftTemplate = exports.getShiftTemplatesByFacility = exports.getShiftTemplateById = exports.getAllShiftTemplates = void 0;
const ShiftTemplateModel = __importStar(require("../models/shiftTemplate.model"));
const cache_1 = require("../utils/cache");
// シフトテンプレートのTTL: 1時間
const SHIFT_TEMPLATES_TTL = 3600;
const getAllShiftTemplates = () => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATES, () => ShiftTemplateModel.getAllShiftTemplates(), SHIFT_TEMPLATES_TTL);
exports.getAllShiftTemplates = getAllShiftTemplates;
const getShiftTemplateById = (id) => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATE(id), () => ShiftTemplateModel.getShiftTemplateById(id), SHIFT_TEMPLATES_TTL);
exports.getShiftTemplateById = getShiftTemplateById;
const getShiftTemplatesByFacility = async (facility_id) => {
    const cacheKey = `${cache_1.CACHE_KEYS.SHIFT_TEMPLATES}:facility:${facility_id}`;
    return (0, cache_1.getOrSetCache)(cacheKey, () => ShiftTemplateModel.getShiftTemplatesByFacility(facility_id), SHIFT_TEMPLATES_TTL);
};
exports.getShiftTemplatesByFacility = getShiftTemplatesByFacility;
const createShiftTemplate = async (data) => {
    const template = await ShiftTemplateModel.createShiftTemplate(data);
    // シフトテンプレートのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATES);
    if (data.facility_id) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SHIFT_TEMPLATES}:facility:${data.facility_id}`);
    }
    return template;
};
exports.createShiftTemplate = createShiftTemplate;
const updateShiftTemplate = async (id, data) => {
    const template = await ShiftTemplateModel.getShiftTemplateById(id);
    const updated = await ShiftTemplateModel.updateShiftTemplate(id, data);
    // シフトテンプレートのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATES);
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATE(id));
    if (template?.facility_id) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SHIFT_TEMPLATES}:facility:${template.facility_id}`);
    }
    if (data.facility_id) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SHIFT_TEMPLATES}:facility:${data.facility_id}`);
    }
    return updated;
};
exports.updateShiftTemplate = updateShiftTemplate;
const deleteShiftTemplate = async (id) => {
    const template = await ShiftTemplateModel.getShiftTemplateById(id);
    await ShiftTemplateModel.deleteShiftTemplate(id);
    // シフトテンプレートのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATES);
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SHIFT_TEMPLATE(id));
    if (template?.facility_id) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SHIFT_TEMPLATES}:facility:${template.facility_id}`);
    }
};
exports.deleteShiftTemplate = deleteShiftTemplate;
