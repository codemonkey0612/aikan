import * as VisitModel from "../models/visit.model";

export const getAllVisits = () => VisitModel.getAllVisits();
export const getVisitById = (id: number) => VisitModel.getVisitById(id);
export const createVisit = (data: VisitModel.VisitInput) =>
  VisitModel.createVisit(data);
export const updateVisit = (
  id: number,
  data: Partial<VisitModel.VisitInput>
) => VisitModel.updateVisit(id, data);
export const deleteVisit = (id: number) => VisitModel.deleteVisit(id);

export const getVisitsPaginated = (
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: "asc" | "desc",
  filters?: {
    shift_id?: number;
    resident_id?: number;
    visited_from?: string;
    visited_to?: string;
  }
) => VisitModel.getVisitsPaginated(page, limit, sortBy, sortOrder, filters);

