-- Salary Rules table for salary calculation rules
CREATE TABLE IF NOT EXISTS salary_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL, -- 'BASE', 'OVERTIME', 'BONUS', 'DEDUCTION', etc.
  condition_json JSON, -- Flexible condition structure
  calculation_formula TEXT, -- Formula or calculation logic
  priority INT DEFAULT 0, -- Higher priority rules are applied first
  active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_rule_type (rule_type),
  INDEX idx_active (active),
  INDEX idx_priority (priority)
);

