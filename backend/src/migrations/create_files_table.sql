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
  entity_type VARCHAR(50) NOT NULL, -- 'resident', 'user', 'shift', 'salary', 'care_note', etc.
  entity_id BIGINT NOT NULL, -- ID of the related entity
  uploaded_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_uploaded_by (uploaded_by)
);

