import { Request, Response } from "express";
import * as CorporationService from "../services/corporation.service";

export const getAllCorporations = async (req: Request, res: Response) => {
  const corporations = await CorporationService.getAllCorporations();
  res.json(corporations);
};

export const getCorporationById = async (req: Request, res: Response) => {
  const corporation = await CorporationService.getCorporationById(
    req.params.id // VARCHAR(20) - no conversion needed
  );
  res.json(corporation);
};

export const createCorporation = async (req: Request, res: Response) => {
  const created = await CorporationService.createCorporation(req.body);
  res.status(201).json(created);
};

export const updateCorporation = async (req: Request, res: Response) => {
  const updated = await CorporationService.updateCorporation(
    req.params.id, // VARCHAR(20) - no conversion needed
    req.body
  );
  res.json(updated);
};

export const deleteCorporation = async (req: Request, res: Response) => {
  await CorporationService.deleteCorporation(req.params.id); // VARCHAR(20) - no conversion needed
  res.json({ message: "Deleted" });
};



