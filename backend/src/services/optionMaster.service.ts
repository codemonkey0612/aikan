import * as OptionMasterModel from "../models/optionMaster.model";
import { getOrSetCache, invalidateCache, CACHE_KEYS } from "../utils/cache";

// オプションマスターのTTL: 2時間（マスターデータなので長め）
const OPTION_MASTER_TTL = 7200;

export const getAllOptionMasters = () =>
  getOrSetCache(
    CACHE_KEYS.OPTION_MASTER,
    () => OptionMasterModel.getAllOptionMasters(),
    OPTION_MASTER_TTL
  );

export const getOptionMasterByCategory = async (category: string) => {
  // カテゴリ別のキャッシュキー
  const cacheKey = `${CACHE_KEYS.OPTION_MASTER}:${category}`;
  return getOrSetCache(
    cacheKey,
    () => OptionMasterModel.getOptionMasterByCategory(category),
    OPTION_MASTER_TTL
  );
};

export const getOptionMasterById = (id: number) =>
  OptionMasterModel.getOptionMasterById(id);

export const createOptionMaster = async (
  data: OptionMasterModel.CreateOptionMasterInput
) => {
  const option = await OptionMasterModel.createOptionMaster(data);
  // オプションマスターのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.OPTION_MASTER);
  await invalidateCache(`${CACHE_KEYS.OPTION_MASTER}:${data.category}`);
  return option;
};

export const updateOptionMaster = async (
  id: number,
  data: OptionMasterModel.UpdateOptionMasterInput
) => {
  const option = await OptionMasterModel.getOptionMasterById(id);
  const updated = await OptionMasterModel.updateOptionMaster(id, data);
  // オプションマスターのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.OPTION_MASTER);
  if (option) {
    await invalidateCache(`${CACHE_KEYS.OPTION_MASTER}:${option.category}`);
  }
  if (data.category) {
    await invalidateCache(`${CACHE_KEYS.OPTION_MASTER}:${data.category}`);
  }
  return updated;
};

export const deleteOptionMaster = async (id: number) => {
  const option = await OptionMasterModel.getOptionMasterById(id);
  await OptionMasterModel.deleteOptionMaster(id);
  // オプションマスターのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.OPTION_MASTER);
  if (option) {
    await invalidateCache(`${CACHE_KEYS.OPTION_MASTER}:${option.category}`);
  }
};

