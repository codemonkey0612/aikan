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

export const getShiftsPaginated = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: {
    nurse_id?: string; // VARCHAR(100)
    facility_id?: string; // VARCHAR(50)
    shift_period?: string;
    date_from?: string;
    date_to?: string;
  }
) => ShiftModel.getShiftsPaginated(page, limit, sortBy, sortOrder, filters);

