import * as SalaryRuleModel from "../models/salaryRule.model";
import { getOrSetCache, invalidateCache, CACHE_KEYS } from "../utils/cache";

// 給与ルールのTTL: 2時間（マスターデータなので長め）
const SALARY_RULES_TTL = 7200;

export const getAllSalaryRules = () =>
  getOrSetCache(
    CACHE_KEYS.SALARY_RULES,
    () => SalaryRuleModel.getAllSalaryRules(),
    SALARY_RULES_TTL
  );

export const getSalaryRuleById = (id: number) =>
  getOrSetCache(
    CACHE_KEYS.SALARY_RULE(id),
    () => SalaryRuleModel.getSalaryRuleById(id),
    SALARY_RULES_TTL
  );

export const getSalaryRulesByType = async (rule_type: string) => {
  const cacheKey = `${CACHE_KEYS.SALARY_RULES}:type:${rule_type}`;
  return getOrSetCache(
    cacheKey,
    () => SalaryRuleModel.getSalaryRulesByType(rule_type),
    SALARY_RULES_TTL
  );
};

export const createSalaryRule = async (
  data: SalaryRuleModel.CreateSalaryRuleInput
) => {
  const rule = await SalaryRuleModel.createSalaryRule(data);
  // 給与ルールのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SALARY_RULES);
  if (data.rule_type) {
    await invalidateCache(`${CACHE_KEYS.SALARY_RULES}:type:${data.rule_type}`);
  }
  return rule;
};

export const updateSalaryRule = async (
  id: number,
  data: SalaryRuleModel.UpdateSalaryRuleInput
) => {
  const rule = await SalaryRuleModel.getSalaryRuleById(id);
  const updated = await SalaryRuleModel.updateSalaryRule(id, data);
  // 給与ルールのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SALARY_RULES);
  await invalidateCache(CACHE_KEYS.SALARY_RULE(id));
  if (rule?.rule_type) {
    await invalidateCache(`${CACHE_KEYS.SALARY_RULES}:type:${rule.rule_type}`);
  }
  if (data.rule_type) {
    await invalidateCache(`${CACHE_KEYS.SALARY_RULES}:type:${data.rule_type}`);
  }
  return updated;
};

export const deleteSalaryRule = async (id: number) => {
  const rule = await SalaryRuleModel.getSalaryRuleById(id);
  await SalaryRuleModel.deleteSalaryRule(id);
  // 給与ルールのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SALARY_RULES);
  await invalidateCache(CACHE_KEYS.SALARY_RULE(id));
  if (rule?.rule_type) {
    await invalidateCache(`${CACHE_KEYS.SALARY_RULES}:type:${rule.rule_type}`);
  }
};

