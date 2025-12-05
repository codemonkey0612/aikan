import { api } from "./axios";

export const getCorporations = () => api.get("/corporations");
export const getCorporationById = (corporation_id: string) => api.get(`/corporations/${corporation_id}`);
export const createCorporation = (data: any) => api.post("/corporations", data);
export const updateCorporation = (corporation_id: string, data: any) =>
  api.put(`/corporations/${corporation_id}`, data);
export const deleteCorporation = (corporation_id: string) => api.delete(`/corporations/${corporation_id}`);



