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
exports.deleteOptionMaster = exports.updateOptionMaster = exports.createOptionMaster = exports.getOptionMasterById = exports.getOptionMasterByCategory = exports.getAllOptionMasters = void 0;
const OptionMasterModel = __importStar(require("../models/optionMaster.model"));
const cache_1 = require("../utils/cache");
// オプションマスターのTTL: 2時間（マスターデータなので長め）
const OPTION_MASTER_TTL = 7200;
const getAllOptionMasters = () => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.OPTION_MASTER, () => OptionMasterModel.getAllOptionMasters(), OPTION_MASTER_TTL);
exports.getAllOptionMasters = getAllOptionMasters;
const getOptionMasterByCategory = async (category) => {
    // カテゴリ別のキャッシュキー
    const cacheKey = `${cache_1.CACHE_KEYS.OPTION_MASTER}:${category}`;
    return (0, cache_1.getOrSetCache)(cacheKey, () => OptionMasterModel.getOptionMasterByCategory(category), OPTION_MASTER_TTL);
};
exports.getOptionMasterByCategory = getOptionMasterByCategory;
const getOptionMasterById = (id) => OptionMasterModel.getOptionMasterById(id);
exports.getOptionMasterById = getOptionMasterById;
const createOptionMaster = async (data) => {
    const option = await OptionMasterModel.createOptionMaster(data);
    // オプションマスターのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.OPTION_MASTER);
    await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.OPTION_MASTER}:${data.category}`);
    return option;
};
exports.createOptionMaster = createOptionMaster;
const updateOptionMaster = async (id, data) => {
    const option = await OptionMasterModel.getOptionMasterById(id);
    const updated = await OptionMasterModel.updateOptionMaster(id, data);
    // オプションマスターのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.OPTION_MASTER);
    if (option) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.OPTION_MASTER}:${option.category}`);
    }
    if (data.category) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.OPTION_MASTER}:${data.category}`);
    }
    return updated;
};
exports.updateOptionMaster = updateOptionMaster;
const deleteOptionMaster = async (id) => {
    const option = await OptionMasterModel.getOptionMasterById(id);
    await OptionMasterModel.deleteOptionMaster(id);
    // オプションマスターのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.OPTION_MASTER);
    if (option) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.OPTION_MASTER}:${option.category}`);
    }
};
exports.deleteOptionMaster = deleteOptionMaster;
