import * as VitalModel from "../models/vital.model";
import * as VitalAlertService from "./vitalAlert.service";

export const getAllVitals = () => VitalModel.getAllVitals();
export const getVitalById = (id: number) => VitalModel.getVitalById(id);
export const createVital = async (data: VitalModel.VitalInput) => {
  const vital = await VitalModel.createVital(data);
  // バイタル記録作成後、アラートをチェック
  if (vital) {
    await VitalAlertService.checkVitalAlerts(vital.id);
  }
  return vital;
};
export const updateVital = async (
  id: number,
  data: Partial<VitalModel.VitalInput>
) => {
  const vital = await VitalModel.updateVital(id, data);
  // バイタル記録更新後、アラートをチェック
  if (vital) {
    await VitalAlertService.checkVitalAlerts(vital.id);
  }
  return vital;
};
export const deleteVital = (id: number) => VitalModel.deleteVital(id);

export const getVitalsPaginated = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: {
    resident_id?: string;
    measured_from?: string;
    measured_to?: string;
    created_by?: number;
  }
) => VitalModel.getVitalsPaginated(page, limit, sortBy, sortOrder, filters);

