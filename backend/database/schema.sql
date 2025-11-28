CREATE DATABASE IF NOT EXISTS aikan_cloud;
USE aikan_cloud;

-- Corporations
CREATE TABLE IF NOT EXISTS corporations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Facilities
CREATE TABLE IF NOT EXISTS facilities (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  corporation_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(20) UNIQUE,
  postal_code VARCHAR(20),
  address VARCHAR(255),
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (corporation_id) REFERENCES corporations(id)
);

-- Users (Nurses, Admins, Facility Staff)
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role ENUM('ADMIN','NURSE','STAFF') NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  password_hash VARCHAR(255),
  active TINYINT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Residents
CREATE TABLE IF NOT EXISTS residents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  facility_id BIGINT NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  gender ENUM('MALE','FEMALE','OTHER'),
  birth_date DATE,
  status VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Vital records
CREATE TABLE IF NOT EXISTS vital_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resident_id BIGINT NOT NULL,
  measured_at DATETIME,
  systolic_bp INT,
  diastolic_bp INT,
  pulse INT,
  temperature DECIMAL(4,1),
  spo2 INT,
  note TEXT,
  created_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES residents(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  facility_id BIGINT NOT NULL,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  shift_type VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (facility_id) REFERENCES facilities(id)
);

-- Visits
CREATE TABLE IF NOT EXISTS visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shift_id BIGINT NOT NULL,
  resident_id BIGINT,
  visited_at DATETIME NOT NULL,
  note TEXT,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (resident_id) REFERENCES residents(id)
);

-- Joint visits
CREATE TABLE IF NOT EXISTS joint_visits (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  visit_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES visits(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Shift locations (distance)
CREATE TABLE IF NOT EXISTS shift_locations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shift_id BIGINT NOT NULL,
  from_lat DECIMAL(10,7),
  from_lng DECIMAL(10,7),
  to_lat DECIMAL(10,7),
  to_lng DECIMAL(10,7),
  distance_km DECIMAL(8,2),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id)
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Files table for managing uploaded files
CREATE TABLE IF NOT EXISTS files (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  category ENUM('RESIDENT_IMAGE', 'PROFILE_AVATAR', 'SHIFT_REPORT', 'SALARY_STATEMENT', 'CARE_NOTE_ATTACHMENT') NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT NOT NULL,
  uploaded_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_uploaded_by (uploaded_by)
);

-- Nurse salary
CREATE TABLE IF NOT EXISTS nurse_salaries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  `year_month` CHAR(7) NOT NULL,
  amount INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_month (user_id, `year_month`),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salary Rules table for salary calculation rules
CREATE TABLE IF NOT EXISTS salary_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  condition_json JSON,
  calculation_formula TEXT,
  priority INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rule_type (rule_type),
  INDEX idx_active (active),
  INDEX idx_priority (priority)
);

-- Shift Templates table for reusable shift patterns
CREATE TABLE IF NOT EXISTS shift_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  facility_id INT,
  shift_type VARCHAR(50),
  start_time TIME,
  end_time TIME,
  day_of_week TINYINT,
  is_recurring TINYINT(1) DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_active (active)
);

-- Attendance tracking table for nurse check-in/out with GPS
CREATE TABLE IF NOT EXISTS attendance (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  shift_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  check_in_at DATETIME,
  check_out_at DATETIME,
  check_in_lat DECIMAL(10, 7),
  check_in_lng DECIMAL(10, 7),
  check_out_lat DECIMAL(10, 7),
  check_out_lng DECIMAL(10, 7),
  check_in_status ENUM('PENDING', 'CONFIRMED', 'REJECTED') DEFAULT 'PENDING',
  check_out_status ENUM('PENDING', 'CONFIRMED', 'REJECTED') DEFAULT 'PENDING',
  check_in_pin VARCHAR(10),
  check_out_pin VARCHAR(10),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_shift (shift_id),
  INDEX idx_user (user_id),
  INDEX idx_check_in_at (check_in_at),
  INDEX idx_check_out_at (check_out_at)
);

-- PIN verification table for status verification
CREATE TABLE IF NOT EXISTS pin_verifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  pin VARCHAR(10) NOT NULL,
  purpose ENUM('CHECK_IN', 'CHECK_OUT', 'STATUS_UPDATE') NOT NULL,
  attendance_id BIGINT,
  expires_at DATETIME NOT NULL,
  used TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (attendance_id) REFERENCES attendance(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_pin (pin),
  INDEX idx_expires_at (expires_at),
  INDEX idx_used (used)
);

