import { Request, Response } from "express";
import * as FacilityShiftRequestService from "../services/facilityShiftRequest.service";

export const getAllFacilityShiftRequests = async (
  req: Request,
  res: Response
) => {
  try {
    const filters = {
      facility_id: req.query.facility_id as string | undefined,
      year_month: req.query.year_month as string | undefined,
      status: req.query.status as
        | "draft"
        | "submitted"
        | "scheduled"
        | undefined,
    };
    const requests =
      await FacilityShiftRequestService.getAllFacilityShiftRequests(filters);
    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFacilityShiftRequestById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const request =
      await FacilityShiftRequestService.getFacilityShiftRequestById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFacilityShiftRequestByFacilityAndMonth = async (
  req: Request,
  res: Response
) => {
  try {
    const { facility_id, year_month } = req.params;
    const request =
      await FacilityShiftRequestService.getFacilityShiftRequestByFacilityAndMonth(
        facility_id,
        year_month
      );
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createFacilityShiftRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const request =
      await FacilityShiftRequestService.createFacilityShiftRequest(req.body);
    res.status(201).json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFacilityShiftRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const request =
      await FacilityShiftRequestService.updateFacilityShiftRequest(
        id,
        req.body
      );
    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteFacilityShiftRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    await FacilityShiftRequestService.deleteFacilityShiftRequest(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

