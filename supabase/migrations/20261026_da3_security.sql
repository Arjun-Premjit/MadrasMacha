-- ============================================================================
-- Madras Macha — DA 3 Question 2 Security Migration
-- Migration: 20261026_da3_security.sql
-- Description: Creates persistent auth store (app_users) and role-protected
--              transit service alerts (transit_service_alerts) with strict RLS.
-- ============================================================================

-- 1. Create app_users table for persistent centralized authentication across all replicas
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL, -- bcrypt hash ($2a$ or $2b$)
    role VARCHAR(50) NOT NULL DEFAULT 'commuter' CHECK (role IN ('commuter', 'transit_admin')),
    mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    mfa_secret TEXT,                     -- AES-256-GCM encrypted TOTP secret
    mfa_secret_iv VARCHAR(64),           -- Hex-encoded IV for AES-GCM
    mfa_secret_tag VARCHAR(64),          -- Hex-encoded Auth Tag for AES-GCM
    legacy_source VARCHAR(50),           -- 'scrypt_migrated' or 'native_bcrypt'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- Index frequently queried lookup fields
CREATE INDEX IF NOT EXISTS idx_app_users_email ON public.app_users(LOWER(email));
CREATE INDEX IF NOT EXISTS idx_app_users_username ON public.app_users(LOWER(username));

-- 2. Strict Row Level Security (RLS) for app_users
-- Browser / public anonymous clients must NEVER read, query, or modify user account records.
-- Only the trusted backend using the PostgreSQL service-role key may query this table.
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Explicitly revoke public/anon access
REVOKE ALL ON public.app_users FROM anon;
REVOKE ALL ON public.app_users FROM authenticated;

-- Ensure service_role has full management privileges
GRANT ALL ON public.app_users TO service_role;

-- 3. Create transit_service_alerts table for operational transit disruption management
CREATE TABLE IF NOT EXISTS public.transit_service_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'severe')),
    route_id VARCHAR(100),               -- Associated GTFS route_id (e.g. '18751', 'CMRL_1', '21G')
    affected_stations TEXT[] DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.app_users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transit_alerts_active ON public.transit_service_alerts(active);
CREATE INDEX IF NOT EXISTS idx_transit_alerts_route ON public.transit_service_alerts(route_id);

-- 4. Row Level Security (RLS) for transit_service_alerts
ALTER TABLE public.transit_service_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access: Anyone (including unauthenticated commuters) may view active alerts
CREATE POLICY "Public commuters can read active transit service alerts"
    ON public.transit_service_alerts
    FOR SELECT
    USING (active = true);

-- Modifying operations (INSERT, UPDATE, DELETE) are strictly forbidden to public/anon
-- Only the trusted Express backend with service_role can modify alerts after verifying transit_admin role + TOTP
REVOKE INSERT, UPDATE, DELETE ON public.transit_service_alerts FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.transit_service_alerts FROM authenticated;
GRANT ALL ON public.transit_service_alerts TO service_role;

-- 5. Seed initial verification service alert for Chennai transit
INSERT INTO public.transit_service_alerts (id, title, description, severity, route_id, affected_stations, active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Anna Salai Metro Corridor Track Maintenance',
    'Scheduled maintenance between Nandanam and Guindy stations. 10-minute headway in effect.',
    'warning',
    'CMRL_1',
    ARRAY['Nandanam', 'Saidapet', 'Little Mount', 'Guindy'],
    true
) ON CONFLICT (id) DO NOTHING;
