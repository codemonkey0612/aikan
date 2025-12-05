export type Nullable<T> = T | null;

export type UserRole = "admin" | "nurse" | "facility_manager" | "corporate_officer";

export interface User {
  id: number; // BIGINT UNSIGNED
  role: UserRole;
  last_name: string;
  first_name: string;
  last_name_kana: Nullable<string>;
  first_name_kana: Nullable<string>;
  postal_code: Nullable<string>;
  address_prefecture: Nullable<string>;
  address_city: Nullable<string>;
  address_building: Nullable<string>;
  latitude_longitude: Nullable<string>; // "lat,lng" format
  email: string;
  phone_number: Nullable<string>;
  user_photo_url: Nullable<string>;
  notes: Nullable<string>;
  position: Nullable<string>;
  alcohol_check: boolean;
  nurse_id: Nullable<string>; // VARCHAR(100)
  created_at: string;
  updated_at: string;
}

export interface Corporation {
  corporation_id: string; // VARCHAR(20) PRIMARY KEY
  corporation_number: Nullable<string>;
  name: string;
  name_kana: Nullable<string>;
  postal_code: Nullable<string>;
  address_prefecture: Nullable<string>;
  address_city: Nullable<string>;
  address_building: Nullable<string>;
  latitude_longitude: Nullable<string>; // "lat,lng" format
  phone_number: Nullable<string>;
  contact_email: Nullable<string>;
  billing_unit_price: Nullable<number>;
  billing_method_id: Nullable<string>;
  photo_url: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  facility_id: string; // VARCHAR(50) PRIMARY KEY
  facility_number: Nullable<string>;
  corporation_id: Nullable<string>; // VARCHAR(20)
  name: string;
  name_kana: Nullable<string>;
  postal_code: Nullable<string>;
  address_prefecture: Nullable<string>;
  address_city: Nullable<string>;
  address_building: Nullable<string>;
  latitude_longitude: Nullable<string>; // "lat,lng" format
  phone_number: Nullable<string>;
  facility_status_id: Nullable<string>;
  pre_visit_contact_id: Nullable<string>;
  contact_type_id: Nullable<string>;
  building_type_id: Nullable<string>;
  pl_support_id: Nullable<string>;
  visit_notes: Nullable<string>;
  facility_notes: Nullable<string>;
  user_notes: Nullable<string>;
  map_document_url: Nullable<string>;
  billing_unit_price: Nullable<number>;
  billing_method_id: Nullable<string>;
  capacity: Nullable<number>;
  current_residents: Nullable<number>;
  nurse_id: Nullable<string>; // VARCHAR(100)
  visit_count: Nullable<number>;
  prefer_mon: boolean;
  prefer_tue: boolean;
  prefer_wed: boolean;
  prefer_thu: boolean;
  prefer_fri: boolean;
  time_mon: Nullable<string>;
  time_tue: Nullable<string>;
  time_wed: Nullable<string>;
  time_thu: Nullable<string>;
  time_fri: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Resident {
  resident_id: string; // VARCHAR(50) PRIMARY KEY
  user_id: Nullable<string>; // VARCHAR(50)
  status_id: Nullable<string>; // VARCHAR(50)
  facility_id: Nullable<string>; // VARCHAR(50)
  last_name: string;
  first_name: string;
  last_name_kana: Nullable<string>;
  first_name_kana: Nullable<string>;
  phone_number: Nullable<string>;
  admission_date: Nullable<string>; // DATE
  effective_date: Nullable<string>; // DATE
  discharge_date: Nullable<string>; // DATE
  is_excluded: boolean;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface VitalRecord {
  id: number;
  resident_id: string; // VARCHAR(50)
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
  shift_period: Nullable<string>;
  route_no: Nullable<number>;
  facility_id: Nullable<string>; // VARCHAR(50)
  facility_name: Nullable<string>;
  facility_address: Nullable<string>;
  resident_count: Nullable<number>;
  capacity: Nullable<number>;
  required_time: Nullable<number>;
  start_datetime: string; // DATE
  nurse_id: Nullable<string>; // VARCHAR(100)
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: number;
  shift_id: number;
  resident_id: Nullable<string>; // VARCHAR(50)
  visited_at: string;
  note: Nullable<string>;
}

export interface Salary {
  id: number;
  user_id: number;
  nurse_id: Nullable<string>;
  year_month: string;
  total_amount: number;
  distance_pay: number;
  time_pay: number;
  vital_pay: number;
  total_distance_km: number;
  total_minutes: number;
  total_vital_count: number;
  calculation_details: Nullable<any>;
  calculated_at: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface NurseAvailability {
  id: number;
  nurse_id: string;
  year_month: string;
  availability_data: {
    [date: string]: {
      available: boolean;
      time_slots?: string[];
      notes?: string;
    };
  };
  status: "draft" | "submitted" | "approved";
  submitted_at: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface FacilityShiftRequest {
  id: number;
  facility_id: string;
  year_month: string;
  request_data: {
    [date: string]: {
      time_slots: string[];
      required_nurses?: number;
      notes?: string;
    };
  };
  status: "draft" | "submitted" | "scheduled";
  submitted_at: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface SalarySetting {
  id: number;
  setting_key: string;
  setting_value: number;
  description: Nullable<string>;
  updated_by: Nullable<number>;
  created_at: string;
  updated_at: string;
}

export interface SalaryCalculationResult {
  total_amount: number;
  distance_pay: number;
  time_pay: number;
  vital_pay: number;
  total_distance_km: number;
  total_minutes: number;
  total_vital_count: number;
  calculation_details: any[];
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
  resident_id: string; // VARCHAR(50)
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
  resident_id: string; // VARCHAR(50)
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
  resident_id: string; // VARCHAR(50)
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
  resident_id: string; // VARCHAR(50)
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

export interface FileRecord {
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
  user_id: number; // BIGINT UNSIGNED
  resident_id: Nullable<string>; // VARCHAR(50)
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
