-- ============================================================
-- Satark Nepal - Supabase Database Schema
-- PostgreSQL / Supabase
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- Extends Supabase Auth users
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    language TEXT DEFAULT 'en'
        CHECK (language IN ('en', 'np')),
    role TEXT DEFAULT 'citizen'
        CHECK (role IN ('citizen', 'volunteer', 'admin', 'coordinator')),
    satark_points INTEGER DEFAULT 0,
    is_volunteer BOOLEAN DEFAULT FALSE,
    rank TEXT DEFAULT 'Newcomer',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. DISASTER REPORTS
-- ============================================================

CREATE TABLE IF NOT EXISTS disaster_reports (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    user_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    category TEXT NOT NULL
        CHECK (
            category IN (
                'flood',
                'landslide',
                'earthquake',
                'fire',
                'storm',
                'medical',
                'building',
                'road',
                'other'
            )
        ),

    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,

    severity TEXT DEFAULT 'urgent'
        CHECK (
            severity IN (
                'critical',
                'urgent',
                'non-critical'
            )
        ),

    verified BOOLEAN DEFAULT FALSE,

    status TEXT DEFAULT 'NEW'
        CHECK (
            status IN (
                'NEW',
                'UNDER REVIEW',
                'VERIFIED',
                'RESPONDING',
                'RESOLVED'
            )
        ),

    trust_level TEXT DEFAULT 'MEDIUM'
        CHECK (
            trust_level IN (
                'HIGH',
                'MEDIUM',
                'LOW'
            )
        ),

    media_url TEXT,

    media_type TEXT
        CHECK (
            media_type IN (
                'photo',
                'video',
                'audio'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. RELIEF REQUESTS
-- ============================================================

CREATE TABLE IF NOT EXISTS relief_requests (
    id TEXT PRIMARY KEY,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    contact_phone TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,

    category TEXT NOT NULL
        CHECK (
            category IN (
                'food',
                'water',
                'medicine',
                'shelter',
                'rescue',
                'transport',
                'other'
            )
        ),

    location TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    people_affected INTEGER DEFAULT 0,

    status TEXT DEFAULT 'NEEDED'
        CHECK (
            status IN (
                'NEEDED',
                'ASSIGNED',
                'IN PROGRESS',
                'COMPLETED'
            )
        ),

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. HELP RECORDS
-- ============================================================

CREATE TABLE IF NOT EXISTS help_records (
    id TEXT PRIMARY KEY,

    relief_request_id TEXT
        REFERENCES relief_requests(id)
        ON DELETE CASCADE,

    volunteer_id UUID
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    status TEXT DEFAULT 'REGISTERED'
        CHECK (
            status IN (
                'REGISTERED',
                'IN_PROGRESS',
                'PENDING_VERIFICATION',
                'VERIFIED',
                'REJECTED'
            )
        ),

    registered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,

    verified_by UUID
        REFERENCES profiles(id)
        ON DELETE SET NULL,

    points_awarded INTEGER DEFAULT 0,

    UNIQUE(relief_request_id, volunteer_id)
);

-- ============================================================
-- 5. SOS ALERTS
-- ============================================================

CREATE TABLE IF NOT EXISTS sos_alerts (
    id TEXT PRIMARY KEY,

    user_id UUID
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    status TEXT DEFAULT 'ACTIVE'
        CHECK (
            status IN (
                'ACTIVE',
                'RESOLVED',
                'CANCELLED'
            )
        ),

    location_source TEXT DEFAULT 'unavailable'
        CHECK (
            location_source IN (
                'gps',
                'manual',
                'unavailable'
            )
        ),

    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ
);

-- ============================================================
-- 6. SATARK POINTS TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS satark_points_transactions (
    id TEXT PRIMARY KEY,

    user_id UUID
        REFERENCES profiles(id)
        ON DELETE CASCADE,

    points INTEGER NOT NULL,
    reason TEXT NOT NULL,

    reference_type TEXT
        CHECK (
            reference_type IN (
                'report',
                'volunteer',
                'relief',
                'verification',
                'preparedness',
                'admin'
            )
        ),

    reference_id TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- PostgreSQL indexes must be created separately
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_disaster_reports_verified_status
    ON disaster_reports (verified, status);

CREATE INDEX IF NOT EXISTS idx_disaster_reports_created_at
    ON disaster_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_disaster_reports_location
    ON disaster_reports (latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_relief_requests_status
    ON relief_requests (status);

CREATE INDEX IF NOT EXISTS idx_relief_requests_created_at
    ON relief_requests (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_help_records_volunteer
    ON help_records (volunteer_id);

CREATE INDEX IF NOT EXISTS idx_help_records_relief_request
    ON help_records (relief_request_id);

CREATE INDEX IF NOT EXISTS idx_help_records_status
    ON help_records (status);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_user_status
    ON sos_alerts (user_id, status);

CREATE INDEX IF NOT EXISTS idx_sos_alerts_created_at
    ON sos_alerts (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_points_transactions_user
    ON satark_points_transactions (user_id);

CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at
    ON satark_points_transactions (created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE relief_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE satark_points_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- DROP EXISTING POLICIES
-- Makes this script safer to rerun during development
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can view profiles"
    ON profiles;

DROP POLICY IF EXISTS "Users can create own profile"
    ON profiles;

DROP POLICY IF EXISTS "Users can update own profile"
    ON profiles;

DROP POLICY IF EXISTS "Public can view disaster reports"
    ON disaster_reports;

DROP POLICY IF EXISTS "Users can create reports"
    ON disaster_reports;

DROP POLICY IF EXISTS "Public can view relief requests"
    ON relief_requests;

DROP POLICY IF EXISTS "Users can create relief requests"
    ON relief_requests;

DROP POLICY IF EXISTS "Public can view help records"
    ON help_records;

DROP POLICY IF EXISTS "Users can view own SOS alerts"
    ON sos_alerts;

DROP POLICY IF EXISTS "Users can create SOS alerts"
    ON sos_alerts;

DROP POLICY IF EXISTS "Users can update own SOS alerts"
    ON sos_alerts;

DROP POLICY IF EXISTS "Authenticated users can view points transactions"
    ON satark_points_transactions;

-- ============================================================
-- PROFILES POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================================
-- DISASTER REPORT POLICIES
-- ============================================================

CREATE POLICY "Public can view disaster reports"
ON disaster_reports
FOR SELECT
USING (true);

CREATE POLICY "Users can create reports"
ON disaster_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- RELIEF REQUEST POLICIES
-- ============================================================

CREATE POLICY "Public can view relief requests"
ON relief_requests
FOR SELECT
USING (true);

CREATE POLICY "Users can create relief requests"
ON relief_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- ============================================================
-- HELP RECORD POLICIES
-- ============================================================

CREATE POLICY "Public can view help records"
ON help_records
FOR SELECT
USING (true);

-- ============================================================
-- SOS POLICIES
-- ============================================================

CREATE POLICY "Users can view own SOS alerts"
ON sos_alerts
FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id
    OR auth.role() = 'service_role'
);

CREATE POLICY "Users can create SOS alerts"
ON sos_alerts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own SOS alerts"
ON sos_alerts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- POINTS TRANSACTION POLICIES
-- ============================================================

CREATE POLICY "Authenticated users can view points transactions"
ON satark_points_transactions
FOR SELECT
TO authenticated
USING (true);

-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS update_profiles_updated_at
    ON profiles;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_disaster_reports_updated_at
    ON disaster_reports;

CREATE TRIGGER update_disaster_reports_updated_at
BEFORE UPDATE ON disaster_reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();


DROP TRIGGER IF EXISTS update_relief_requests_updated_at
    ON relief_requests;

CREATE TRIGGER update_relief_requests_updated_at
BEFORE UPDATE ON relief_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();