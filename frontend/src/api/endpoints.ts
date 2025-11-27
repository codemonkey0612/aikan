import { apiClient } from "./client";
import type { ApiIdentifier } from "./client";
import type {
  AuthResponse,
  Facility,
  Notification,
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
  me: () => apiClient.get<User>("/auth/me").then((res) => res.data),
};

export const UsersAPI = createCrudApi<User>("/users");
export const FacilitiesAPI = createCrudApi<Facility>("/facilities");
export const ResidentsAPI = createCrudApi<Resident>("/residents");
export const VitalsAPI = createCrudApi<VitalRecord>("/vitals");
export const ShiftsAPI = createCrudApi<Shift>("/shifts");
export const VisitsAPI = createCrudApi<Visit>("/visits");
export const SalariesAPI = createCrudApi<Salary>("/salaries");
export const NotificationsAPI = createCrudApi<Notification>("/notifications");

