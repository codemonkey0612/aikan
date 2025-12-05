import { Request, Response } from "express";
import * as NurseAvailabilityService from "../services/nurseAvailability.service";

export const getAllNurseAvailabilities = async (
  req: Request,
  res: Response
) => {
  try {
    const filters = {
      nurse_id: req.query.nurse_id as string | undefined,
      year_month: req.query.year_month as string | undefined,
      status: req.query.status as
        | "draft"
        | "submitted"
        | "approved"
        | undefined,
    };
    const availabilities =
      await NurseAvailabilityService.getAllNurseAvailabilities(filters);
    res.json(availabilities);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNurseAvailabilityById = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const availability =
      await NurseAvailabilityService.getNurseAvailabilityById(id);
    if (!availability) {
      return res.status(404).json({ error: "Availability not found" });
    }
    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNurseAvailabilityByNurseAndMonth = async (
  req: Request,
  res: Response
) => {
  try {
    const { nurse_id, year_month } = req.params;
    const availability =
      await NurseAvailabilityService.getNurseAvailabilityByNurseAndMonth(
        nurse_id,
        year_month
      );
    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createNurseAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const availability =
      await NurseAvailabilityService.createNurseAvailability(req.body);
    res.status(201).json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNurseAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    const availability = await NurseAvailabilityService.updateNurseAvailability(
      id,
      req.body
    );
    res.json(availability);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNurseAvailability = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id);
    await NurseAvailabilityService.deleteNurseAvailability(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

