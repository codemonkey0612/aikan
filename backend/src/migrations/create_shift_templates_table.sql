-- Shift Templates table for reusable shift patterns
CREATE TABLE IF NOT EXISTS shift_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  facility_id INT,
  shift_type VARCHAR(50),
  start_time TIME,
  end_time TIME,
  day_of_week TINYINT, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  is_recurring TINYINT(1) DEFAULT 0,
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_facility (facility_id),
  INDEX idx_active (active)
);

