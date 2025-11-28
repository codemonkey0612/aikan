-- Alcohol checks table for tracking breath alcohol concentration tests
CREATE TABLE IF NOT EXISTS alcohol_checks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  resident_id BIGINT,
  breath_alcohol_concentration DECIMAL(5, 2) NOT NULL, -- mg/L
  checked_at DATETIME NOT NULL,
  device_image_path VARCHAR(512), -- Path to the breathalyzer device image
  notes TEXT,
  checked_by BIGINT, -- User who performed the check
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

