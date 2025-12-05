import * as SalaryModel from "../models/salary.model";
import { getOrSetCache, invalidateCache } from "../utils/cache";

const CACHE_KEY = "salaries";

export const getAllSalaries = async (filters?: {
  user_id?: number;
  nurse_id?: string;
  year_month?: string;
}) => {
  const cacheKey = `${CACHE_KEY}:${JSON.stringify(filters ?? {})}`;
  return getOrSetCache(cacheKey, async () => {
    return SalaryModel.getAllSalaries(filters);
  });
};

export const getSalaryById = async (id: number) => {
  const cacheKey = `${CACHE_KEY}:${id}`;
  return getOrSetCache(cacheKey, async () => {
    return SalaryModel.getSalaryById(id);
  });
};

export const createSalary = async (data: SalaryModel.SalaryInput) => {
  const result = await SalaryModel.createSalary(data);
  await invalidateCache(CACHE_KEY);
  return result;
};

export const updateSalary = async (
  id: number,
  data: Partial<SalaryModel.SalaryInput>
) => {
  const result = await SalaryModel.updateSalary(id, data);
  await invalidateCache(CACHE_KEY);
  return result;
};

export const deleteSalary = async (id: number) => {
  await SalaryModel.deleteSalary(id);
  await invalidateCache(CACHE_KEY);
};

