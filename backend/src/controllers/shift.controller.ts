import { Request, Response } from "express";
import * as ShiftService from "../services/shift.service";

export const getAllShifts = async (req: Request, res: Response) => {
  const shifts = await ShiftService.getAllShifts();
  res.json(shifts);
};

export const getShiftById = async (req: Request, res: Response) => {
  const shift = await ShiftService.getShiftById(Number(req.params.id));
  res.json(shift);
};

export const createShift = async (req: Request, res: Response) => {
  const created = await ShiftService.createShift(req.body);
  res.status(201).json(created);
};

export const updateShift = async (req: Request, res: Response) => {
  const updated = await ShiftService.updateShift(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteShift = async (req: Request, res: Response) => {
  await ShiftService.deleteShift(Number(req.params.id));
  res.json({ message: "Deleted" });
};

