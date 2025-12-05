import * as SalarySettingModel from "../models/salarySetting.model";
import { getOrSetCache, invalidateCache } from "../utils/cache";

const CACHE_KEY = "salary_settings";

export const getAllSalarySettings = async () => {
  return getOrSetCache(CACHE_KEY, async () => {
    return SalarySettingModel.getAllSalarySettings();
  });
};

export const getSalarySettingByKey = async (setting_key: string) => {
  const cacheKey = `${CACHE_KEY}:${setting_key}`;
  return getOrSetCache(cacheKey, async () => {
    return SalarySettingModel.getSalarySettingByKey(setting_key);
  });
};

export const createSalarySetting = async (
  data: SalarySettingModel.CreateSalarySettingInput
) => {
  const result = await SalarySettingModel.createSalarySetting(data);
  await invalidateCache(CACHE_KEY);
  return result;
};

export const updateSalarySetting = async (
  setting_key: string,
  data: SalarySettingModel.UpdateSalarySettingInput
) => {
  const result = await SalarySettingModel.updateSalarySetting(
    setting_key,
    data
  );
  await invalidateCache(CACHE_KEY);
  return result;
};

export const deleteSalarySetting = async (setting_key: string) => {
  await SalarySettingModel.deleteSalarySetting(setting_key);
  await invalidateCache(CACHE_KEY);
};

