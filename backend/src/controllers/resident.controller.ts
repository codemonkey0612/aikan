import { Request, Response } from "express";
import * as ResidentService from "../services/resident.service";

export const getAllResidents = async (req: Request, res: Response) => {
  const residents = await ResidentService.getAllResidents();
  res.json(residents);
};

export const getResidentById = async (req: Request, res: Response) => {
  const resident = await ResidentService.getResidentById(
    req.params.id // VARCHAR(50) - no conversion needed
  );
  res.json(resident);
};

export const createResident = async (req: Request, res: Response) => {
  const created = await ResidentService.createResident(req.body);
  res.status(201).json(created);
};

export const updateResident = async (req: Request, res: Response) => {
  const updated = await ResidentService.updateResident(
    req.params.id, // VARCHAR(50) - no conversion needed
    req.body
  );
  res.json(updated);
};

export const deleteResident = async (req: Request, res: Response) => {
  await ResidentService.deleteResident(req.params.id); // VARCHAR(50) - no conversion needed
  res.json({ message: "Deleted" });
};

