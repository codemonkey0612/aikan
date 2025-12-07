-- Create missing tables for nurse_availability and facility_shift_requests
-- Run this script if these tables don't exist in your database

USE aikan_cloud;

-- ------------------------------------------------------------
-- nurse_availability テーブル（看護師の希望シフト）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `nurse_availability` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `nurse_id` VARCHAR(100) NOT NULL,
    `year_month` CHAR(7) NOT NULL, -- "2025-12"
    `availability_data` JSON NOT NULL, -- { "2025-12-01": { "available": true, "time_slots": ["09:00-12:00", "14:00-17:00"] }, ... }
    `status` ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
    `submitted_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_nurse_id` (`nurse_id`),
    INDEX `idx_year_month` (`year_month`),
    INDEX `idx_status` (`status`),
    UNIQUE KEY `unique_nurse_month` (`nurse_id`, `year_month`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- facility_shift_requests テーブル（施設のシフト依頼）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facility_shift_requests` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `facility_id` VARCHAR(50) NOT NULL,
    `year_month` CHAR(7) NOT NULL, -- "2025-12"
    `request_data` JSON NOT NULL, -- { "2025-12-01": { "time_slots": ["15:00-20:00"], "notes": "..." }, ... }
    `status` ENUM('draft', 'submitted', 'scheduled') DEFAULT 'draft',
    `submitted_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_facility_id` (`facility_id`),
    INDEX `idx_year_month` (`year_month`),
    INDEX `idx_status` (`status`),
    UNIQUE KEY `unique_facility_month` (`facility_id`, `year_month`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
