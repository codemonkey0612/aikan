import { api } from "./axios";
import type { SalarySetting } from "./types";

export const getSalarySettings = () =>
  api.get<SalarySetting[]>("/salary-settings");

export const getSalarySettingByKey = (key: string) =>
  api.get<SalarySetting>(`/salary-settings/${key}`);

export const createSalarySetting = (data: Partial<SalarySetting>) =>
  api.post<SalarySetting>("/salary-settings", data);

export const updateSalarySetting = (key: string, data: Partial<SalarySetting>) =>
  api.put<SalarySetting>(`/salary-settings/${key}`, data);

export const deleteSalarySetting = (key: string) =>
  api.delete(`/salary-settings/${key}`);

