import * as CorporationModel from "../models/corporation.model";
import { getOrSetCache, invalidateCache, CACHE_KEYS } from "../utils/cache";

// 法人一覧のTTL: 1時間
const CORPORATIONS_TTL = 3600;
// 個別法人のTTL: 30分
const CORPORATION_TTL = 1800;

export const getAllCorporations = () =>
  getOrSetCache(
    CACHE_KEYS.CORPORATIONS,
    () => CorporationModel.getAllCorporations(),
    CORPORATIONS_TTL
  );

export const getCorporationById = (corporation_id: string) =>
  getOrSetCache(
    CACHE_KEYS.CORPORATION(corporation_id),
    () => CorporationModel.getCorporationById(corporation_id),
    CORPORATION_TTL
  );

export const createCorporation = async (data: CorporationModel.CreateCorporationInput) => {
  const corporation = await CorporationModel.createCorporation(data);
  // 法人一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.CORPORATIONS);
  return corporation;
};

export const updateCorporation = async (
  corporation_id: string,
  data: CorporationModel.UpdateCorporationInput
) => {
  const corporation = await CorporationModel.updateCorporation(corporation_id, data);
  // 該当法人と法人一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.CORPORATION(corporation_id));
  await invalidateCache(CACHE_KEYS.CORPORATIONS);
  return corporation;
};

export const deleteCorporation = async (corporation_id: string) => {
  await CorporationModel.deleteCorporation(corporation_id);
  // 該当法人と法人一覧のキャッシュを無効化
  await invalidateCache(CACHE_KEYS.CORPORATION(corporation_id));
  await invalidateCache(CACHE_KEYS.CORPORATIONS);
};



