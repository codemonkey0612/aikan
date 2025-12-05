# Database Schema Update Instructions

The backend code requires updated database schema. Please run the following:

## Option 1: Run the full schema (if starting fresh)
```bash
mysql -u your_username -p < backend/database/schema.sql
```

## Option 2: Apply only the new tables and columns (if database already exists)

Run these SQL commands in your MySQL client:

```sql
-- 1. Update shifts table (add missing columns if they don't exist)
ALTER TABLE shifts 
ADD COLUMN IF NOT EXISTS end_datetime DATETIME NULL AFTER start_datetime,
ADD COLUMN IF NOT EXISTS distance_km DECIMAL(10,2) NULL AFTER end_datetime;

-- 2. Create new tables
-- (Copy the CREATE TABLE statements from schema.sql for:)
-- - nurse_availability
-- - facility_shift_requests  
-- - salary_settings
-- - Updated nurse_salaries structure

-- 3. Update nurse_salaries table structure
ALTER TABLE nurse_salaries
ADD COLUMN IF NOT EXISTS nurse_id VARCHAR(100) NULL AFTER user_id,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER year_month,
ADD COLUMN IF NOT EXISTS distance_pay DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER total_amount,
ADD COLUMN IF NOT EXISTS time_pay DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER distance_pay,
ADD COLUMN IF NOT EXISTS vital_pay DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER time_pay,
ADD COLUMN IF NOT EXISTS total_distance_km DECIMAL(10,2) DEFAULT 0 AFTER vital_pay,
ADD COLUMN IF NOT EXISTS total_minutes INT DEFAULT 0 AFTER total_distance_km,
ADD COLUMN IF NOT EXISTS total_vital_count INT DEFAULT 0 AFTER total_minutes,
ADD COLUMN IF NOT EXISTS calculation_details JSON NULL AFTER total_vital_count,
ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP NULL AFTER calculation_details;

-- Rename amount to total_amount if it exists
-- ALTER TABLE nurse_salaries CHANGE COLUMN amount total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
```

**Note**: MySQL doesn't support `IF NOT EXISTS` for `ALTER TABLE ADD COLUMN`. 
You may need to check if columns exist first or ignore errors if they already exist.

