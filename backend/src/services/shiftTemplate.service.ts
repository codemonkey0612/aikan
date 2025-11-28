import * as ShiftTemplateModel from "../models/shiftTemplate.model";
import { getOrSetCache, invalidateCache, CACHE_KEYS } from "../utils/cache";

// シフトテンプレートのTTL: 1時間
const SHIFT_TEMPLATES_TTL = 3600;

export const getAllShiftTemplates = () =>
  getOrSetCache(
    CACHE_KEYS.SHIFT_TEMPLATES,
    () => ShiftTemplateModel.getAllShiftTemplates(),
    SHIFT_TEMPLATES_TTL
  );

export const getShiftTemplateById = (id: number) =>
  getOrSetCache(
    CACHE_KEYS.SHIFT_TEMPLATE(id),
    () => ShiftTemplateModel.getShiftTemplateById(id),
    SHIFT_TEMPLATES_TTL
  );

export const getShiftTemplatesByFacility = async (facility_id: number) => {
  const cacheKey = `${CACHE_KEYS.SHIFT_TEMPLATES}:facility:${facility_id}`;
  return getOrSetCache(
    cacheKey,
    () => ShiftTemplateModel.getShiftTemplatesByFacility(facility_id),
    SHIFT_TEMPLATES_TTL
  );
};

export const createShiftTemplate = async (
  data: ShiftTemplateModel.CreateShiftTemplateInput
) => {
  const template = await ShiftTemplateModel.createShiftTemplate(data);
  // シフトテンプレートのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATES);
  if (data.facility_id) {
    await invalidateCache(
      `${CACHE_KEYS.SHIFT_TEMPLATES}:facility:${data.facility_id}`
    );
  }
  return template;
};

export const updateShiftTemplate = async (
  id: number,
  data: ShiftTemplateModel.UpdateShiftTemplateInput
) => {
  const template = await ShiftTemplateModel.getShiftTemplateById(id);
  const updated = await ShiftTemplateModel.updateShiftTemplate(id, data);
  // シフトテンプレートのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATES);
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATE(id));
  if (template?.facility_id) {
    await invalidateCache(
      `${CACHE_KEYS.SHIFT_TEMPLATES}:facility:${template.facility_id}`
    );
  }
  if (data.facility_id) {
    await invalidateCache(
      `${CACHE_KEYS.SHIFT_TEMPLATES}:facility:${data.facility_id}`
    );
  }
  return updated;
};

export const deleteShiftTemplate = async (id: number) => {
  const template = await ShiftTemplateModel.getShiftTemplateById(id);
  await ShiftTemplateModel.deleteShiftTemplate(id);
  // シフトテンプレートのキャッシュを無効化
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATES);
  await invalidateCache(CACHE_KEYS.SHIFT_TEMPLATE(id));
  if (template?.facility_id) {
    await invalidateCache(
      `${CACHE_KEYS.SHIFT_TEMPLATES}:facility:${template.facility_id}`
    );
  }
};

