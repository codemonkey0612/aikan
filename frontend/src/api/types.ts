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

export type AttendanceStatus = "PENDING" | "CONFIRMED" | "REJECTED";
export type PinPurpose = "CHECK_IN" | "CHECK_OUT" | "STATUS_UPDATE";

export interface Attendance {
  id: number;
  shift_id: number;
  user_id: number;
  check_in_at: Nullable<string>;
  check_out_at: Nullable<string>;
  check_in_lat: Nullable<number>;
  check_in_lng: Nullable<number>;
  check_out_lat: Nullable<number>;
  check_out_lng: Nullable<number>;
  check_in_status: AttendanceStatus;
  check_out_status: AttendanceStatus;
  check_in_pin: Nullable<string>;
  check_out_pin: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface CheckInRequest {
  shift_id: number;
  lat: number;
  lng: number;
  pin?: string;
}

export interface CheckOutRequest {
  attendance_id: number;
  lat: number;
  lng: number;
  pin?: string;
}

export interface CheckOutResponse extends Attendance {
  distance_km: number | null;
}

export interface UpdateStatusRequest {
  attendance_id: number;
  status: AttendanceStatus;
  type: "check_in" | "check_out";
  pin?: string;
}

export interface GeneratePinRequest {
  purpose: PinPurpose;
  attendance_id?: number;
}

export interface GeneratePinResponse {
  pin: string;
  expires_in: number;
}

export interface Diagnosis {
  id: number;
  resident_id: number;
  diagnosis_code: Nullable<string>;
  diagnosis_name: string;
  diagnosis_date: Nullable<string>;
  severity: Nullable<string>;
  status: string;
  notes: Nullable<string>;
  diagnosed_by: Nullable<number>;
  created_at: string;
  updated_at: string;
}

export type CarePlanStatus = "ACTIVE" | "COMPLETED" | "CANCELLED";
export type CarePlanPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CarePlan {
  id: number;
  resident_id: number;
  title: string;
  description: Nullable<string>;
  start_date: string;
  end_date: Nullable<string>;
  status: CarePlanStatus;
  priority: CarePlanPriority;
  created_by: Nullable<number>;
  created_at: string;
  updated_at: string;
}

export interface CarePlanItem {
  id: number;
  care_plan_id: number;
  task_description: string;
  frequency: Nullable<string>;
  assigned_to: Nullable<number>;
  completed: boolean;
  completed_at: Nullable<string>;
  completed_by: Nullable<number>;
  due_date: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export type MedicationStatus = "ACTIVE" | "DISCONTINUED" | "COMPLETED";

export interface MedicationNote {
  id: number;
  resident_id: number;
  medication_name: string;
  dosage: Nullable<string>;
  frequency: Nullable<string>;
  route: Nullable<string>;
  start_date: Nullable<string>;
  end_date: Nullable<string>;
  prescribed_by: Nullable<string>;
  notes: Nullable<string>;
  status: MedicationStatus;
  created_by: Nullable<number>;
  created_at: string;
  updated_at: string;
}

export type VitalAlertType = "SYSTOLIC_BP" | "DIASTOLIC_BP" | "PULSE" | "TEMPERATURE" | "SPO2";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface VitalAlert {
  id: number;
  resident_id: number;
  alert_type: VitalAlertType;
  min_value: Nullable<number>;
  max_value: Nullable<number>;
  severity: AlertSeverity;
  active: boolean;
  created_by: Nullable<number>;
  created_at: string;
  updated_at: string;
}

export interface VitalAlertTrigger {
  id: number;
  vital_record_id: number;
  vital_alert_id: number;
  resident_id: number;
  alert_type: VitalAlertType;
  measured_value: number;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_by: Nullable<number>;
  acknowledged_at: Nullable<string>;
  notes: Nullable<string>;
}

export type FileCategory = "RESIDENT_IMAGE" | "PROFILE_AVATAR" | "SHIFT_REPORT" | "SALARY_STATEMENT" | "CARE_NOTE_ATTACHMENT";

export interface File {
  id: number;
  file_name: string;
  original_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  mime_type: Nullable<string>;
  category: FileCategory;
  entity_type: string;
  entity_id: number;
  uploaded_by: Nullable<number>;
  created_at: string;
}

export interface AlcoholCheck {
  id: number;
  user_id: number;
  resident_id: Nullable<number>;
  breath_alcohol_concentration: number; // mg/L
  checked_at: string;
  device_image_path: Nullable<string>;
  notes: Nullable<string>;
  checked_by: Nullable<number>;
  created_at: string;
  updated_at: string;
  // Joined fields
  user_first_name?: Nullable<string>;
  user_last_name?: Nullable<string>;
  user_email?: Nullable<string>;
  resident_first_name?: Nullable<string>;
  resident_last_name?: Nullable<string>;
  checked_by_first_name?: Nullable<string>;
  checked_by_last_name?: Nullable<string>;
}
