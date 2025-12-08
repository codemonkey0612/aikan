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
exports.deleteSalaryRule = exports.updateSalaryRule = exports.createSalaryRule = exports.getSalaryRulesByType = exports.getSalaryRuleById = exports.getAllSalaryRules = void 0;
const SalaryRuleModel = __importStar(require("../models/salaryRule.model"));
const cache_1 = require("../utils/cache");
// 給与ルールのTTL: 2時間（マスターデータなので長め）
const SALARY_RULES_TTL = 7200;
const getAllSalaryRules = () => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.SALARY_RULES, () => SalaryRuleModel.getAllSalaryRules(), SALARY_RULES_TTL);
exports.getAllSalaryRules = getAllSalaryRules;
const getSalaryRuleById = (id) => (0, cache_1.getOrSetCache)(cache_1.CACHE_KEYS.SALARY_RULE(id), () => SalaryRuleModel.getSalaryRuleById(id), SALARY_RULES_TTL);
exports.getSalaryRuleById = getSalaryRuleById;
const getSalaryRulesByType = async (rule_type) => {
    const cacheKey = `${cache_1.CACHE_KEYS.SALARY_RULES}:type:${rule_type}`;
    return (0, cache_1.getOrSetCache)(cacheKey, () => SalaryRuleModel.getSalaryRulesByType(rule_type), SALARY_RULES_TTL);
};
exports.getSalaryRulesByType = getSalaryRulesByType;
const createSalaryRule = async (data) => {
    const rule = await SalaryRuleModel.createSalaryRule(data);
    // 給与ルールのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SALARY_RULES);
    if (data.rule_type) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SALARY_RULES}:type:${data.rule_type}`);
    }
    return rule;
};
exports.createSalaryRule = createSalaryRule;
const updateSalaryRule = async (id, data) => {
    const rule = await SalaryRuleModel.getSalaryRuleById(id);
    const updated = await SalaryRuleModel.updateSalaryRule(id, data);
    // 給与ルールのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SALARY_RULES);
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SALARY_RULE(id));
    if (rule?.rule_type) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SALARY_RULES}:type:${rule.rule_type}`);
    }
    if (data.rule_type) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SALARY_RULES}:type:${data.rule_type}`);
    }
    return updated;
};
exports.updateSalaryRule = updateSalaryRule;
const deleteSalaryRule = async (id) => {
    const rule = await SalaryRuleModel.getSalaryRuleById(id);
    await SalaryRuleModel.deleteSalaryRule(id);
    // 給与ルールのキャッシュを無効化
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SALARY_RULES);
    await (0, cache_1.invalidateCache)(cache_1.CACHE_KEYS.SALARY_RULE(id));
    if (rule?.rule_type) {
        await (0, cache_1.invalidateCache)(`${cache_1.CACHE_KEYS.SALARY_RULES}:type:${rule.rule_type}`);
    }
};
exports.deleteSalaryRule = deleteSalaryRule;
