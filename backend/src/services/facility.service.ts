import * as FacilityModel from "../models/facility.model";
import { getOrSetCache, invalidateCache, CACHE_KEYS } from "../utils/cache";

// 施設一覧のTTL: 1時間
const FACILITIES_TTL = 3600;
// 個別施設のTTL: 30分
const FACILITY_TTL = 1800;

export const getAllFacilities = () =>
  getOrSetCache(
    CACHE_KEYS.FACILITIES,
    () => FacilityModel.getAllFacilities(),
    FACILITIES_TTL
  );

export const getFacilityById = (id: number) =>
  getOrSetCache(
    CACHE_KEYS.FACILITY(id),
    () => FacilityModel.getFacilityById(id),
    FACILITY_TTL
  );

export const createFacility = async (data: FacilityModel.CreateFacilityInput) => {
  const facility = await FacilityModel.createFacility(data);
  // 施設一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.FACILITIES);
  return facility;
};

export const updateFacility = async (
  id: number,
  data: FacilityModel.UpdateFacilityInput
) => {
  const facility = await FacilityModel.updateFacility(id, data);
  // 該当施設と施設一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.FACILITY(id));
  await invalidateCache(CACHE_KEYS.FACILITIES);
  return facility;
};

export const deleteFacility = async (id: number) => {
  await FacilityModel.deleteFacility(id);
  // 該当施設と施設一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.FACILITY(id));
  await invalidateCache(CACHE_KEYS.FACILITIES);
};

