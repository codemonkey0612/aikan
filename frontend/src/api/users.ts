import { api } from "./axios";
import type { PaginatedResponse, User } from "./types";

export const getUsers = () => api.get<User[]>("/users");
export const getUsersPaginated = (params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  role?: User["role"];
  search?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params?.role) queryParams.append("role", params.role);
  if (params?.search) queryParams.append("search", params.search);
  
  const query = queryParams.toString();
  return api.get<PaginatedResponse<User>>(`/users${query ? `?${query}` : ""}`);
};
export const getUserById = (id: number) => api.get<User>(`/users/${id}`);
export const createUser = (data: any) => api.post<User>("/users", data);
export const updateUser = (id: number, data: any) =>
  api.put<User>(`/users/${id}`, data);
export const deleteUser = (id: number) => api.delete(`/users/${id}`);
