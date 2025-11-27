import { Request, Response } from "express";
import * as SalaryService from "../services/salary.service";

export const getAllSalaries = async (req: Request, res: Response) => {
  const salaries = await SalaryService.getAllSalaries();
  res.json(salaries);
};

export const getSalaryById = async (req: Request, res: Response) => {
  const salary = await SalaryService.getSalaryById(Number(req.params.id));
  res.json(salary);
};

export const createSalary = async (req: Request, res: Response) => {
  const created = await SalaryService.createSalary(req.body);
  res.status(201).json(created);
};

export const updateSalary = async (req: Request, res: Response) => {
  const updated = await SalaryService.updateSalary(
    Number(req.params.id),
    req.body
  );
  res.json(updated);
};

export const deleteSalary = async (req: Request, res: Response) => {
  await SalaryService.deleteSalary(Number(req.params.id));
  res.json({ message: "Deleted" });
};

