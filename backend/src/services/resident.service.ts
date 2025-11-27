import * as ResidentModel from "../models/resident.model";

export const getAllResidents = () => ResidentModel.getAllResidents();
export const getResidentById = (id: number) =>
  ResidentModel.getResidentById(id);
export const createResident = (data: ResidentModel.ResidentInput) =>
  ResidentModel.createResident(data);
export const updateResident = (
  id: number,
  data: Partial<ResidentModel.ResidentInput>
) => ResidentModel.updateResident(id, data);
export const deleteResident = (id: number) =>
  ResidentModel.deleteResident(id);

