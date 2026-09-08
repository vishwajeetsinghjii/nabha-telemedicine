-- ============================================================================
-- SIH25018 Nabha Rural Telemedicine Platform - Database Migration 003
-- Onboarding Schema, Doctor Applications & Account Status Lifecycle
-- ============================================================================

-- 1. Add Account Status Column to Users Table
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' 
    CHECK (account_status IN ('PENDING', 'UNDER_REVIEW', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED'));

-- 2. Doctor Applications Table
CREATE TABLE IF NOT EXISTS doctor_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    experience_years INT NOT NULL DEFAULT 0,
    preferred_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED')),
    reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Application Lookup
CREATE INDEX IF NOT EXISTS idx_doctor_apps_status ON doctor_applications(status);
CREATE INDEX IF NOT EXISTS idx_doctor_apps_license ON doctor_applications(license_number);
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
