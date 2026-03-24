CREATE DATABASE IF NOT EXISTS eprovider;
USE eprovider;

-- =========================================================
-- EProvider - MariaDB Schema v1
-- Purpose: convert current browser-based prototype into
--          a real relational database structure
-- =========================================================

-- Optional: safer charset
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- 1. EMPLOYEES
-- =========================================================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    role_title VARCHAR(255) NULL,
    department VARCHAR(255) NULL,
    location VARCHAR(255) NULL,
    availability_percent DECIMAL(5,2) NOT NULL DEFAULT 100.00,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_employees_full_name ON employees(full_name);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_active ON employees(active);

-- =========================================================
-- 2. SERVICES
-- =========================================================
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_code VARCHAR(50) NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NULL,
    criticality ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    min_qualified INT NOT NULL DEFAULT 1,
    preferred_qualified INT NOT NULL DEFAULT 2,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_criticality ON services(criticality);
CREATE INDEX idx_services_active ON services(active);

-- =========================================================
-- 3. SYSTEMS
-- =========================================================
CREATE TABLE IF NOT EXISTS systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    system_code VARCHAR(50) NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NULL,
    business_owner VARCHAR(255) NULL,
    technical_owner VARCHAR(255) NULL,
    environment ENUM('DEV', 'TEST', 'UAT', 'PROD', 'OTHER') NOT NULL DEFAULT 'PROD',
    sensitivity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_systems_name ON systems(name);
CREATE INDEX idx_systems_environment ON systems(environment);
CREATE INDEX idx_systems_sensitivity ON systems(sensitivity);
CREATE INDEX idx_systems_active ON systems(active);

-- =========================================================
-- 4. SERVICE_REQUIRED_SYSTEMS
-- Many-to-many: which systems are required for a service
-- =========================================================
CREATE TABLE IF NOT EXISTS service_required_systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    system_id INT NOT NULL,
    order_index INT NOT NULL DEFAULT 1,
    required_level ENUM('OPTIONAL', 'RECOMMENDED', 'REQUIRED', 'CRITICAL') NOT NULL DEFAULT 'REQUIRED',
    notes TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_srs_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_srs_system
        FOREIGN KEY (system_id) REFERENCES systems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_service_system UNIQUE (service_id, system_id)
);

CREATE INDEX idx_srs_service_id ON service_required_systems(service_id);
CREATE INDEX idx_srs_system_id ON service_required_systems(system_id);
CREATE INDEX idx_srs_required_level ON service_required_systems(required_level);

-- =========================================================
-- 5. QUALIFICATIONS
-- Employee qualification per system
-- =========================================================
CREATE TABLE IF NOT EXISTS qualifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    system_id INT NOT NULL,

    experience_score INT NOT NULL DEFAULT 0,
    certification_points INT NOT NULL DEFAULT 0,
    knowledge_score INT NOT NULL DEFAULT 0,
    total_score INT NOT NULL DEFAULT 0,

    qualification_level ENUM('NONE', 'BASIC', 'QUALIFIED', 'FULLY_CAPABLE', 'EXPERT') NOT NULL DEFAULT 'NONE',

    entry_date DATE NULL,
    review_due_date DATE NULL,
    is_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
    last_reviewed_at DATETIME NULL,

    notes TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_qual_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_qual_system
        FOREIGN KEY (system_id) REFERENCES systems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_employee_system_qualification UNIQUE (employee_id, system_id)
);

CREATE INDEX idx_qual_employee_id ON qualifications(employee_id);
CREATE INDEX idx_qual_system_id ON qualifications(system_id);
CREATE INDEX idx_qual_total_score ON qualifications(total_score);
CREATE INDEX idx_qual_level ON qualifications(qualification_level);
CREATE INDEX idx_qual_review_due_date ON qualifications(review_due_date);

-- =========================================================
-- 6. ACCESS_REVIEWS
-- Access and access review status per employee/system
-- =========================================================
CREATE TABLE IF NOT EXISTS access_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    system_id INT NOT NULL,

    access_type ENUM('NONE', 'READ', 'WRITE', 'ADMIN', 'OTHER') NOT NULL DEFAULT 'NONE',
    requested BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,

    reviewed_at DATETIME NULL,
    review_due_date DATE NULL,

    notes TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_access_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_access_system
        FOREIGN KEY (system_id) REFERENCES systems(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_employee_system_access UNIQUE (employee_id, system_id)
);

CREATE INDEX idx_access_employee_id ON access_reviews(employee_id);
CREATE INDEX idx_access_system_id ON access_reviews(system_id);
CREATE INDEX idx_access_review_due_date ON access_reviews(review_due_date);
CREATE INDEX idx_access_type ON access_reviews(access_type);

-- =========================================================
-- 7. ACTIONS
-- Follow-up / mitigation / task tracking
-- Can be linked to service, employee, system (all optional)
-- =========================================================
CREATE TABLE IF NOT EXISTS actions (
    id INT AUTO_INCREMENT PRIMARY KEY,

    service_id INT NULL,
    employee_id INT NULL,
    system_id INT NULL,

    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    owner_name VARCHAR(255) NULL,

    status ENUM('OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',

    due_date DATE NULL,
    completed_at DATETIME NULL,

    notes TEXT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_actions_service
        FOREIGN KEY (service_id) REFERENCES services(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_actions_employee
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    CONSTRAINT fk_actions_system
        FOREIGN KEY (system_id) REFERENCES systems(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
);

CREATE INDEX idx_actions_service_id ON actions(service_id);
CREATE INDEX idx_actions_employee_id ON actions(employee_id);
CREATE INDEX idx_actions_system_id ON actions(system_id);
CREATE INDEX idx_actions_status ON actions(status);
CREATE INDEX idx_actions_priority ON actions(priority);
CREATE INDEX idx_actions_due_date ON actions(due_date);

-- =========================================================
-- 8. APP_CONFIG
-- Config values for scoring weights / thresholds / settings
-- =========================================================
CREATE TABLE IF NOT EXISTS app_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    value_type ENUM('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON') NOT NULL DEFAULT 'STRING',
    description TEXT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_app_config_key ON app_config(config_key);

-- =========================================================
-- DEFAULT CONFIG VALUES
-- These mirror the prototype idea of weighted scoring
-- =========================================================
INSERT INTO app_config (config_key, config_value, value_type, description)
VALUES
    ('weight_competence', '0.40', 'DECIMAL', 'Weight for competence in maturity/risk scoring'),
    ('weight_access', '0.20', 'DECIMAL', 'Weight for access readiness in maturity/risk scoring'),
    ('weight_redundancy', '0.25', 'DECIMAL', 'Weight for redundancy / backup coverage'),
    ('weight_training', '0.15', 'DECIMAL', 'Weight for training / review readiness'),
    ('threshold_fully_capable', '10', 'INTEGER', 'Minimum total score for fully capable'),
    ('threshold_expert', '14', 'INTEGER', 'Minimum total score for expert'),
    ('review_window_days', '30', 'INTEGER', 'Default review reminder window in days')
ON DUPLICATE KEY UPDATE
    config_value = VALUES(config_value),
    value_type = VALUES(value_type),
    description = VALUES(description);

SET FOREIGN_KEY_CHECKS = 1;