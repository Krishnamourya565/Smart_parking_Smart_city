-- ====================================================================
-- SMART PARKING & PRIORITY EV ALLOCATION SYSTEM
-- MIGRATION V2: Zero-Data-Loss Architecture Restructure + Strict RLS
-- ====================================================================

BEGIN;

-- -------------------------------------------------------------
-- STEP 1: SAFELY RENAME OLD TABLES (BACKUPS PRESERVED)
-- -------------------------------------------------------------
DO $$
BEGIN
  -- Rename customers -> customers_old
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers')
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers_old') THEN
    ALTER TABLE public.customers RENAME TO customers_old;
  END IF;

  -- Rename parking_sessions -> parking_sessions_old
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parking_sessions')
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parking_sessions_old') THEN
    ALTER TABLE public.parking_sessions RENAME TO parking_sessions_old;
  END IF;

  -- Rename reports -> reports_old
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports')
     AND NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports_old') THEN
    ALTER TABLE public.reports RENAME TO reports_old;
  END IF;
END $$;

-- -------------------------------------------------------------
-- STEP 2: CREATE ADMIN ALLOWLIST TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_allowlist (
    email TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin emails (Add your admin email here)
INSERT INTO public.admin_allowlist (email) VALUES
('admin@urban.gov'),
('admin@example.com'),
('krishnamourya565@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- -------------------------------------------------------------
-- STEP 3: CREATE PROFILES TABLE (Replaces customers)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically sync auth.users -> profiles with role from admin_allowlist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role TEXT := 'user';
BEGIN
    IF EXISTS (SELECT 1 FROM public.admin_allowlist WHERE LOWER(email) = LOWER(NEW.email)) THEN
        assigned_role := 'admin';
    END IF;

    INSERT INTO public.profiles (id, full_name, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        assigned_role
    )
    ON CONFLICT (id) DO UPDATE SET
        role = assigned_role,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------
-- STEP 4: CREATE VEHICLES TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plate TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EV', 'ICE')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- STEP 5: CREATE PARKING LOCATIONS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parking_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default location
INSERT INTO public.parking_locations (id, name, lat, lng) VALUES
('00000000-0000-0000-0000-000000000001', 'Central Urban Facility (Sector 4)', 18.5204, 73.8567)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------
-- STEP 6: CREATE PARKING BAYS TABLE & SEED 30 BAYS
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parking_bays (
    id TEXT PRIMARY KEY, -- e.g. 'EV01'
    location_id UUID NOT NULL REFERENCES public.parking_locations(id) ON DELETE CASCADE,
    bay_type TEXT NOT NULL CHECK (bay_type IN ('regular', 'EV')),
    status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved', 'faulty')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed all 30 parking bays (6 EV bays, 24 regular bays)
INSERT INTO public.parking_bays (id, location_id, bay_type, status) VALUES
-- 6 EV Bays
('EV01', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
('EV02', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
('EV03', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
('EV04', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
('EV05', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
('EV06', '00000000-0000-0000-0000-000000000001', 'EV', 'free'),
-- 24 Regular Bays
('R01', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R02', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R03', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R04', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R05', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R06', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R07', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R08', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R09', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R10', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R11', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R12', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R13', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R14', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R15', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R16', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R17', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R18', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R19', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R20', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R21', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R22', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R23', '00000000-0000-0000-0000-000000000001', 'regular', 'free'),
('R24', '00000000-0000-0000-0000-000000000001', 'regular', 'free')
ON CONFLICT (id) DO UPDATE SET location_id = EXCLUDED.location_id, bay_type = EXCLUDED.bay_type;

-- -------------------------------------------------------------
-- STEP 7: CREATE PARKING SESSIONS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.parking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    bay_id TEXT REFERENCES public.parking_bays(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'en_route' CHECK (status IN ('en_route', 'parked', 'exiting', 'completed')),
    kwh NUMERIC(8, 2) DEFAULT 0.00,
    fee NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- -------------------------------------------------------------
-- STEP 8: CREATE SESSION EVENTS TABLE (One row per status change)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.session_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.parking_sessions(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('en_route', 'parked', 'exiting', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- STEP 9: CREATE REPORTS TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    bay_id TEXT REFERENCES public.parking_bays(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Resolved')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- STEP 10: CREATE USER PRESENCE TABLE
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_presence (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
-- STEP 11: DATA MIGRATION — COPY DATA WITHOUT LOSING ANYTHING
-- -------------------------------------------------------------
DO $$
BEGIN
    -- 1. Ensure all old customers have an auth.users record so profiles FK succeeds
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers_old') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        )
        SELECT
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            c.email,
            crypt(COALESCE(c.password, 'password123'), gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('name', c.name, 'vehicle_plate', c.vehicle_plate, 'phone', c.phone),
            COALESCE(c.registered_at, NOW()),
            NOW()
        FROM customers_old c
        WHERE c.email IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM auth.users u WHERE LOWER(u.email) = LOWER(c.email)
        );

        -- 2. Populate profiles from customers_old + auth.users
        INSERT INTO public.profiles (id, full_name, phone, role, created_at)
        SELECT 
            u.id,
            COALESCE(c.name, split_part(c.email, '@', 1)),
            COALESCE(c.phone, ''),
            CASE WHEN EXISTS (SELECT 1 FROM public.admin_allowlist a WHERE LOWER(a.email) = LOWER(c.email)) THEN 'admin' ELSE 'user' END,
            COALESCE(c.registered_at, NOW())
        FROM customers_old c
        JOIN auth.users u ON LOWER(u.email) = LOWER(c.email)
        ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = EXCLUDED.phone;

        -- 3. Populate vehicles from customers_old
        INSERT INTO public.vehicles (owner_id, plate, type)
        SELECT 
            u.id,
            c.vehicle_plate,
            CASE WHEN c.vehicle_type ILIKE '%EV%' THEN 'EV' ELSE 'ICE' END
        FROM customers_old c
        JOIN auth.users u ON LOWER(u.email) = LOWER(c.email)
        WHERE c.vehicle_plate IS NOT NULL
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. Copy parking_sessions_old -> parking_sessions
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'parking_sessions_old') THEN
        INSERT INTO public.parking_sessions (user_id, vehicle_id, bay_id, status, kwh, fee, created_at, completed_at)
        SELECT 
            p.id AS user_id,
            v.id AS vehicle_id,
            COALESCE(pb.id, 'EV01') AS bay_id,
            CASE 
                WHEN LOWER(so.status) IN ('en_route', 'parked', 'exiting', 'completed') THEN LOWER(so.status)
                WHEN LOWER(so.status) = 'active' THEN 'parked'
                ELSE 'completed'
            END AS status,
            COALESCE(so.energy_kwh, 0.00),
            COALESCE(so.amount_paid, 0.00),
            COALESCE(so.entry_time, NOW()),
            so.exit_time
        FROM parking_sessions_old so
        LEFT JOIN customers_old co ON so.customer_id = co.id
        LEFT JOIN auth.users u ON LOWER(u.email) = LOWER(co.email)
        LEFT JOIN profiles p ON p.id = u.id
        LEFT JOIN vehicles v ON v.owner_id = p.id
        LEFT JOIN parking_bays pb ON pb.id = so.spot_id;

        -- Seed initial session_events from the migrated sessions
        INSERT INTO public.session_events (session_id, status, created_at)
        SELECT id, status, created_at FROM public.parking_sessions;
    END IF;

    -- 5. Copy reports_old -> reports
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports_old') THEN
        INSERT INTO public.reports (user_id, bay_id, category, status, description, created_at)
        SELECT 
            p.id AS user_id,
            COALESCE(pb.id, 'EV01') AS bay_id,
            COALESCE(ro.category, 'General'),
            COALESCE(ro.status, 'Pending'),
            COALESCE(ro.description, ro.title, 'Customer incident ticket'),
            COALESCE(ro.submitted_at, NOW())
        FROM reports_old ro
        LEFT JOIN customers_old co ON ro.customer_id = co.id
        LEFT JOIN auth.users u ON LOWER(u.email) = LOWER(co.email)
        LEFT JOIN profiles p ON p.id = u.id
        LEFT JOIN parking_bays pb ON pb.id = ro.spot_id;
    END IF;
END $$;

-- -------------------------------------------------------------
-- STEP 12: ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- 1. profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 2. vehicles
DROP POLICY IF EXISTS "vehicles_all_policy" ON public.vehicles;
CREATE POLICY "vehicles_all_policy" ON public.vehicles
    FOR ALL USING (owner_id = auth.uid() OR public.is_admin())
    WITH CHECK (owner_id = auth.uid() OR public.is_admin());

-- 3. parking_locations (public read, admin write)
DROP POLICY IF EXISTS "parking_locations_select" ON public.parking_locations;
CREATE POLICY "parking_locations_select" ON public.parking_locations
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "parking_locations_admin_modify" ON public.parking_locations;
CREATE POLICY "parking_locations_admin_modify" ON public.parking_locations
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. parking_bays (public read, authenticated/admin write)
DROP POLICY IF EXISTS "parking_bays_select" ON public.parking_bays;
CREATE POLICY "parking_bays_select" ON public.parking_bays
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "parking_bays_modify" ON public.parking_bays;
CREATE POLICY "parking_bays_modify" ON public.parking_bays
    FOR ALL USING (auth.role() = 'authenticated' OR public.is_admin())
    WITH CHECK (auth.role() = 'authenticated' OR public.is_admin());

-- 5. parking_sessions
DROP POLICY IF EXISTS "parking_sessions_all" ON public.parking_sessions;
CREATE POLICY "parking_sessions_all" ON public.parking_sessions
    FOR ALL USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 6. session_events
DROP POLICY IF EXISTS "session_events_select" ON public.session_events;
CREATE POLICY "session_events_select" ON public.session_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.parking_sessions s 
            WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin())
        )
    );

DROP POLICY IF EXISTS "session_events_insert" ON public.session_events;
CREATE POLICY "session_events_insert" ON public.session_events
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.parking_sessions s 
            WHERE s.id = session_id AND (s.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 7. reports
DROP POLICY IF EXISTS "reports_select" ON public.reports;
CREATE POLICY "reports_select" ON public.reports
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
    FOR INSERT WITH CHECK (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "reports_update" ON public.reports;
CREATE POLICY "reports_update" ON public.reports
    FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. user_presence
DROP POLICY IF EXISTS "user_presence_select" ON public.user_presence;
CREATE POLICY "user_presence_select" ON public.user_presence
    FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "user_presence_upsert" ON public.user_presence;
CREATE POLICY "user_presence_upsert" ON public.user_presence
    FOR ALL USING (user_id = auth.uid() OR public.is_admin())
    WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- 9. admin_allowlist
DROP POLICY IF EXISTS "admin_allowlist_admin_only" ON public.admin_allowlist;
CREATE POLICY "admin_allowlist_admin_only" ON public.admin_allowlist
    FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

COMMIT;
