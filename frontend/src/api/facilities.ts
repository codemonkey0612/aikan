import { api } from "./axios";

export const getFacilities = () => api.get("/facilities");
export const getFacilityById = (facility_id: string) => api.get(`/facilities/${facility_id}`);
export const createFacility = (data: any) => api.post("/facilities", data);
export const updateFacility = (facility_id: string, data: any) =>
  api.put(`/facilities/${facility_id}`, data);
export const deleteFacility = (facility_id: string) => api.delete(`/facilities/${facility_id}`);
