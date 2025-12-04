import { api } from "./axios";

export const getResidents = (facilityId?: string) =>
  api.get("/residents", { params: { facilityId } });

export const getResidentById = (resident_id: string) => api.get(`/residents/${resident_id}`);

export const createResident = (data: any) => api.post("/residents", data);

export const updateResident = (resident_id: string, data: any) =>
  api.put(`/residents/${resident_id}`, data);

export const deleteResident = (resident_id: string) =>
  api.delete(`/residents/${resident_id}`);
