-- ------------------------------------------------------------
-- 0. CREATE DATABASE
-- ------------------------------------------------------------
CREATE DATABASE IF NOT EXISTS aikan_cloud
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE aikan_cloud;

-- ------------------------------------------------------------
-- 1. users テーブル
-- ------------------------------------------------------------
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    -- 権限
    role ENUM('admin', 'nurse', 'facility_manager', 'corporate_officer')
        NOT NULL DEFAULT 'nurse',

    -- 氏名
    last_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name_kana VARCHAR(100),
    first_name_kana VARCHAR(100),

    -- 住所
    postal_code VARCHAR(20),
    address_prefecture VARCHAR(100),
    address_city VARCHAR(255),
    address_building VARCHAR(255),
    latitude_longitude VARCHAR(50),   -- 統合済み座標 ("35.1,139.5")

    -- 連絡先

    phone_number VARCHAR(255),

    -- プロフィール
    user_photo_url TEXT,
    notes TEXT,

    -- CUSTOMER項目 / 役職
    position VARCHAR(100),

    -- パスワード
    password VARCHAR(255) NOT NULL,

    -- アルコールチェック
    alcohol_check BOOLEAN DEFAULT FALSE,

    -- 看護師ID（文字列に変更済み）
    nurse_id VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE corporations (
    -- 法人ID（varchar 指定）
    corporation_id VARCHAR(20) PRIMARY KEY,

    -- 法人番号
    corporation_number VARCHAR(50),

    -- 名称
    name VARCHAR(255) NOT NULL,
    name_kana VARCHAR(255),

    -- 住所
    postal_code VARCHAR(20),
    address_prefecture VARCHAR(100),
    address_city VARCHAR(255),
    address_building VARCHAR(255),
    latitude_longitude VARCHAR(50),   -- 統合済み座標 (例 "35.1,139.5")

    -- 連絡先
    phone_number VARCHAR(30),
    contact_email VARCHAR(255),

    -- 備考
    notes TEXT,

    -- 請求関連
    billing_unit_price DECIMAL(10,2),
    billing_method_id VARCHAR(50),

    -- 写真
    photo_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE facilities (
    -- 基本項目
    facility_id VARCHAR(50) PRIMARY KEY,
    facility_number VARCHAR(50),
    corporation_id VARCHAR(20),

    -- 名称
    name VARCHAR(255) NOT NULL,
    name_kana VARCHAR(255),

    -- 住所
    postal_code VARCHAR(20),
    address_prefecture VARCHAR(100),
    address_city VARCHAR(255),
    address_building VARCHAR(255),
    latitude_longitude VARCHAR(50),  -- 例: "35.6895,139.6917"

    -- 連絡先
    phone_number VARCHAR(30),

    -- 各種マスタID
    facility_status_id VARCHAR(50),
    pre_visit_contact_id VARCHAR(50),
    contact_type_id VARCHAR(50),
    building_type_id VARCHAR(50),
    pl_support_id VARCHAR(50),

    -- 備考
    visit_notes TEXT,      -- 備考 / 訪問時備考
    facility_notes TEXT,   -- 備考 / 施設備考
    user_notes TEXT,       -- 備考 / 利用者備考

    -- 地図
    map_document_url TEXT,

    -- 請求
    billing_unit_price DECIMAL(10,2),
    billing_method_id VARCHAR(50),

    -- 入所者
    capacity INT,
    current_residents INT,

    -- 訪問希望：看護師
    nurse_id VARCHAR(100),

    visit_count INT,

    -- 訪問希望（曜日：boolean）
    prefer_mon BOOLEAN DEFAULT FALSE,
    prefer_tue BOOLEAN DEFAULT FALSE,
    prefer_wed BOOLEAN DEFAULT FALSE,
    prefer_thu BOOLEAN DEFAULT FALSE,
    prefer_fri BOOLEAN DEFAULT FALSE,

    -- 訪問希望（時間：string）
    time_mon VARCHAR(50),  -- 例: "15:00-20:00"
    time_tue VARCHAR(50),
    time_wed VARCHAR(50),
    time_thu VARCHAR(50),
    time_fri VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE residents (
    -- 基本項目
    resident_id VARCHAR(50) PRIMARY KEY,      -- 入所者ID
    user_id VARCHAR(50),                      -- 利用者ID
    resident_status VARCHAR(50),                    -- 入所者状況 / ID
    facility_id VARCHAR(50),                  -- 施設ID

    -- 氏名（スナップショット）
    last_name VARCHAR(100) NOT NULL,          -- 姓
    first_name VARCHAR(100) NOT NULL,         -- 名
    last_name_kana VARCHAR(100),
    first_name_kana VARCHAR(100),

    -- 連絡先
    phone_number VARCHAR(30),

    -- 日付関連
    admission_date DATE,                      -- 入所日
    effective_date DATE,                      -- 発効日
    discharge_date DATE,                      -- 退所日

    -- FLG
    is_excluded BOOLEAN DEFAULT FALSE,        -- 測定対象外FLG

    -- 備考
    notes TEXT,

    -- タイムスタンプ
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;



-- ------------------------------------------------------------
-- refresh_tokens テーブル
-- ------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- files テーブル
-- ------------------------------------------------------------
CREATE TABLE files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT UNSIGNED NOT NULL,
    mime_type VARCHAR(100),
    category ENUM('RESIDENT_IMAGE', 'PROFILE_AVATAR', 'SHIFT_REPORT', 'SALARY_STATEMENT', 'CARE_NOTE_ATTACHMENT') NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    uploaded_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_category (category),
    INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- vital_records テーブル
-- ------------------------------------------------------------
CREATE TABLE vital_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resident_id VARCHAR(50) NOT NULL,
    measured_at DATETIME,
    systolic_bp INT,
    diastolic_bp INT,
    pulse INT,
    temperature DECIMAL(4,1),
    spo2 INT,
    note TEXT,
    created_by BIGINT UNSIGNED,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_resident_id (resident_id),
    INDEX idx_measured_at (measured_at),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- shifts テーブル
-- ------------------------------------------------------------
CREATE TABLE shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shift_period VARCHAR(255),
    route_no INT,
    facility_id VARCHAR(50),
    facility_name VARCHAR(255),
    facility_address VARCHAR(500),
    resident_count INT,
    capacity INT,
    required_time INT, -- minutes
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME, -- 訪問終了時刻
    nurse_id VARCHAR(100),
    distance_km DECIMAL(10,2), -- 距離（キロメートル）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nurse_id (nurse_id),
    INDEX idx_facility_id (facility_id),
    INDEX idx_start_datetime (start_datetime),
    INDEX idx_shift_period (shift_period)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- nurse_availability テーブル（看護師の希望シフト）
-- ------------------------------------------------------------
CREATE TABLE nurse_availability (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nurse_id VARCHAR(100) NOT NULL,
    year_month CHAR(7) NOT NULL, -- "2025-12"
    availability_data JSON NOT NULL, -- { "2025-12-01": { "available": true, "time_slots": ["09:00-12:00", "14:00-17:00"] }, ... }
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nurse_id (nurse_id),
    INDEX idx_year_month (year_month),
    INDEX idx_status (status),
    UNIQUE KEY unique_nurse_month (nurse_id, year_month)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- facility_shift_requests テーブル（施設のシフト依頼）
-- ------------------------------------------------------------
CREATE TABLE facility_shift_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    facility_id VARCHAR(50) NOT NULL,
    year_month CHAR(7) NOT NULL, -- "2025-12"
    request_data JSON NOT NULL, -- { "2025-12-01": { "time_slots": ["15:00-20:00"], "required_nurses": 1, "notes": "..." }, ... }
    status ENUM('draft', 'submitted', 'scheduled') DEFAULT 'draft',
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_facility_id (facility_id),
    INDEX idx_year_month (year_month),
    INDEX idx_status (status),
    UNIQUE KEY unique_facility_month (facility_id, year_month)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;



-- ------------------------------------------------------------
-- nurse_salaries テーブル（給与計算結果）
-- ------------------------------------------------------------
CREATE TABLE `nurse_salaries` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `nurse_id` VARCHAR(100),
    `year_month` CHAR(7) NOT NULL, -- "2025-12"
    `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0,
    `distance_pay` DECIMAL(10,2) NOT NULL DEFAULT 0, -- paydist
    `time_pay` DECIMAL(10,2) NOT NULL DEFAULT 0, -- payemin
    `vital_pay` DECIMAL(10,2) NOT NULL DEFAULT 0, -- payvital
    `total_distance_km` DECIMAL(10,2) DEFAULT 0,
    `total_minutes` INT DEFAULT 0,
    `total_vital_count` INT DEFAULT 0,
    `calculation_details` JSON, -- 詳細な計算ログ
    `calculated_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_nurse_id` (`nurse_id`),
    INDEX `idx_year_month` (`year_month`),
    UNIQUE KEY `unique_nurse_month` (`nurse_id`, `year_month`)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;


-- Check if shifts table exists, if not create it
CREATE TABLE IF NOT EXISTS shifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shift_period VARCHAR(255),
    route_no INT,
    facility_id VARCHAR(50),
    facility_name VARCHAR(255),
    facility_address VARCHAR(500),
    resident_count INT,
    capacity INT,
    required_time INT,
    start_datetime DATETIME NOT NULL,
    nurse_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nurse_id (nurse_id),
    INDEX idx_facility_id (facility_id),
    INDEX idx_start_datetime (start_datetime),
    INDEX idx_shift_period (shift_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add new columns if they don't exist
-- Note: MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we need to check manually or use a stored procedure
-- For now, we'll just add them and ignore errors if they exist

-- ------------------------------------------------------------
-- notifications テーブル
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NULL,
    body TEXT NULL,
    target_role VARCHAR(50) NULL,
    publish_from DATETIME NULL,
    publish_to DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_target_role (target_role),
    INDEX idx_publish_from (publish_from),
    INDEX idx_publish_to (publish_to),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Add end_datetime column
SET @dbname = DATABASE();
SET @tablename = 'shifts';
SET @columnname = 'end_datetime';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME NULL AFTER start_datetime')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add distance_km column
SET @columnname = 'distance_km';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(10,2) NULL AFTER end_datetime')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

