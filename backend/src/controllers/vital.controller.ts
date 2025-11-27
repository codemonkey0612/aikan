import { Request, Response } from "express";
import * as VitalService from "../services/vital.service";

export const getAllVitals = async (req: Request, res: Response) => {
  const vitals = await VitalService.getAllVitals();
  res.json(vitals);
};

export const getVitalById = async (req: Request, res: Response) => {
  const vital = await VitalService.getVitalById(Number(req.params.id));
  res.json(vital);
};

export const createVital = async (req: Request, res: Response) => {
  const created = await VitalService.createVital(req.body);
  res.status(201).json(created);
};

export const updateVital = async (req: Request, res: Response) => {
  const updated = await VitalService.updateVital(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteVital = async (req: Request, res: Response) => {
  await VitalService.deleteVital(Number(req.params.id));
  res.json({ message: "Deleted" });
};

