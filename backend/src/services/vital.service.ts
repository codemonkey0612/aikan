import * as VitalModel from "../models/vital.model";

export const getAllVitals = () => VitalModel.getAllVitals();
export const getVitalById = (id: number) => VitalModel.getVitalById(id);
export const createVital = (data: VitalModel.VitalInput) =>
  VitalModel.createVital(data);
export const updateVital = (
  id: number,
  data: Partial<VitalModel.VitalInput>
) => VitalModel.updateVital(id, data);
export const deleteVital = (id: number) => VitalModel.deleteVital(id);

export const getVitalsPaginated = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: {
    resident_id?: number;
    measured_from?: string;
    measured_to?: string;
    created_by?: number;
  }
) => VitalModel.getVitalsPaginated(page, limit, sortBy, sortOrder, filters);

