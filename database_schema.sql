-- HR Payroll System Database Schema
-- MySQL Database Creation Script
-- Generated for migration from MongoDB to MySQL

-- Create database (uncomment if needed)
-- CREATE DATABASE IF NOT EXISTS hr_payroll CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE hr_payroll;

-- ============================================
-- Table: uploaded_files
-- Purpose: Track all uploaded files with URLs and metadata
-- ============================================
CREATE TABLE IF NOT EXISTS `uploaded_files` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `original_name` VARCHAR(255) NOT NULL,
  `stored_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_url` VARCHAR(500) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `category` ENUM('excel_attendance', 'excel_payroll', 'exports_payroll', 'exports_productivity', 'employee_passport', 'employee_visa', 'employee_photo', 'employee_other') NOT NULL,
  `uploaded_by` INT NULL,
  `upload_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` BOOLEAN DEFAULT FALSE,
  INDEX `idx_category` (`category`),
  INDEX `idx_upload_date` (`upload_date`),
  INDEX `idx_uploaded_by` (`uploaded_by`),
  FOREIGN KEY (`uploaded_by`) REFERENCES `employees`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: trade_categories
-- Purpose: Trade rules configuration (CLEANER, MEP, MASON, CIVIL)
-- ============================================
CREATE TABLE IF NOT EXISTS `trade_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `trade_category_id` VARCHAR(100) NOT NULL UNIQUE,
  `code` VARCHAR(100) NOT NULL UNIQUE COMMENT 'CLEANER, MEP, MASON, CIVIL',
  `name` VARCHAR(255) NOT NULL,
  `payroll_rules` JSON NULL COMMENT 'JSON object with paidStatuses, otRateType, otRate, otMultiplier',
  `productivity_rules` JSON NULL COMMENT 'JSON object with productivityStatuses',
  `rule_version` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: clients
-- Purpose: Client companies
-- ============================================
CREATE TABLE IF NOT EXISTS `clients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `client_id` VARCHAR(100) NOT NULL UNIQUE,
  `company_name` VARCHAR(255) NOT NULL,
  `contract_start` DATE NULL,
  `contract_end` DATE NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: sites
