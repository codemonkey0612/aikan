import { Request, Response } from "express";
import * as SalarySettingService from "../services/salarySetting.service";

export const getAllSalarySettings = async (req: Request, res: Response) => {
  try {
    const settings = await SalarySettingService.getAllSalarySettings();
    res.json({ data: settings });
  } catch (error: any) {
    console.error("Error in getAllSalarySettings:", error);
    res.status(500).json({ error: error.message || "Failed to fetch salary settings" });
  }
};

export const getSalarySettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await SalarySettingService.getSalarySettingByKey(key);
    if (!setting) {
      return res.status(404).json({ error: "Setting not found" });
    }
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createSalarySetting = async (req: Request, res: Response) => {
  try {
    const setting = await SalarySettingService.createSalarySetting(req.body);
    res.status(201).json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSalarySetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const setting = await SalarySettingService.updateSalarySetting(
      key,
      req.body
    );
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSalarySetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    await SalarySettingService.deleteSalarySetting(key);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

