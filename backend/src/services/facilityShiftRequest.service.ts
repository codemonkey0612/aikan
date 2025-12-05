import * as FacilityShiftRequestModel from "../models/facilityShiftRequest.model";
import { getOrSetCache, invalidateCache } from "../utils/cache";

const CACHE_KEY = "facility_shift_requests";

export const getAllFacilityShiftRequests = async (filters?: {
  facility_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "scheduled";
}) => {
  const cacheKey = `${CACHE_KEY}:${JSON.stringify(filters ?? {})}`;
  return getOrSetCache(cacheKey, async () => {
    return FacilityShiftRequestModel.getAllFacilityShiftRequests(filters);
  });
};

export const getFacilityShiftRequestById = async (id: number) => {
  const cacheKey = `${CACHE_KEY}:${id}`;
  return getOrSetCache(cacheKey, async () => {
    return FacilityShiftRequestModel.getFacilityShiftRequestById(id);
  });
};

export const getFacilityShiftRequestByFacilityAndMonth = async (
  facility_id: string,
  year_month: string
) => {
  const cacheKey = `${CACHE_KEY}:${facility_id}:${year_month}`;
  return getOrSetCache(cacheKey, async () => {
    return FacilityShiftRequestModel.getFacilityShiftRequestByFacilityAndMonth(
      facility_id,
      year_month
    );
  });
};

export const createFacilityShiftRequest = async (
  data: FacilityShiftRequestModel.CreateFacilityShiftRequestInput
) => {
  const result = await FacilityShiftRequestModel.createFacilityShiftRequest(
    data
  );
  await invalidateCache(CACHE_KEY);
  return result;
};

export const updateFacilityShiftRequest = async (
  id: number,
  data: FacilityShiftRequestModel.UpdateFacilityShiftRequestInput
) => {
  const result = await FacilityShiftRequestModel.updateFacilityShiftRequest(
    id,
    data
  );
  await invalidateCache(CACHE_KEY);
  return result;
};

export const deleteFacilityShiftRequest = async (id: number) => {
  await FacilityShiftRequestModel.deleteFacilityShiftRequest(id);
  await invalidateCache(CACHE_KEY);
};

