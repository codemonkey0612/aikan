import { api } from "./axios";
import type { NurseAvailability } from "./types";

export const getNurseAvailabilities = (params?: {
  nurse_id?: string;
  year_month?: string;
  status?: "draft" | "submitted" | "approved";
}) => api.get<NurseAvailability[]>("/nurse-availability", { params });

export const getNurseAvailabilityById = (id: number) =>
  api.get<NurseAvailability>(`/nurse-availability/${id}`);

export const getNurseAvailabilityByNurseAndMonth = (
  nurse_id: string,
  year_month: string
) =>
  api.get<NurseAvailability>(
    `/nurse-availability/nurse/${nurse_id}/month/${year_month}`
  );

export const createNurseAvailability = (data: Partial<NurseAvailability>) =>
  api.post<NurseAvailability>("/nurse-availability", data);

export const updateNurseAvailability = (
  id: number,
  data: Partial<NurseAvailability>
) => api.put<NurseAvailability>(`/nurse-availability/${id}`, data);

export const deleteNurseAvailability = (id: number) =>
  api.delete(`/nurse-availability/${id}`);

