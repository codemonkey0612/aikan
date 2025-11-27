import * as ShiftModel from "../models/shift.model";

export const getAllShifts = () => ShiftModel.getAllShifts();
export const getShiftById = (id: number) => ShiftModel.getShiftById(id);
export const createShift = (data: ShiftModel.ShiftInput) =>
  ShiftModel.createShift(data);
export const updateShift = (
  id: number,
  data: Partial<ShiftModel.ShiftInput>
) => ShiftModel.updateShift(id, data);
export const deleteShift = (id: number) => ShiftModel.deleteShift(id);

