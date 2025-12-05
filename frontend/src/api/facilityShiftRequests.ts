import { api } from "./axios";
import type { FacilityShiftRequest } from "./types";

export const getFacilityShiftRequests = (params?: {
  facility_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "scheduled";
}) => api.get<FacilityShiftRequest[]>("/facility-shift-requests", { params });

export const getFacilityShiftRequestById = (id: number) =>
  api.get<FacilityShiftRequest>(`/facility-shift-requests/${id}`);

export const getFacilityShiftRequestByFacilityAndMonth = (
  facility_id: string,
  year_month: string
) =>
  api.get<FacilityShiftRequest>(
    `/facility-shift-requests/facility/${facility_id}/month/${year_month}`
  );

export const createFacilityShiftRequest = (
  data: Partial<FacilityShiftRequest>
) => api.post<FacilityShiftRequest>("/facility-shift-requests", data);

export const updateFacilityShiftRequest = (
  id: number,
  data: Partial<FacilityShiftRequest>
) =>
  api.put<FacilityShiftRequest>(`/facility-shift-requests/${id}`, data);

export const deleteFacilityShiftRequest = (id: number) =>
  api.delete(`/facility-shift-requests/${id}`);

