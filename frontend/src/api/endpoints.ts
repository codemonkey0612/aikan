import { apiClient } from "./client";
import type { ApiIdentifier } from "./client";
import type {
  AlcoholCheck,
  Attendance,
  AuthResponse,
  CarePlan,
  CarePlanItem,
  CheckInRequest,
  CheckOutRequest,
  CheckOutResponse,
  Diagnosis,
  Facility,
  FileRecord,
  FileCategory,
  GeneratePinRequest,
  GeneratePinResponse,
  MedicationNote,
  Notification,
  PaginatedResponse,
  Resident,
  Salary,
  Shift,
  UpdateStatusRequest,
  User,
  Visit,
  VitalAlert,
  VitalAlertTrigger,
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
  updateProfile: (payload: {
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  }) =>
    apiClient.put<User>("/auth/profile", payload).then((res) => res.data),
  changePassword: (payload: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }) =>
    apiClient.post<{ message: string }>("/auth/change-password", payload).then((res) => res.data),
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
    resident_id?: string; // VARCHAR(50)
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
    nurse_id?: string; // VARCHAR(100)
    facility_id?: string; // VARCHAR(50)
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
    resident_id?: string; // VARCHAR(50)
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

export const AttendanceAPI = {
  checkIn: (payload: CheckInRequest) =>
    apiClient.post<Attendance>("/attendance/check-in", payload).then((res) => res.data),
  checkOut: (payload: CheckOutRequest) =>
    apiClient.post<CheckOutResponse>("/attendance/check-out", payload).then((res) => res.data),
  updateStatus: (payload: UpdateStatusRequest) =>
    apiClient.put<Attendance>("/attendance/status", payload).then((res) => res.data),
  generatePin: (payload: GeneratePinRequest) =>
    apiClient.post<GeneratePinResponse>("/attendance/generate-pin", payload).then((res) => res.data),
  getMyAttendance: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : "";
    return apiClient.get<Attendance[]>(`/attendance/my${query}`).then((res) => res.data);
  },
  getByShift: (shift_id: number) =>
    apiClient.get<Attendance[]>(`/attendance/shift/${shift_id}`).then((res) => res.data),
  getById: (id: number) =>
    apiClient.get<Attendance>(`/attendance/${id}`).then((res) => res.data),
};

export const DiagnosesAPI = createCrudApi<Diagnosis>("/diagnoses");
export const DiagnosesAPIExtended = {
  ...DiagnosesAPI,
  getByResident: (resident_id: string) =>
    apiClient.get<Diagnosis[]>(`/diagnoses/resident/${resident_id}`).then((res) => res.data),
};

export const CarePlansAPI = {
  ...createCrudApi<CarePlan>("/care-plans"),
  getByResident: (resident_id: string) =>
    apiClient.get<CarePlan[]>(`/care-plans/resident/${resident_id}`).then((res) => res.data),
  getItems: (care_plan_id: number) =>
    apiClient.get<CarePlanItem[]>(`/care-plans/${care_plan_id}/items`).then((res) => res.data),
  createItem: (payload: Partial<CarePlanItem>) =>
    apiClient.post<CarePlanItem>("/care-plans/items", payload).then((res) => res.data),
  updateItem: (id: number, payload: Partial<CarePlanItem>) =>
    apiClient.put<CarePlanItem>(`/care-plans/items/${id}`, payload).then((res) => res.data),
  deleteItem: (id: number) =>
    apiClient.delete(`/care-plans/items/${id}`).then(() => undefined),
};

export const MedicationNotesAPI = {
  ...createCrudApi<MedicationNote>("/medication-notes"),
  getByResident: (resident_id: string) =>
    apiClient.get<MedicationNote[]>(`/medication-notes/resident/${resident_id}`).then((res) => res.data),
  getActiveByResident: (resident_id: string) =>
    apiClient.get<MedicationNote[]>(`/medication-notes/resident/${resident_id}/active`).then((res) => res.data),
};

export const VitalAlertsAPI = {
  ...createCrudApi<VitalAlert>("/vital-alerts"),
  getByResident: (resident_id: string) =>
    apiClient.get<VitalAlert[]>(`/vital-alerts/resident/${resident_id}`).then((res) => res.data),
  getTriggers: (params?: { resident_id?: string; acknowledged?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.resident_id) queryParams.append("resident_id", String(params.resident_id));
    if (params?.acknowledged !== undefined) queryParams.append("acknowledged", String(params.acknowledged));
    const query = queryParams.toString();
    return apiClient.get<VitalAlertTrigger[]>(`/vital-alerts/triggers${query ? `?${query}` : ""}`).then((res) => res.data);
  },
  acknowledgeTrigger: (id: number, notes?: string) =>
    apiClient.post<VitalAlertTrigger>(`/vital-alerts/triggers/${id}/acknowledge`, { notes }).then((res) => res.data),
};

export const FilesAPI = {
  upload: (file: globalThis.File, category: FileCategory, entity_type: string, entity_id: number) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("entity_type", entity_type);
    formData.append("entity_id", String(entity_id));
    // Content-Typeは自動設定されるため、明示的に設定しない
    return apiClient.post<FileRecord>("/files/upload", formData).then((res) => res.data);
  },
  get: (id: number) => {
    return apiClient.get(`/files/${id}`, { responseType: "blob" }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      return url;
    });
  },
  getByEntity: (entity_type: string, entity_id: number) =>
    apiClient.get<FileRecord[]>(`/files/entity/${entity_type}/${entity_id}`).then((res) => res.data),
  getByCategory: (category: FileCategory) =>
    apiClient.get<FileRecord[]>(`/files/category/${category}`).then((res) => res.data),
  remove: (id: number) =>
    apiClient.delete(`/files/${id}`).then(() => undefined),
};

export const AlcoholChecksAPI = {
  ...createCrudApi<AlcoholCheck>("/alcohol-checks"),
  getMy: () =>
    apiClient.get<AlcoholCheck[]>("/alcohol-checks/my").then((res) => res.data),
};

