import * as SalaryModel from "../models/salary.model";

export const getAllSalaries = () => SalaryModel.getAllSalaries();
export const getSalaryById = (id: number) => SalaryModel.getSalaryById(id);
export const createSalary = (data: SalaryModel.SalaryInput) =>
  SalaryModel.createSalary(data);
export const updateSalary = (
  id: number,
  data: Partial<SalaryModel.SalaryInput>
) => SalaryModel.updateSalary(id, data);
export const deleteSalary = (id: number) => SalaryModel.deleteSalary(id);

