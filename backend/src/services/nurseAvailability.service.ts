import * as NurseAvailabilityModel from "../models/nurseAvailability.model";
import { getOrSetCache, invalidateCache } from "../utils/cache";

const CACHE_KEY = "nurse_availability";

export const getAllNurseAvailabilities = async (filters?: {
  nurse_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "approved";
}) => {
  const cacheKey = `${CACHE_KEY}:${JSON.stringify(filters ?? {})}`;
  return getOrSetCache(cacheKey, async () => {
    return NurseAvailabilityModel.getAllNurseAvailabilities(filters);
  });
};

export const getNurseAvailabilityById = async (id: number) => {
  const cacheKey = `${CACHE_KEY}:${id}`;
  return getOrSetCache(cacheKey, async () => {
    return NurseAvailabilityModel.getNurseAvailabilityById(id);
  });
};

export const getNurseAvailabilityByNurseAndMonth = async (
  nurse_id: string,
  year_month: string
) => {
  const cacheKey = `${CACHE_KEY}:${nurse_id}:${year_month}`;
  return getOrSetCache(cacheKey, async () => {
    return NurseAvailabilityModel.getNurseAvailabilityByNurseAndMonth(
      nurse_id,
      year_month
    );
  });
};

export const createNurseAvailability = async (
  data: NurseAvailabilityModel.CreateNurseAvailabilityInput
) => {
  const result = await NurseAvailabilityModel.createNurseAvailability(data);
  await invalidateCache(CACHE_KEY);
  return result;
};

export const updateNurseAvailability = async (
  id: number,
  data: NurseAvailabilityModel.UpdateNurseAvailabilityInput
) => {
  const result = await NurseAvailabilityModel.updateNurseAvailability(
    id,
    data
  );
  await invalidateCache(CACHE_KEY);
  return result;
};

export const deleteNurseAvailability = async (id: number) => {
  await NurseAvailabilityModel.deleteNurseAvailability(id);
  await invalidateCache(CACHE_KEY);
};

