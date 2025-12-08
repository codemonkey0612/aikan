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
const CorporationModel = __importStar(require("../models/corporation.model"));
const cache_1 = require("../utils/cache");
// 法人一覧のTTL: 1時間
const CORPORATIONS_TTL = 3600;
// 個別法人のTTL: 30分
const CORPORATION_TTL = 1800;
const getAllCorporations = () => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.CORPORATIONS, () => CorporationModel.getAllCorporations(), CORPORATIONS_TTL);
exports.getAllCorporations = getAllCorporations;
const getCorporationById = (corporation_id) => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.CORPORATION(corporation_id), () => CorporationModel.getCorporationById(corporation_id), CORPORATION_TTL);
exports.getCorporationById = getCorporationById;
const createCorporation = async (data) => {
    const corporation = await CorporationModel.createCorporation(data);
    // 法人一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.CORPORATIONS);
    return corporation;
};
exports.createCorporation = createCorporation;
const updateCorporation = async (corporation_id, data) => {
    const corporation = await CorporationModel.updateCorporation(corporation_id, data);
    // 該当法人と法人一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.CORPORATION(corporation_id));
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.CORPORATIONS);
    return corporation;
};
exports.updateCorporation = updateCorporation;
const deleteCorporation = async (corporation_id) => {
    await CorporationModel.deleteCorporation(corporation_id);
    // 該当法人と法人一覧のキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.CORPORATION(corporation_id));
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.CORPORATIONS);
};
exports.deleteCorporation = deleteCorporation;
