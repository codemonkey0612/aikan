import * as ResidentModel from "../models/resident.model";

export const getAllResidents = () => ResidentModel.getAllResidents();
export const getResidentById = (resident_id: string) =>
  ResidentModel.getResidentById(resident_id);
export const createResident = (data: ResidentModel.CreateResidentInput) =>
  ResidentModel.createResident(data);
export const updateResident = (
  resident_id: string,
  data: Partial<ResidentModel.CreateResidentInput>
) => ResidentModel.updateResident(resident_id, data);
export const deleteResident = (resident_id: string) =>
  ResidentModel.deleteResident(resident_id);

