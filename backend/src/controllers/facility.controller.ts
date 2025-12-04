import { Request, Response } from "express";
import * as FacilityService from "../services/facility.service";

export const getAllFacilities = async (req: Request, res: Response) => {
  const facilities = await FacilityService.getAllFacilities();
  res.json(facilities);
};

export const getFacilityById = async (req: Request, res: Response) => {
  const facility = await FacilityService.getFacilityById(
    req.params.id // VARCHAR(50) - no conversion needed
  );
  res.json(facility);
};

export const createFacility = async (req: Request, res: Response) => {
  const created = await FacilityService.createFacility(req.body);
  res.status(201).json(created);
};

export const updateFacility = async (req: Request, res: Response) => {
  const updated = await FacilityService.updateFacility(
    req.params.id, // VARCHAR(50) - no conversion needed
    req.body
  );
  res.json(updated);
};

export const deleteFacility = async (req: Request, res: Response) => {
  await FacilityService.deleteFacility(req.params.id); // VARCHAR(50) - no conversion needed
  res.json({ message: "Deleted" });
};

