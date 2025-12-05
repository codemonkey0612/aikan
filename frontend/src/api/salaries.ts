import { api } from "./axios";
import type { Salary, SalaryCalculationResult } from "./types";

export const getSalaries = (params?: {
  user_id?: number;
  nurse_id?: string;
  year_month?: string;
}) => api.get<Salary[]>("/salary-calculation", { params });

export const getSalaryById = (id: number) => api.get<Salary>(`/salaries/${id}`);

export const createSalary = (data: any) => api.post("/salaries", data);

export const updateSalary = (id: number, data: any) =>
  api.put(`/salaries/${id}`, data);

export const deleteSalary = (id: number) => api.delete(`/salaries/${id}`);

export const calculateNurseSalary = (nurse_id: string, year_month: string) =>
  api.get<SalaryCalculationResult>(
    `/salary-calculation/calculate/${nurse_id}/${year_month}`
  );

export const calculateAndSaveSalary = (data: {
  nurse_id: string;
  year_month: string;
}) => api.post<Salary>("/salary-calculation/calculate", data);
