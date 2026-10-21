-- ====================================================================
-- SMART PARKING — CLEANUP & REAL-TIME RUNTIME SYNC RESET
-- Run this in Supabase SQL Editor to clear any fake/mock rows
-- and prepare your database for live runtime data from Vercel!
-- ====================================================================

-- 1. CLEAR FAKE DATASETS
TRUNCATE TABLE parking_sessions CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE customers CASCADE;

-- 2. RESET ALL 30 PARKING SPOTS TO FREE & UNRESERVED
UPDATE spots 
SET status = 'free', 
    is_faulty = FALSE, 
    occupied_by = NULL, 
    reserved_until = NULL,
    updated_at = NOW();

-- 3. ENSURE RLS IS DISABLED & PERMISSIVE POLICIES ACTIVE
ALTER TABLE spots DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parking_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public spots access" ON spots;
CREATE POLICY "Public spots access" ON spots FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public customers access" ON customers;
CREATE POLICY "Public customers access" ON customers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public parking_sessions access" ON parking_sessions;
CREATE POLICY "Public parking_sessions access" ON parking_sessions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public reports access" ON reports;
CREATE POLICY "Public reports access" ON reports FOR ALL USING (true) WITH CHECK (true);

-- 4. CONFIRM CLEAN SYSTEM STATUS
SELECT 'spots' AS table_name, count(*) AS total_rows FROM spots
UNION ALL
SELECT 'customers', count(*) FROM customers
UNION ALL
SELECT 'parking_sessions', count(*) FROM parking_sessions
UNION ALL
SELECT 'reports', count(*) FROM reports;
