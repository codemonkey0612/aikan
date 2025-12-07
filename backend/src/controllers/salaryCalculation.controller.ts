import { Request, Response } from "express";
import * as SalaryCalculationService from "../services/salaryCalculation.service";
import * as SalaryService from "../services/salary.service";
import * as UserModel from "../models/user.model";

export const calculateNurseSalary = async (req: Request, res: Response) => {
  try {
    const { nurse_id, year_month } = req.params;
    
    console.log("calculateNurseSalary called with:", { nurse_id, year_month });
    
    if (!nurse_id || !year_month) {
      return res.status(400).json({ error: "nurse_id and year_month are required" });
    }

    // Validate year_month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
      return res.status(400).json({ error: "year_month must be in format YYYY-MM" });
    }

    const calculation =
      await SalaryCalculationService.calculateNurseSalary(
        nurse_id,
        year_month
      );
    res.json(calculation);
  } catch (error: any) {
    console.error("Error in calculateNurseSalary:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: error.message || "Failed to calculate salary",
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const calculateAndSaveSalary = async (req: Request, res: Response) => {
  try {
    const { nurse_id, year_month } = req.body;
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!nurse_id || !year_month) {
      return res.status(400).json({ error: "nurse_id and year_month are required" });
    }

    // Validate year_month format (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(year_month)) {
      return res.status(400).json({ error: "year_month must be in format YYYY-MM" });
    }

    // Get user_id from nurse_id
    // Normalize nurse_id for comparison
    const normalizedNurseId = String(nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
    const users = await UserModel.getAllUsers();
    const nurseUser = users.find((u) => {
      if (!u.nurse_id) return false;
      const userNurseId = String(u.nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
      return userNurseId === normalizedNurseId;
    });

    if (!nurseUser) {
      return res.status(404).json({ error: "Nurse not found" });
    }

    const salary = await SalaryCalculationService.calculateAndSaveSalary(
      nurseUser.id,
      normalizedNurseId,
      year_month
    );

    res.json(salary);
  } catch (error: any) {
    console.error("Error in calculateAndSaveSalary:", error);
    res.status(500).json({ error: error.message || "Failed to calculate and save salary" });
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

