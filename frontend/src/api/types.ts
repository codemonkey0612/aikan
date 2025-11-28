export type Nullable<T> = T | null;

export type UserRole = "ADMIN" | "NURSE" | "STAFF" | "FACILITY_MANAGER";

export interface User {
  id: number;
  role: UserRole;
  first_name: Nullable<string>;
  last_name: Nullable<string>;
  email: Nullable<string>;
  phone: Nullable<string>;
  active: number;
  created_at: string;
}

export interface Facility {
  id: number;
  corporation_id: number;
  name: string;
  code: Nullable<string>;
  postal_code: Nullable<string>;
  address: Nullable<string>;
  lat: Nullable<number>;
  lng: Nullable<number>;
  created_at: string;
}

export interface Resident {
  id: number;
  facility_id: number;
  first_name: Nullable<string>;
  last_name: Nullable<string>;
  gender: Nullable<"MALE" | "FEMALE" | "OTHER">;
  birth_date: Nullable<string>;
  status: Nullable<string>;
  created_at: string;
}

export interface VitalRecord {
  id: number;
  resident_id: number;
  measured_at: Nullable<string>;
  systolic_bp: Nullable<number>;
  diastolic_bp: Nullable<number>;
  pulse: Nullable<number>;
  temperature: Nullable<number>;
  spo2: Nullable<number>;
  note: Nullable<string>;
  created_by: Nullable<number>;
  created_at: string;
}

export interface Shift {
  id: number;
  user_id: number;
  facility_id: number;
  date: string;
  start_time: Nullable<string>;
  end_time: Nullable<string>;
  shift_type: Nullable<string>;
  created_at: string;
}

export interface Visit {
  id: number;
  shift_id: number;
  resident_id: Nullable<number>;
  visited_at: string;
  note: Nullable<string>;
}

export interface Salary {
  id: number;
  user_id: number;
  year_month: string;
  amount: Nullable<number>;
  created_at: string;
}

export interface Notification {
  id: number;
  title: Nullable<string>;
  body: Nullable<string>;
  target_role: Nullable<string>;
  publish_from: Nullable<string>;
  publish_to: Nullable<string>;
  created_by: Nullable<number>;
  created_at: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * ページネーション対応のAPIレスポンス
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}
