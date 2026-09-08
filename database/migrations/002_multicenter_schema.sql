-- ============================================================================
-- SIH25018 Nabha Rural Telemedicine Platform - Database Migration 002
-- Multi-Center Operational Hierarchy & Human-Readable Patient Identifiers
-- ============================================================================

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Health Centers Table (PHC / CHC / Sub-Center)
CREATE TABLE IF NOT EXISTS health_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    center_type VARCHAR(50) NOT NULL DEFAULT 'PHC' CHECK (center_type IN ('PHC', 'CHC', 'SUB_CENTER', 'DISTRICT_HOSPITAL')),
    district VARCHAR(100) NOT NULL DEFAULT 'Patiala',
    tehsil VARCHAR(100) NOT NULL DEFAULT 'Nabha',
    village VARCHAR(100) NOT NULL,
    contact_phone VARCHAR(20),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Villages Table
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    population INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Health Center Assignments Table
CREATE TABLE IF NOT EXISTS user_center_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    health_center_id UUID NOT NULL REFERENCES health_centers(id) ON DELETE CASCADE,
    role_in_center VARCHAR(50) DEFAULT 'STAFF',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, health_center_id)
);

-- 5. Add Human-Friendly Patient Code and Health Center Foreign Keys to Core Tables
ALTER TABLE patients ADD COLUMN IF NOT EXISTS patient_code VARCHAR(20) UNIQUE;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS health_center_id UUID REFERENCES health_centers(id) ON DELETE SET NULL;

-- Indexes for Multi-Center Performance
CREATE INDEX IF NOT EXISTS idx_patients_patient_code ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_center ON patients(health_center_id);
CREATE INDEX IF NOT EXISTS idx_consultations_center ON consultations(health_center_id);
CREATE INDEX IF NOT EXISTS idx_user_assignments ON user_center_assignments(user_id, health_center_id);
