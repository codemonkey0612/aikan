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

