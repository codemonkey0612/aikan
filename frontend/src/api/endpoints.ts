import { apiClient } from "./client";
import type { ApiIdentifier } from "./client";
import type {
  AuthResponse,
  Facility,
  Notification,
  PaginatedResponse,
  Resident,
  Salary,
  Shift,
  User,
  Visit,
  VitalRecord,
} from "./types";

export interface CrudApi<T, CreateInput = Partial<T>, UpdateInput = Partial<T>> {
  list: () => Promise<T[]>;
  get: (id: ApiIdentifier) => Promise<T>;
  create: (payload: CreateInput) => Promise<T>;
  update: (id: ApiIdentifier, payload: UpdateInput) => Promise<T>;
  remove: (id: ApiIdentifier) => Promise<void>;
}

const createCrudApi = <
  T,
  CreateInput = Partial<T>,
  UpdateInput = Partial<T>
>(
  basePath: string
): CrudApi<T, CreateInput, UpdateInput> => ({
  list: () => apiClient.get<T[]>(basePath).then((res) => res.data),
  get: (id) => apiClient.get<T>(`${basePath}/${id}`).then((res) => res.data),
  create: (payload) =>
    apiClient.post<T>(basePath, payload).then((res) => res.data),
  update: (id, payload) =>
    apiClient.put<T>(`${basePath}/${id}`, payload).then((res) => res.data),
  remove: (id) => apiClient.delete(`${basePath}/${id}`).then(() => undefined),
});

export const AuthAPI = {
  register: (payload: {
    first_name?: string;
    last_name?: string;
    email: string;
    phone?: string;
    role: User["role"];
    password: string;
  }) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((res) => res.data),
  login: (payload: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/auth/login", payload).then((res) => res.data),
  refresh: (payload: { refreshToken: string }) =>
    apiClient.post<AuthResponse>("/auth/refresh", payload).then((res) => res.data),
  logout: (payload: { refreshToken: string }) =>
    apiClient.post<{ message: string }>("/auth/logout", payload).then((res) => res.data),
  me: () => apiClient.get<User>("/auth/me").then((res) => res.data),
};

export const UsersAPI = createCrudApi<User>("/users");
export const FacilitiesAPI = createCrudApi<Facility>("/facilities");
export const ResidentsAPI = createCrudApi<Resident>("/residents");
export const SalariesAPI = createCrudApi<Salary>("/salaries");
export const NotificationsAPI = createCrudApi<Notification>("/notifications");

// ページネーション対応のAPI
export const VitalsAPI = {
  ...createCrudApi<VitalRecord>("/vitals"),
  listPaginated: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    resident_id?: number;
    measured_from?: string;
    measured_to?: string;
    created_by?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.resident_id) queryParams.append("resident_id", String(params.resident_id));
    if (params?.measured_from) queryParams.append("measured_from", params.measured_from);
    if (params?.measured_to) queryParams.append("measured_to", params.measured_to);
    if (params?.created_by) queryParams.append("created_by", String(params.created_by));

    const query = queryParams.toString();
    return apiClient
      .get<PaginatedResponse<VitalRecord>>(`/vitals${query ? `?${query}` : ""}`)
      .then((res) => res.data);
  },
};

export const ShiftsAPI = {
  ...createCrudApi<Shift>("/shifts"),
  listPaginated: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    user_id?: number;
    facility_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.user_id) queryParams.append("user_id", String(params.user_id));
    if (params?.facility_id) queryParams.append("facility_id", String(params.facility_id));
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);

    const query = queryParams.toString();
    return apiClient
      .get<PaginatedResponse<Shift>>(`/shifts${query ? `?${query}` : ""}`)
      .then((res) => res.data);
  },
};

export const VisitsAPI = {
  ...createCrudApi<Visit>("/visits"),
  listPaginated: (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    shift_id?: number;
    resident_id?: number;
    visited_from?: string;
    visited_to?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.shift_id) queryParams.append("shift_id", String(params.shift_id));
    if (params?.resident_id) queryParams.append("resident_id", String(params.resident_id));
    if (params?.visited_from) queryParams.append("visited_from", params.visited_from);
    if (params?.visited_to) queryParams.append("visited_to", params.visited_to);

    const query = queryParams.toString();
    return apiClient
      .get<PaginatedResponse<Visit>>(`/visits${query ? `?${query}` : ""}`)
      .then((res) => res.data);
  },
};

