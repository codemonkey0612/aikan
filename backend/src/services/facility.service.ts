import * as FacilityModel from "../models/facility.model";

export const getAllFacilities = () => FacilityModel.getAllFacilities();
export const getFacilityById = (id: number) =>
  FacilityModel.getFacilityById(id);
export const createFacility = (data: FacilityModel.FacilityInput) =>
  FacilityModel.createFacility(data);
export const updateFacility = (
  id: number,
  data: Partial<FacilityModel.FacilityInput>
) => FacilityModel.updateFacility(id, data);
export const deleteFacility = (id: number) =>
  FacilityModel.deleteFacility(id);