-- Purpose: Client sites/projects
-- ============================================
CREATE TABLE IF NOT EXISTS `sites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `site_id` VARCHAR(100) NOT NULL UNIQUE,
  `client_id` INT NOT NULL,
  `site_name` VARCHAR(255) NOT NULL,
  `site_code` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_client_id` (`client_id`),
  INDEX `idx_site_name` (`site_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: employees
-- Purpose: Employee master data
-- ============================================
CREATE TABLE IF NOT EXISTS `employees` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(100) NOT NULL UNIQUE,
  `full_name` VARCHAR(255) NOT NULL,
  `father_name` VARCHAR(255) NULL,
  `mother_name` VARCHAR(255) NULL,
  `dob` DATE NULL,
  `indian_address` TEXT NULL,
  `indian_phone` VARCHAR(20) NULL,
  `emergency_contact` TEXT NULL,
  `passport_number` VARCHAR(50) NULL,
  `passport_expiry` DATE NULL,
  `visa_type` VARCHAR(50) NULL,
  `visa_expiry` DATE NULL,
  `passport_document_url` VARCHAR(500) NULL COMMENT 'URL path to passport document',
  `visa_document_url` VARCHAR(500) NULL COMMENT 'URL path to visa document',
  `photo_url` VARCHAR(500) NULL COMMENT 'URL path to employee photo',
  `other_documents` JSON NULL COMMENT 'Array of other document objects with name, url, type, uploaded_at',
  `trade_category_id` INT NULL,
  `joining_date` DATE NULL,
  `recruitment_agency` VARCHAR(255) NULL,
  `basic_salary` DECIMAL(10, 2) NULL COMMENT 'Monthly basic salary',
  `food_allowance` DECIMAL(10, 2) NULL COMMENT 'Monthly food allowance',
  `foreman_allowance` DECIMAL(10, 2) NULL COMMENT 'Monthly foreman allowance',
  `status` ENUM('active', 'exited') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`trade_category_id`) REFERENCES `trade_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_trade_category_id` (`trade_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: deployments
-- Purpose: Employee-site assignments
-- ============================================
CREATE TABLE IF NOT EXISTS `deployments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `deployment_id` VARCHAR(100) NOT NULL UNIQUE,
  `employee_id` INT NOT NULL,
  `site_id` INT NOT NULL,
  `from_date` DATE NOT NULL,
  `to_date` DATE NULL,
  `rate_override` DECIMAL(10, 2) NULL COMMENT 'Optional override for daily rate',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_site_id` (`site_id`),
  INDEX `idx_dates` (`from_date`, `to_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: excel_uploads
-- Purpose: Excel upload tracking
-- ============================================
CREATE TABLE IF NOT EXISTS `excel_uploads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `upload_id` VARCHAR(100) NOT NULL UNIQUE,
  `filename` VARCHAR(255) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `upload_type` ENUM('EMPLOYEE', 'DEPLOYMENT', 'ATTENDANCE') NOT NULL,
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'partial') DEFAULT 'pending',
  `total_rows` INT DEFAULT 0,
  `processed_rows` INT DEFAULT 0,
  `success_rows` INT DEFAULT 0,
  `error_rows` INT DEFAULT 0,
  `errors` JSON NULL COMMENT 'Array of error objects with row, field, message',
  `mapping` JSON NULL COMMENT 'Column mapping object',
  `uploaded_by` VARCHAR(255) NOT NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_upload_type` (`upload_type`),
  INDEX `idx_status` (`status`),
  INDEX `idx_uploaded_by` (`uploaded_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: attendance_events
-- Purpose: Raw attendance data per site, per day
-- ============================================
CREATE TABLE IF NOT EXISTS `attendance_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `attendance_id` VARCHAR(100) NOT NULL UNIQUE,
  `employee_id` INT NOT NULL,
  `site_id` INT NOT NULL,
  `date` DATE NOT NULL,
  `status` ENUM('P', 'A', 'OT', 'PH', 'ML', 'OD', '8', '8.5') NOT NULL COMMENT 'P=Present, A=Absent, OT=Overtime, PH=Public Holiday, ML=Medical Leave, OD=On Duty',
  `hours` DECIMAL(4, 2) NULL COMMENT 'Optional hours for OT or custom shifts',
  `source` ENUM('EXCEL', 'UI') NOT NULL,
  `source_file_id` INT NULL COMMENT 'Reference to uploaded Excel file',
  `created_by` VARCHAR(255) NULL COMMENT 'User ID or email',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`source_file_id`) REFERENCES `excel_uploads`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  UNIQUE KEY `unique_employee_site_date` (`employee_id`, `site_id`, `date`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_site_id` (`site_id`),
  INDEX `idx_date` (`date`),
  INDEX `idx_source` (`source`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: payroll
-- Purpose: Derived payroll data (NEVER manually edited)
-- ============================================
CREATE TABLE IF NOT EXISTS `payroll` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payroll_id` VARCHAR(100) NOT NULL UNIQUE,
  `employee_id` INT NOT NULL,
  `year` INT NOT NULL,
  `month` INT NOT NULL COMMENT '1-12',
  `paid_days` INT NOT NULL COMMENT 'Derived from attendance events',
  `ot_count` INT NOT NULL COMMENT 'Count of OT days',
  `daily_rate` DECIMAL(10, 2) NOT NULL,
  `salary` DECIMAL(10, 2) NOT NULL COMMENT 'paid_days × daily_rate',
  `ot_amount` DECIMAL(10, 2) NOT NULL COMMENT 'ot_count × ot_rate',
  `net_salary` DECIMAL(10, 2) NOT NULL COMMENT 'salary + ot_amount',
  `rule_version` VARCHAR(50) NOT NULL COMMENT 'Audit: rule version used',
  `calculated_at` TIMESTAMP NOT NULL COMMENT 'Audit: calculation timestamp',
  `calculated_by` VARCHAR(255) NULL COMMENT 'Audit: user who triggered calculation',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_employee_year_month` (`employee_id`, `year`, `month`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_year_month` (`year`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: productivity
-- Purpose: Derived productivity data
-- ============================================
CREATE TABLE IF NOT EXISTS `productivity` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `productivity_id` VARCHAR(100) NOT NULL UNIQUE,
  `employee_id` INT NOT NULL,
  `site_id` INT NOT NULL,
  `year` INT NOT NULL,
  `month` INT NOT NULL COMMENT '1-12',
  `productivity_days` INT NOT NULL COMMENT 'Count based on productivityStatuses',
  `productivity_rate` DECIMAL(10, 2) NOT NULL,
  `productivity_amount` DECIMAL(10, 2) NOT NULL COMMENT 'productivity_days × productivity_rate',
  `rule_version` VARCHAR(50) NOT NULL COMMENT 'Audit: rule version used',
  `calculated_at` TIMESTAMP NOT NULL COMMENT 'Audit: calculation timestamp',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`site_id`) REFERENCES `sites`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_employee_site_year_month` (`employee_id`, `site_id`, `year`, `month`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_site_id` (`site_id`),
  INDEX `idx_year_month` (`year`, `month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: month_locks
-- Purpose: Month locking status for payroll integrity
-- ============================================
CREATE TABLE IF NOT EXISTS `month_locks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lock_id` VARCHAR(100) NOT NULL UNIQUE,
  `year` INT NOT NULL,
  `month` INT NOT NULL COMMENT '1-12',
  `is_locked` BOOLEAN DEFAULT FALSE,
  `locked_by` VARCHAR(255) NULL,
  `locked_at` TIMESTAMP NULL,
  `unlocked_by` VARCHAR(255) NULL,
  `unlock_reason` TEXT NULL,
  `unlocked_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_year_month` (`year`, `month`),
  INDEX `idx_year_month` (`year`, `month`),
  INDEX `idx_is_locked` (`is_locked`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

