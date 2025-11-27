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

