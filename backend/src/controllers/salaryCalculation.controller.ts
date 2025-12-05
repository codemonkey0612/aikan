import { Request, Response } from "express";
import * as SalaryCalculationService from "../services/salaryCalculation.service";
import * as SalaryService from "../services/salary.service";
import * as UserModel from "../models/user.model";

export const calculateNurseSalary = async (req: Request, res: Response) => {
  try {
    const { nurse_id, year_month } = req.params;
    const calculation =
      await SalaryCalculationService.calculateNurseSalary(
        nurse_id,
        year_month
      );
    res.json(calculation);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const calculateAndSaveSalary = async (req: Request, res: Response) => {
  try {
    const { nurse_id, year_month } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Get user_id from nurse_id
    const users = await UserModel.getAllUsers({ nurse_id });
    const nurseUser = users.find((u) => u.nurse_id === nurse_id);

    if (!nurseUser) {
      return res.status(404).json({ error: "Nurse not found" });
    }

    const salary = await SalaryCalculationService.calculateAndSaveSalary(
      nurseUser.id,
      nurse_id,
      year_month
    );

    res.json(salary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllSalaries = async (req: Request, res: Response) => {
  try {
    const filters = {
      user_id: req.query.user_id
        ? parseInt(req.query.user_id as string)
        : undefined,
      nurse_id: req.query.nurse_id ? String(req.query.nurse_id).trim() : undefined,
      year_month: req.query.year_month ? String(req.query.year_month).trim() : undefined,
    };
    const salaries = await SalaryService.getAllSalaries(filters);
    res.json({ data: salaries });
  } catch (error: any) {
    console.error("Error in getAllSalaries:", error);
    res.status(500).json({ error: error.message || "Failed to fetch salaries" });
  }
};