-- Diagnoses table for resident medical diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resident_id BIGINT NOT NULL,
  diagnosis_code VARCHAR(50),
  diagnosis_name VARCHAR(255) NOT NULL,
  diagnosis_date DATE,
  severity VARCHAR(50),
  status VARCHAR(50) DEFAULT 'ACTIVE',
  notes TEXT,
  diagnosed_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
  FOREIGN KEY (diagnosed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resident (resident_id),
  INDEX idx_status (status),
  INDEX idx_diagnosis_date (diagnosis_date)
);

-- Medication notes table for resident medication tracking
CREATE TABLE IF NOT EXISTS medication_notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resident_id BIGINT NOT NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  route VARCHAR(50),
  start_date DATE,
  end_date DATE,
  prescribed_by VARCHAR(255),
  notes TEXT,
  status ENUM('ACTIVE', 'DISCONTINUED', 'COMPLETED') DEFAULT 'ACTIVE',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resident (resident_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date)
);

-- Care plans table for resident care planning
CREATE TABLE IF NOT EXISTS care_plans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resident_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resident (resident_id),
  INDEX idx_status (status),
  INDEX idx_start_date (start_date)
);

-- Care plan tasks/items
CREATE TABLE IF NOT EXISTS care_plan_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  care_plan_id BIGINT NOT NULL,
  task_description TEXT NOT NULL,
  frequency VARCHAR(100),
  assigned_to BIGINT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at DATETIME,
  completed_by BIGINT,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (care_plan_id) REFERENCES care_plans(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_care_plan (care_plan_id),
  INDEX idx_completed (completed),
  INDEX idx_due_date (due_date)
);

-- Vital alerts table for monitoring vital signs outside safe ranges
CREATE TABLE IF NOT EXISTS vital_alerts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  resident_id BIGINT NOT NULL,
  alert_type ENUM('SYSTOLIC_BP', 'DIASTOLIC_BP', 'PULSE', 'TEMPERATURE', 'SPO2') NOT NULL,
  min_value DECIMAL(10, 2),
  max_value DECIMAL(10, 2),
  severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
  active BOOLEAN DEFAULT TRUE,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_resident (resident_id),
  INDEX idx_active (active),
  INDEX idx_alert_type (alert_type)
);

-- Vital alert triggers (records when alerts are triggered)
CREATE TABLE IF NOT EXISTS vital_alert_triggers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  vital_record_id BIGINT NOT NULL,
  vital_alert_id BIGINT NOT NULL,
  measured_value DECIMAL(10, 2) NOT NULL,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by BIGINT,
  acknowledged_at DATETIME,
  notes TEXT,
  FOREIGN KEY (vital_record_id) REFERENCES vital_records(id) ON DELETE CASCADE,
  FOREIGN KEY (vital_alert_id) REFERENCES vital_alerts(id) ON DELETE CASCADE,
  FOREIGN KEY (acknowledged_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_vital_record (vital_record_id),
  INDEX idx_vital_alert (vital_alert_id),
  INDEX idx_acknowledged (acknowledged),
  INDEX idx_triggered_at (triggered_at)
);

-- Alcohol checks table for tracking breath alcohol concentration tests
CREATE TABLE IF NOT EXISTS alcohol_checks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  resident_id BIGINT,
  breath_alcohol_concentration DECIMAL(5, 2) NOT NULL,
  checked_at DATETIME NOT NULL,
  device_image_path VARCHAR(512),
  notes TEXT,
  checked_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE SET NULL,
  FOREIGN KEY (checked_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_resident_id (resident_id),
  INDEX idx_checked_at (checked_at),
  INDEX idx_checked_by (checked_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Option Master table for caching frequently accessed configuration data
CREATE TABLE IF NOT EXISTS option_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  code VARCHAR(100) NOT NULL,
  label VARCHAR(255) NOT NULL,
  value TEXT,
  display_order INT DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_category_code (category, code),
  INDEX idx_category (category),
  INDEX idx_active (active)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  body TEXT,
  target_role VARCHAR(50),
  publish_from DATETIME,
  publish_to DATETIME,
  created_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
