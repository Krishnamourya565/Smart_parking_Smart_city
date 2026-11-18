-- =========================================================================
-- FIX RLS POLICIES FOR SUPABASE V2
-- Run this in Supabase SQL Editor: Dashboard -> SQL Editor -> New Query -> Run
-- =========================================================================

-- 1. PROFILES (Allow SELECT, INSERT, UPDATE for all users & server)
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_all_policy" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE USING (true) WITH CHECK (true);

-- 2. VEHICLES (Allow SELECT, INSERT, UPDATE for all users & server)
DROP POLICY IF EXISTS "vehicles_all_policy" ON public.vehicles;
CREATE POLICY "vehicles_all_policy" ON public.vehicles
    FOR ALL USING (true) WITH CHECK (true);

-- 3. REPORTS (Allow any user or driver to submit reports, and read reports)
DROP POLICY IF EXISTS "reports_select" ON public.reports;
DROP POLICY IF EXISTS "reports_insert" ON public.reports;
DROP POLICY IF EXISTS "reports_update" ON public.reports;
DROP POLICY IF EXISTS "reports_all" ON public.reports;

CREATE POLICY "reports_select" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "reports_insert" ON public.reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "reports_update" ON public.reports
    FOR UPDATE USING (true) WITH CHECK (true);

-- 4. USER_PRESENCE (Allow live heartbeat updates from active sessions)
DROP POLICY IF EXISTS "user_presence_select" ON public.user_presence;
DROP POLICY IF EXISTS "user_presence_all" ON public.user_presence;

CREATE POLICY "user_presence_all" ON public.user_presence
    FOR ALL USING (true) WITH CHECK (true);

-- 5. PARKING_SESSIONS (Allow active sessions to be written & read)
DROP POLICY IF EXISTS "parking_sessions_all" ON public.parking_sessions;
CREATE POLICY "parking_sessions_all" ON public.parking_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- 6. SESSION_EVENTS (Allow session status transitions to be logged)
DROP POLICY IF EXISTS "session_events_select" ON public.session_events;
DROP POLICY IF EXISTS "session_events_insert" ON public.session_events;
DROP POLICY IF EXISTS "session_events_all" ON public.session_events;

CREATE POLICY "session_events_all" ON public.session_events
    FOR ALL USING (true) WITH CHECK (true);

-- 7. PARKING_BAYS & LOCATIONS (Ensure bays and locations are publicly readable and updatable)
DROP POLICY IF EXISTS "parking_bays_select" ON public.parking_bays;
DROP POLICY IF EXISTS "parking_bays_modify" ON public.parking_bays;
DROP POLICY IF EXISTS "parking_bays_all" ON public.parking_bays;

CREATE POLICY "parking_bays_all" ON public.parking_bays
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "parking_locations_select" ON public.parking_locations;
DROP POLICY IF EXISTS "parking_locations_admin_modify" ON public.parking_locations;
DROP POLICY IF EXISTS "parking_locations_all" ON public.parking_locations;

CREATE POLICY "parking_locations_all" ON public.parking_locations
    FOR ALL USING (true) WITH CHECK (true);

-- 8. ADMIN_ALLOWLIST (Allow verification)
DROP POLICY IF EXISTS "admin_allowlist_select" ON public.admin_allowlist;
DROP POLICY IF EXISTS "admin_allowlist_all" ON public.admin_allowlist;

CREATE POLICY "admin_allowlist_all" ON public.admin_allowlist
    FOR ALL USING (true) WITH CHECK (true);
